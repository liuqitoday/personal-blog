---
author: Freddy
pubDatetime: 2026-10-20T00:00:00.000Z
title: "Chrome 扩展读不到登录 Cookie：MV3 凭据同步踩坑记"
tags:
  - "浏览器扩展"
  - "Chrome"
  - "调试"
description: "一个 MV3 扩展把几个站点的登录态同步到本地服务。本文记录它读不到 Cookie 的排查过程、几个互相掩盖的 bug，以及 Service Worker 休眠和并发去重踩过的坑。"
---

几个内部业务站点，各自有一套登录态。原来每天要人工从 DevTools 复制 Cookie 或 Authorization，粘到本机服务里，复制错了、过期了、漏了一项就失败。于是我写了个 Chrome 扩展，盯着登录态变化，自动 POST 给本机服务。

它在一台机器上好好的。换到另一台机器（开着浏览器自动化调试环境），三个站点只有一个同步成功，另外两个一直说「未找到凭据」——页面明明登录着，扩展也明明有权限。

排查了一周，根因是两个 bug 串在一起：Chrome 默认不把 `Cookie` 请求头交给扩展，而兜底路径里有一个函数根本没被 import。第一个 bug 让代码走不到第二个，所以只修一个，另一个才会冒出来。

站点、域名、Cookie 名都做了匿名化，只留结论和代码结构。

## 背景

三个站点的凭据形态不同：

| 档案   | 凭据来源               | 去重输入                | 提交字段                  |
| ------ | ---------------------- | ----------------------- | ------------------------- |
| 站点 A | `SESSION_ID` cookie    | 该 cookie 的值          | `{"sessionId": "..."}`    |
| 站点 B | 一整串登录 cookie      | `AUTH_TOKEN` + `TICKET` | `{"cookie": "..."}`       |
| 站点 C | `Authorization` 请求头 | 整个头值                | `{"token": "Bearer ..."}` |

A、B 是 Cookie 型，用 `chrome.cookies` 读，或用 `chrome.webRequest` 观察请求头；C 是 Authorization 型，只能观察请求头。代码上用一个纯数据的「档案」（profile）描述每个站点：凭据从哪来、哪些字段参与去重、提交什么字段、默认服务地址。`profiles.js` 不碰 `chrome.*`，可以在 Node 里直接测；`background.js` 只做事件编排。

这部分没出问题。问题都出在「浏览器到底让扩展看到什么」。

## 只有站点 C 正常

三个站点里只有 C 成功。把成功和失败路径对比，差异只有一处：

- C 用 `Authorization`，监听器声明 `["requestHeaders"]` 就能读到；
- A、B 用 `Cookie`，同样的配置读到的头是空的。

**这让排查范围缩小到「Cookie 型凭据的读取路径」一条线**——同步逻辑、消息传递、POST、本地服务都已被证明是好的。一个成功的案例，就是最好的对照组。

## 坑一：Chrome 72+ 默认隐藏 Cookie 头

HAR 和 DevTools 里每个请求都带着 `Cookie`，直觉上 `webRequest` 也应该看得到。但从 Chrome 72 起，一批敏感头默认不交给扩展，除非在 `extraInfoSpec` 里显式声明 `"extraHeaders"`：

| 头                | 方向 | Chrome 72+ 默认提供 |
| ----------------- | ---- | ------------------- |
| `Cookie`          | 请求 | 否                  |
| `Set-Cookie`      | 响应 | 否                  |
| `Accept-Language` | 请求 | 否                  |
| `Accept-Encoding` | 请求 | 否                  |
| `Referer`         | 请求 | 否                  |
| `Authorization`   | 请求 | **是**              |

`Authorization` 不在隐藏列表里，所以 C 一直正常；A、B 读 `Cookie`，监听器却只声明了 `["requestHeaders"]`。

```js
chrome.webRequest.onBeforeSendHeaders.addListener(
  details => handleCookieProfileRequest(profile, details),
  { urls: [`${profile.siteOrigin}/*`] },
  ["requestHeaders", "extraHeaders"] // 之前只有 "requestHeaders"
);
```

两个限制：`extraHeaders` 仍需要站点的 host 权限；官方文档提示它有性能开销，所以只对需要敏感头的站点开启。

记住一句话就够了：**HAR 里有什么，不等于扩展能看到什么。** DevTools、`chrome.cookies`、`webRequest` 是三套视角。

## 坑二：被空 Cookie 头掩盖的 ReferenceError

如果只是上面那条 API 用法，这个故事就太简单了。

当时加过一个「请求头兜底」：`chrome.cookies` 读不到完整凭据时，用观察到的 `Cookie` 头补。但上线后依然不工作。原因藏在两行之间：

```js
function handleCookieProfileRequest(profile, details) {
  const header = cookieValueFromHeaders(details.requestHeaders);
  if (!header) return; // 空头在这里提前返回

  const cookies = parseCookieHeader(header);
  const declared = selectProfileCookies(profile, cookies); // 这个函数没被 import
  // ...
}
```

第一个 bug 让 `Cookie` 头恒为空，函数在第一行就返回；第二个 bug 是 `selectProfileCookies` 根本没被 import，一旦执行就抛 `ReferenceError`。**第一个 bug 让代码到不了第二个。** 只修 `extraHeaders`，`ReferenceError` 立刻暴露；只补 import，头还是空的。

```diff
    migrateSettings,
+   selectProfileCookies,
    urlMatchesProfile,
  } from "./profiles.js";
```

教训是：**修完一个 bug 不要立刻宣布胜利，沿着整条路径重新走一遍。** 从请求进来、解析头、取声明 cookie、防抖到提交，任何一个提前 return 都可能是下一个 bug 的藏身处。

另外，`node --check` 只做语法解析，不检查未定义标识符。这个文件语法完全正确，运行时才炸。后来补了 ESLint 的 `no-undef`。

## 坑三：标签页看得见，cookie 读不到

自动化环境里还有个更绕的现象：`chrome.tabs.query` 能看到站点标签页，`chrome.cookies.getAll` 却是空的。

原因是三个概念经常被混为一谈：

| 概念                                  | 是什么                                       |
| ------------------------------------- | -------------------------------------------- |
| 浏览器配置（profile / user-data-dir） | 一整套用户数据：cookie、扩展、历史、书签     |
| 浏览器上下文（BrowserContext）        | 浏览器进程内隔离的存储空间，像一次无痕会话   |
| Cookie 存储（cookie store）           | Chrome 内部按配置 / 上下文组织的 cookie 集合 |

- `chrome.tabs` 是浏览器层面的，可能跨上下文看到标签页；
- `chrome.cookies` 只能看到扩展所在上下文 / 配置的存储；
- `chrome.webRequest` 只要 host 权限够，能看到其他上下文发出的请求。

所以「标签页在、请求在、cookie 读不到」不是 bug，是存储隔离。

修复分两层：遍历所有 cookie store 查询（并按 `name|domain|path` 去重）；声明的关键 cookie 不齐时，用观察到的请求头兜底。

```js
const cookies = dedupeBy(lists.flat(), c => `${c.name}|${c.domain}|${c.path}`);

// 兜底条件不是「cookies 为空」，而是「声明的关键 cookie 不齐」
const observed = observedCookies.get(profile.id);
if (
  observed?.cookies.length &&
  !selectProfileCookies(profile, cookies).every(Boolean)
) {
  return observed.cookies;
}
return cookies;
```

这里也踩过一次：早期写的是「只要有 cookie 就用 `cookies` API 的结果」，结果能读到几条页面级 cookie、恰好没有登录 cookie，兜底永远不触发。**「有 cookie」不等于「有登录 cookie」**，判断要对着契约看关键项是否齐全。

顺便说一个同源问题：`chrome.cookies.getAll` 在缺少 host 权限时**返回空数组、不抛错**。所以空结果同时可能是「没权限」「没登录」「存储隔离」，排查顺序必须是先权限，再存储，最后才是登录态。

## 去重：输入 ≠ 提交内容

凭据同步最怕重复提交。但去重不是「算个 hash」这么简单。

**只 hash 凭据，不 hash 页面状态。** 站点 B 的 cookie 里混着当前路由、侧边栏状态这类 UI 项，路由一变就变。如果整串参与 hash，每切一次页面就同步一次。拆分方式是：`triggerCookie` 只监听登录 cookie；`hashCookies` 只用 `AUTH_TOKEN` + `TICKET`；提交内容仍可以是整串，因为后端需要。

**每请求变化的 cookie 不能当稳定凭据。** 站点 C 的 cookie 里有一项，18 个请求出现了 18 个不同值——大概率是每请求生成的一次性 nonce。判断方法很便宜：对每个 cookie 名统计不同值的个数，高变化率的直接排除。

**去重 key 要覆盖所有影响结果的输入。** 有一次把服务地址从 `:5000` 改到 `:6000`，扩展显示「凭据未变化」，新服务一直没收到。因为 `lastSyncHash` 只跟凭据有关，跟目标地址无关。地址也是输入的一部分。

最后落成了五层防护：

| 层                    | 挡什么                                        |
| --------------------- | --------------------------------------------- |
| 500ms 防抖            | 登录连续写 cookie、页面并发请求               |
| 同步 `lastSeen`       | 同一轮异步窗口里重复的 Authorization          |
| 观察 hash             | 同一轮里重复的 Cookie 头                      |
| 提交互斥 + 补跑标记   | 两个 alarm / 事件同时进入提交                 |
| 持久化 `lastSyncHash` | Worker 重启、定时检查、浏览器启动后的重复提交 |

## 并发：锁必须在 await 之前

两个 alarm 同时触发时，后端收到两次相同的 POST。代码看起来有锁：

```js
if (syncing.get(profile.id)) return;
const config = await profileConfig(profile); // 在这里让出事件循环
syncing.set(profile.id, true); // 太晚了
```

async 函数在 `await` 处让出事件循环，第二个事件会在第一个等待期间通过检查。正确做法是同步上锁再 await：

```js
if (syncing.get(profile.id)) {
  resyncRequested.add(profile.id);
  return;
}
syncing.set(profile.id, true);
try {
  const config = await profileConfig(profile);
  // ...
} finally {
  syncing.set(profile.id, false);
  if (resyncRequested.delete(profile.id)) await submit(profile);
}
```

同一类问题还有 `storage.session` 的异步读：三个同 token 请求几乎同时到达时都会读到旧值。用一个同步 `Map` 记住上一次看到的值，值相同直接返回。

**异步读之前，先用同步状态挡一层。**

## Service Worker 随时会忘掉你

MV3 的 Service Worker 大约空闲 30 秒就会被终止（单个事件处理超过 5 分钟也会被中止），有事件或扩展 API 调用会重新唤醒。模块顶层代码重新执行，内存变量全部重置。

这意味着：

- 不能用模块变量保存需要跨事件的值；
- 凭据放 `storage.session`，配置 / 状态 / hash 放 `storage.local`，**绝不放 `storage.sync`**（会同步到账号）；
- 监听器在顶层同步注册，注册要幂等，Worker 重启后能恢复；
- alarm 不保证跨浏览器重启保留，`onStartup` / `onInstalled` / 顶层初始化都要重建。

还有两个容易忽略的点：`storage.local` **不是加密的**，本机其他进程或备份都能读到，所以只放 hash 和状态；`chrome.storage` **没有事务**，两个「读 → 改 → 写」并发时会互相覆盖，同一档案的写入要尽量串行。

## 契约与诊断

**字段名是契约。** 服务 A 接受 `sessionId` / `token` / `cookie`，服务 B 只接受 cookie。字段发错时，扩展显示「同步成功」——因为 HTTP 200 只代表请求被接收，不代表字段被理解。直接看后端解析逻辑，或者起一个本地 mock server 断言 body。

**诊断只给证据，不给秘密。** 只输出 Cookie 的 `name@domain`、Authorization 的有无、标签页的 `hostname + pathname`（去掉 query / hash，`?token=...` 是常见泄露渠道）、HTTP 状态。日志统一前缀，写之前先问一句：这行会不会打出凭据？

一个反直觉但实用的结论：**405 也是可达。** 探活用 GET、路由只允许 POST，405 说明端口在监听。健康检查要区分「可达」和「业务成功」。

另外，超时用 `AbortSignal.timeout()`，不要用 `Promise.race`——后者只是让外层先返回，底层请求还在跑。

## 测试：29 个用例全过，为什么还是漏了

真正出问题的 cookie 兜底路径一条都没覆盖。三个教训：

**mock 的结构决定你测到什么。** 早期 mock 里 `addListener` 是直接赋值，后注册的覆盖先注册的。注册顺序是 A cookie → B cookie → C auth，最后只剩 C。测试断言的是 C 的 filter 和 spec，看起来在测监听器，实际只测到三分之一。

**模块级状态要显式重置。** 监听器在 `import` 时注册，ESM 又按 specifier 缓存。每个用例都要用 `?isolate=${Date.now()}-${Math.random()}` 打破缓存，并且先装好 `globalThis.chrome` 再 import。

**并发测试要主动制造延迟。** fake fetch 不加延迟时，第一个提交在第二个事件前就完成了，锁竞争窗口根本不出现。

补上的回归测试大意是：mock 一个带 `Cookie` 头的请求，断言触发一次 POST；再断言 cookie 监听的 `extraInfoSpec` 包含 `extraHeaders`，防止被改回去。

**没有覆盖的路径，就是没有被验证的路径。**

## 总结

1. 先分清凭据类型：Cookie 还是 Authorization。
2. 读 Cookie 之前先查 host 权限，`getAll` 的空数组可能只是没授权。
3. Chrome 72+ 读 `Cookie` 头必须 `extraHeaders`，`Authorization` 不受影响。
4. 标签页可见不代表 cookie 可见。
5. 只 hash 凭据，不 hash 页面状态；去重 key 要覆盖所有输入。
6. 锁要在 `await` 之前同步获取。
7. Service Worker 会休眠，跨事件的状态一律落 storage。
8. 诊断只给名字、计数、状态，不给值。
9. 没有测试覆盖的路径就是没验证的路径。
10. 修完一个 bug，沿着整条路径重新走一遍。

真正学到的不是某个 API 的用法，而是：**先分清「事实」和「视角」**——HAR、`chrome.cookies`、`webRequest` 看到的是三套不同的东西；**把环境当成代码的一部分**——浏览器配置、上下文、权限、Worker 生命周期都会改变行为。

## 参考

- [chrome.webRequest](https://developer.chrome.com/docs/extensions/reference/api/webRequest)：`extraHeaders` 与敏感请求头的默认隐藏规则
- [chrome.cookies](https://developer.chrome.com/docs/extensions/reference/api/cookies)：host 权限与 cookie store
- [Extension service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)：空闲终止与事件唤醒
- [chrome.storage](https://developer.chrome.com/docs/extensions/reference/api/storage)：三种存储的持久性与访问范围
- [Playwright Browser contexts](https://playwright.dev/docs/browser-contexts)：上下文隔离

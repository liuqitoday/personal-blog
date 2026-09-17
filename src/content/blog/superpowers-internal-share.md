---
title: "我为什么开始推荐 superpowers"
description: "它不是让 Agent 更聪明，而是让它更像一个靠谱的工程师"
pubDate: "2026-07-03T04:00:00.000Z"
updatedDate: "2026-09-17T00:00:00.000Z"
tags:
  - "AI Agent"
  - "Superpowers"
  - "Agent Skills"
  - "Claude Code"
  - "Codex"
category: "ai"
---

## 一开始，我其实看不上这个插件

说实话，我最开始觉得 `superpowers` 有点多余。

像 `Claude Code`、`Codex` 这样的 AI Coding Agent，本身已经很强了：能读代码、改文件、跑命令、跑测试，也都支持先规划再动手。站在开发者直觉上，很容易得出一个判断：既然 Agent 已经这么成熟了，再装一个 `superpowers`，是不是只是多套了一层提示词包装？

后来我回头认真看了官方仓库和它实际的源码，才发现我之前误判的不是 Agent 的能力，而是流程纪律的价值。

我现在对 `superpowers` 的理解是：

`它解决的不是 Agent 会不会写代码，而是 Agent 能不能更稳定地按工程化流程工作。`

## superpowers 到底是什么

从 `obra/superpowers` 官方仓库看，它的定位不是"一个提示词插件"，而是建立在可组合 skills 和初始指令之上的完整软件开发方法论。它支持的不只是 `Claude Code`，还包括 `Codex App`、`Codex CLI`、`Cursor`、`Devin CLI`、`Gemini CLI`、`Grok Build CLI`、`Kimi Code`、`OpenCode`、`Pi`、`Hermes Agent` 等十多个 harness。

这点很重要，因为今天主流 Agent 其实并不缺"规划能力"。

`Claude Code` 官方文档已经把推荐流程写成了 `Explore -> Plan -> Implement -> Commit`，并且提供了显式的 `Plan mode`。`Codex` 也提供 planning workflow、skills 和 `AGENTS.md`。真正容易缺的，往往不是"会不会先想"，而是后面的执行纪律：

- 需求没讲清楚就直接动手
- 列了计划但执行很快跑偏
- 没查根因就开始试错式修 bug
- 没做 fresh verification 就宣称完成

而 `superpowers` 做的事情，就是把这些本来容易被跳过的动作，变成默认流程。

它目前带了 14 个 skill，官方按用途分成了四类：

**测试**

- `test-driven-development`：严格的 RED-GREEN-REFACTOR 循环，配一份 `writing-good-tests` 参考

**调试**

- `systematic-debugging`：四阶段根因分析，附带 root-cause-tracing、defense-in-depth、condition-based-waiting 等技巧
- `verification-before-completion`：先确认真的修好了，再宣称完成

**协作**

- `brainstorming`：先澄清需求和设计，再动手
- `writing-plans`：先把实现计划拆细，再进入编码
- `executing-plans`：分批执行，带人工检查点
- `subagent-driven-development`：每个任务派一个全新的 subagent，配两段式 review
- `dispatching-parallel-agents`：把互相独立的任务并行派发
- `requesting-code-review` / `receiving-code-review`：发起评审和接收评审反馈
- `using-git-worktrees`：在隔离的工作区里干活
- `finishing-a-development-branch`：收尾时决定合并、发 PR 还是保留

**元**

- `writing-skills`：自己写 skill 的方法论
- `using-superpowers`：整套系统的入口说明

但真正有价值的不是这个清单，而是**它把这些 skill 串成了一条默认链路**。官方 README 把它叫做 `The Basic Workflow`：

1. `brainstorming`：写代码前，先把需求问清楚，分段确认设计，存下设计文档
2. `using-git-worktrees`：设计确认后，开一个隔离工作区，跑通初始化，确认测试基线是干净的
3. `writing-plans`：把活拆成一个个 2-5 分钟就能完成的小任务，每个任务都写明确切的文件路径、完整代码和验证步骤
4. `subagent-driven-development` 或 `executing-plans`：按任务派发 subagent，或分批执行
5. `test-driven-development`：实现阶段强制 RED-GREEN-REFACTOR
6. `requesting-code-review`：任务之间做评审，问题按严重程度分级，致命的直接挡住进度
7. `finishing-a-development-branch`：验证测试，给出合并/PR/保留的选项，清理工作区

而且 README 明确写了：这是 `mandatory workflows`，不是 `suggestions`。这也是我后来改观的关键点。它不是在给 Agent 补几句提示词，而是在重构 Agent 的默认工作流。

## 它和 Agent 自带 Plan 模式有什么区别

如果只用一句话概括：

`Plan 模式解决的是"改之前先想一想"；superpowers 解决的是"从开始到结束，都尽量别乱来"。`

核心差异我觉得有三点。

### 1. 覆盖范围不同

`Plan mode` 更像一个前置阶段能力，重点是分析问题、提出方案、在改代码前先停下来想一想。

`superpowers` 覆盖的则是一整条链路：需求澄清、设计、计划、实现、调试、评审、验证、收尾。按照它官方仓库的写法，它想提供的是一套完整的软件开发方法论，而不是某个阶段的单点增强。

### 2. 约束强度不同

Agent 自带的规划能力通常比较灵活，列完计划后可以很快进入实现。

`superpowers` 的很多 skill 则带有明显的强约束倾向。比如：

- 没有先完成需求澄清和设计，就不建议直接进入实现
- 没有看到失败测试，就不应该直接写生产代码
- 没有做 fresh verification，就不应该宣称任务完成

也就是说，`Plan` 更像思考辅助，`superpowers` 更像流程约束。

### 3. 自动触发和集成要求不同

`superpowers` 很强调 bootstrap 和 skill 的自动触发，而不是靠用户每次手动想"现在该用哪个 skill"。官方仓库甚至把这件事当成集成验收标准：一个正常工作的环境里，输入 `Let's make a react todo list`，应该在写代码前自动触发 `brainstorming`。

这也意味着，`superpowers` 的效果不只取决于 skill 内容本身，还取决于 harness 集成质量。如果技能没有在会话启动时正确加载，或者抽象动作没映射到当前 Agent 的原生工具，那就算文件在磁盘里，实际效果也会打折扣。

## 它到底是怎么触发起来的

这一点值得单独说，因为它是"为什么用了会有效果"的根子。

`superpowers` 装好之后会注册一个 `SessionStart` hook。每次会话启动、`/clear`、以及上下文被压缩（compact）之后，这个 hook 都会把 `using-superpowers` 这段 bootstrap 指令重新注入进去。而这段 bootstrap 的核心规则就一句话：**在任何响应或动作之前，先检查有没有相关的 skill 该用**。

所以你不需要记"现在该用哪个 skill"。你只要把需求讲清楚，它自己会走到 `brainstorming`、`writing-plans`、`test-driven-development` 这些环节上去。

反过来，这也解释了为什么"集成质量"是个真问题。如果 hook 没能在会话启动时把 bootstrap 加载进去，那些 skill 文件就只是躺在磁盘上的死文档——看起来装好了，实际一次都不会触发。v6.2.0 就修过一个很典型的 bug：Windows 上 hook 的命令字符串以带引号的路径开头，结果 PowerShell 和 cmd.exe 都会解析失败，bootstrap 静默地从未加载，而用户根本不会收到任何报错。

换句话说，`superpowers` 不是一个"你打开它才开始工作"的工具，而是一个"会话一开始就自动生效"的默认设置。这也提醒我们：评估这类插件，不能只看它带了哪些 skill，还要看它有没有真的接进当前 harness 的生命周期里。

## 几个上手就能用的技巧

如果你打算试，下面这几点比背 skill 名字更实用。

**不用手动选 skill。** 把需求、约束、你想要的验收标准讲清楚，剩下的交给它自动触发。当然你也可以直接点名，比如明确说"用 brainstorming 先把需求理一下"，它在收到这类信号时会更早进入对应流程。

**brainstorming 阶段多喂上下文。** 它的价值在追问，不在替你拍板。你把背景、边界、不想动的东西讲清楚，它问出来的设计才会准；如果一开始就含糊，后面 plan 阶段的返工概率会明显变高。

**plan 一定要细。** 官方要求是拆到 2-5 分钟一个任务，带确切文件路径和验证步骤。这个粒度不是形式主义——后面 subagent 执行时，粒度太粗是跑偏的主要来源。

**善用 subagent-driven-development 的两段式 review。** 它每个任务都派一个全新的 subagent（避免上下文互相污染），然后做两轮检查：先查"有没有按 spec 做到"，再查"代码质量行不行"。这是我认为整套流程里性价比最高的部分，比一次性让主 Agent 从头写到尾稳得多。而且这套流程还在持续打磨：最近几个版本里，控制器不再因为计划里的非致命冲突而卡住空转，形状相同的小任务会合并成一次派发（明显降本），工作区也改成按 plan 隔离，避免把上一个计划的进度记录误当成自己的。

**动手前先隔离工作区。** `using-git-worktrees` 会在新分支上开一个独立目录，跑通初始化并确认测试基线干净。这样即使中途翻车，你当前的本地分支也是安全的。收尾也更谨慎——如果目录里还有未提交的文件，它会停下来把文件列给你，而不是直接 `--force` 销毁；`finishing-a-development-branch` 也不再默认提供"丢弃分支"这种会销毁已有成果的选项。

**遇到 bug 别说"再试一把"。** 给出复现步骤，让它走 `systematic-debugging` 的根因分析，而不是试错式修改。

**别拿最小任务试。** 挑一个真实的、稍微复杂一点的任务，让它完整跑一遍链路，你才能感受到"稳"在哪里。

## 它具体值在哪

我自己的体感很明确：`superpowers` 的最大价值，不一定是让 Agent 更快，而是让结果更稳。

主要体现在四点：

- 减少方向性返工。先澄清需求、先写 plan，能明显减少一开始就写偏。
- 减少拍脑袋修 bug。先查根因，再下手，比"改一把试试"稳得多。
- 减少伪完成。先验证，再说完成，能少掉很多"看起来像做完了"。
- 让团队用法更一致。它更容易把"我们希望 Agent 怎么工作"沉淀成共享流程，而不是停留在个人习惯里。

这套东西本身也在快速迭代。这篇文章的初稿写于 2026 年 7 月初，那时它大约是 v6.1.x，之后 v6.2.0 和 v6.3.0 两个版本都做了不少实质性的调整。

而让我最认真看待它的，是 v6.2.0 压缩时发生的一件事。那一轮对整个 skill 库做了一轮精简，删掉了很多"推销式"文案——对已经调用这个 skill 的读者反复讲它的好处，本就是废话。但其中有人顺带把 TDD skill 里一段"为什么必须先写测试"的说服性文字也删掉了。结果在抗压测试中，Agent 面对"先写实现、测试回头补"的压力时，坚持 test-first 的比例从 8/10 掉到了 5/10。最后这段内容没有硬删，而是被改写后放了回去。

这恰好印证了：**skill 不是文档，是塑造 Agent 行为的代码**。改一句话都可能改变行为，所以改动要做对抗性测试和 eval。这也是我觉得这套方法论值得团队借鉴的地方——它意味着"我们希望 Agent 怎么工作"这件事，是可以被工程化管理和持续验证的。

## 什么时候适合用，什么时候别硬上

我不建议把 `superpowers` 理解成"所有任务都必须打开"的工具。

它更适合下面这些场景：

- 中等以上复杂度的需求开发
- 跨多个模块、多个文件的改动
- 容易返工的任务
- 容易误修的 bug
- 风险比较高、必须严格验证的修改
- 团队希望把使用方式沉淀成一致流程的时候

但它也不是银弹，而且风格很强势。官方仓库对 TDD、根因分析、验证、评审、工作区隔离这些事情都有明显的约束倾向。如果团队本来就更偏快速试错、轻流程，那一上来就全盘接受 `superpowers`，体感上很可能会觉得它管得太多。

好在 v6.3.0 之后，"小任务管得太多"这个最大的抱怨已经被内置处理了：它会自己判断规模、自动降档——把请求分成 `spike`、`bounded`、`architectural` 三类，小任务跳过双文档那套仪式，大改动才走完整流程，但无论哪条路径，动手前都仍然要你先批准。所以你不需要为了小活去开关它。

但它的代价依然存在：更重、更慢、更多步骤、更多 token。下面这些场景，我觉得就未必值得走完整套流程：

- 改文案、改注释、修 typo
- 一两行低风险配置修改
- 明确的一次性实验

所以真正合理的用法不是"默认全开"，而是：

`当任务开始变复杂、变脆弱、变需要工程纪律时，再让 superpowers 上场。`

## 我的建议

如果同事问我值不值得装，我的答案会是：`值得装，也值得试。`

但不要拿最小任务试。

最好的试法，是挑一个真实的、稍微复杂一点的任务，让它完整跑一遍。这样你感受到的就不是"它会不会列计划"，而是"它会不会让整个做事过程更稳"。

## 参考资料

- Superpowers 官方仓库: <https://github.com/obra/superpowers>
- Superpowers README: <https://github.com/obra/superpowers/blob/main/README.md>
- Superpowers CLAUDE.md（贡献与 skill 设计规范）: <https://github.com/obra/superpowers/blob/main/CLAUDE.md>
- v6.3.0 Release Notes: <https://github.com/obra/superpowers/releases/tag/v6.3.0>
- v6.2.0 Release Notes: <https://github.com/obra/superpowers/releases/tag/v6.2.0>
- Superpowers for Kimi Code: <https://github.com/obra/superpowers/blob/main/docs/README.kimi.md>
- Superpowers for OpenCode: <https://github.com/obra/superpowers/blob/main/docs/README.opencode.md>
- Claude Code Best Practices: <https://code.claude.com/docs/en/best-practices>
- Claude Code Common Workflows: <https://code.claude.com/docs/en/common-workflows>
- Claude Code Skills: <https://code.claude.com/docs/en/skills>
- Codex Skills: <https://developers.openai.com/codex/skills>
- Codex Workflows: <https://developers.openai.com/codex/workflows>
- Codex AGENTS.md: <https://developers.openai.com/codex/guides/agents-md>
- Agent Skills Overview: <https://agentskills.io/home>
- SkillsBench: <https://arxiv.org/abs/2602.12670>
- RigorBench: <https://arxiv.org/abs/2606.22678>

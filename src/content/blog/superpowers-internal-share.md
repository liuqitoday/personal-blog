---
title: "我为什么开始推荐 superpowers"
description: "它不是让 Agent 更聪明，而是让它更像一个靠谱的工程师"
pubDate: "2026-07-03T04:00:00.000Z"
tags:
  - "AI Agent"
  - "Superpowers"
  - "Agent Skills"
  - "Claude Code"
  - "Codex"
category: "ai"
---

## 一开始，我其实是看不上这个插件的

说实话，我最开始对 `superpowers` 是有偏见的。

原因很简单。像 `Claude Code`、`Codex` 这样的 AI Coding Agent，本身已经很强了：能读代码、改文件、跑命令、跑测试，也都支持先规划再动手的工作方式。站在开发者直觉上，很容易得出一个判断：

既然 Agent 已经这么成熟了，再装一个 `superpowers`，是不是只是多套了一层提示词包装？

我后来回头认真看了官方文档和一些公开资料，才发现我之前低估的不是 Agent 的能力，而是流程约束的价值。

而且我一开始还有一个误解：我把它当成了某个单一 Agent 的"小插件"。但从 `obra/superpowers` 官方仓库看，它支持的不只是 `Claude Code`，还覆盖 `Codex App`、`Codex CLI`、`Cursor`、`GitHub Copilot CLI` 等多个 harness。换句话说，它从设计上就不是某个工具的小技巧，而是一套试图跨 Agent 复用的软件开发方法论。

我现在对 `superpowers` 的理解是：

`它解决的不是 Agent 会不会写代码，而是 Agent 能不能更稳定地按工程化流程工作。`

这两者差别非常大。

## 为什么我后来改观了

截至 `2026-07-03`，主流 Agent 本身并不缺"规划能力"。

`Claude Code` 官方文档已经明确把推荐流程写成了 `Explore -> Plan -> Implement -> Commit`，并且提供了显式的 `Plan mode`。`Codex` 官方文档也把本地 planning workflow、`$plan` skill、`AGENTS.md`、skills 等机制作为正式能力提供出来。

也就是说，今天的问题通常不是"Agent 不会先想再做"，而是：

- 它会不会在需求没讲清楚时就直接动手
- 它会不会列了计划之后很快脱离计划
- 它会不会在没找到根因时就开始试错式修 bug
- 它会不会在没做 fresh verification 时就宣称完成

这些问题，本质上都不是"能力不足"，而是"流程纪律不足"。

而 `superpowers` 正是在补这块。

## superpowers 的原理是什么

我后来发现，`superpowers` 不应该被理解成"增强模型智商的插件"，而更像一套把工程最佳实践产品化、流程化、强约束化的 skill 集合。

这一点其实在它自己的官方仓库里说得很直白。`obra/superpowers` 对自己的定位，不是"一个提示词插件"，而是"建立在可组合 skills 和初始指令之上的完整软件开发方法论"。这个表述很重要，因为它直接说明了它的目标就不是单点增强，而是端到端地改造 Agent 的工作方式。

从公开资料看，`Agent Skills` 的定位本来就是把专门知识和工作流打包成可复用 skill，按需加载。`Codex` 官方文档对 skills 的定义更直接：它们本质上是复用工作流的编写格式。

这点非常关键。

因为 skill 的价值不只是"多教 Agent 一点知识"，而是把原来散落在个人经验里的做事方法，变成一个可重复执行的流程资产。

以我本地安装的 `superpowers` 为例，它里面有几类很典型的 skill：

- `brainstorming`：先澄清需求和设计，再动手
- `using-git-worktrees`：先拉出隔离工作区，避免在脏环境里直接开干
- `writing-plans`：先把实现计划拆细，再进入编码
- `subagent-driven-development` / `executing-plans`：按任务推进执行，并配合检查点或双阶段 review
- `test-driven-development`：先写失败测试，再写实现
- `requesting-code-review`：在任务推进过程中主动 review
- `systematic-debugging`：先查根因，再修 bug
- `verification-before-completion`：先验证，再宣称完成
- `finishing-a-development-branch`：收尾时决定 merge、PR、保留还是丢弃，并清理分支/工作区

你会发现，这些东西单独看都不新鲜，很多其实就是一个成熟工程师本来就该做的事。

`superpowers` 真正做的，不是发明新方法，而是把这些本来容易被跳过的工程动作，变成 Agent 默认要走的流程。

官方 README 对这条链路的描述也很完整：当 Agent 识别到你在做开发任务时，它不是立刻开始写代码，而是先追问你真正想解决的问题；在对话中把需求整理成 spec，并分段展示给你确认；设计确认后，再进入 `using-git-worktrees`、`writing-plans`，生成一份足够细致的实现计划；接着再进入 `subagent-driven-development` 或 `executing-plans`，让 Agent 按任务推进、检查和继续执行；实现过程中再叠加 TDD、code review、收尾验证和分支收口。这个流程设计说明，它从一开始就不是"帮你补几句 prompt"，而是在重构 Agent 的默认工作流。

官方 README 还专门给这套流程起了名字，叫 `The Basic Workflow`，而且明确写了：这些是 mandatory workflows，不是 suggestions。这点其实很能说明它的产品思路。它不是在说"你最好这么做"，而是在尽量把"你应该这么做"固化成默认机制。

所以它补的不是能力上限，而是交付质量下限。

## 它和 Agent 自带 Plan 模式有什么区别

如果要我用一句话解释，我会这么说：

`Plan 模式解决的是"改之前先想一想"；superpowers 解决的是"从开始到结束，都尽量别乱来"。`

这个区别很关键。

### 1. 定位不同

`Plan mode` 更像 Agent 的一个阶段性能力。

比如 `Claude Code` 的 `Plan mode`，官方定义就是：Claude 可以读文件、调查问题、提出方案，但在你批准前不会直接编辑文件。这个能力非常适合先分析、先评审、先讨论方案。

但 `superpowers` 不只是"先做计划"，而是覆盖需求澄清、设计、计划、实现、排障、验证、收尾的一整套流程体系。按照它官方仓库的写法，它真正想提供的是一套完整的软件开发方法论，而不是单独某个阶段的能力增强。

### 2. 约束强度不同

Agent 自带的规划能力通常比较灵活，Agent 可以列出计划，也可以很快跳入实现。

而 `superpowers` 的很多 skill 带有明显的 hard gate 倾向。比如：

- 没有先完成需求澄清和设计，就不建议直接进入实现
- 没有看到失败测试，就不应该直接写生产代码
- 没有做 fresh verification，就不应该宣称任务完成

这意味着它更像流程约束，而不只是思考辅助。

### 3. 颗粒度不同

普通 `Plan` 更偏高层任务拆解，比如"先看代码，再改实现，再跑测试"。

`superpowers` 会继续往下压一层，细化到：

- 什么时候该先写失败测试
- 什么时候必须先做根因分析
- 什么时候需要重新验证
- 什么时候需要把设计和计划文档化

它不只是告诉 Agent "你应该想一想"，而是在规定"你应该按什么顺序做这些事"。

### 4. 结果形态不同

`Plan mode` 更多是一种会话内能力。

`superpowers` 更像一套可复用、可共享、可团队传播的方法论。今天你装了它，明天团队里其他人也能按同样方式触发类似流程，这对团队推广其实很重要。

而且从官方 README 和 `CLAUDE.md` 的写法看，它还强调另一点：这些技能最好是自动触发的，用户不需要每次显式地想"现在该用哪个 skill 了"。仓库里甚至把这件事定义成一个集成验收标准：一个真正可用的新 harness，应该在会话启动后自动加载 `using-superpowers` bootstrap，并在用户说出类似"Let's make a react todo list"时，自动触发 `brainstorming`，而不是等用户手动点 skill。

这一点非常关键，因为它说明 `superpowers` 和普通"提示词模板库"不是一回事。模板库依赖你记得去用，`superpowers` 想做的是让流程纪律自动发生。

### 5. 它的效果强依赖 harness 集成质量

这一点是我读完官方仓库里不同 harness 文档后，觉得很值得补充的地方。

`superpowers` 的效果，并不只是"skill 写得好不好"，还取决于它有没有被正确集成进当前 Agent。官方文档在不同 harness 下反复强调几件事：

- 它需要在会话开始时自动加载 `using-superpowers`
- 它需要把 skill 里的抽象动作正确映射到当前 Agent 的原生工具
- 它往往需要在新会话里生效，装完或更新后不是总能在当前会话立刻可用
- 它必须为每个 harness 分别安装，而不是一处安装、处处生效

比如：

- `Kimi Code` 的文档明确写了，插件通过 `sessionStart.skill` 在会话启动时加载 `using-superpowers`，并且安装、更新、启停后要通过 `/new` 开启新会话才会生效。
- `OpenCode` 的文档则说明，它是通过对话消息 transform hook 注入 bootstrap context，再通过 config hook 注册 skills 目录；如果插件没正常加载，或者 bootstrap 没进来，skill 文件即使在磁盘上也不等于真的可用。

这说明一件事：`superpowers` 不是简单复制一套技能文件就结束了，它的真实效果和 harness 级接入质量强相关。

所以如果团队里有人装了之后觉得"也没什么特别"，先不要急着下结论。更靠谱的做法，是先用官方建议的 acceptance prompt 验证一遍，比如输入：

`Let's make a react todo list`

一个正常集成的环境，应该在写代码前自动触发 `brainstorming`。如果这一步都没有发生，那问题可能不在 `superpowers` 方法论本身，而在安装方式或 harness 集成层。

## 它具体带来了什么效果

我自己的体感很明确：`superpowers` 的最大价值，不一定是让 Agent 更快，而是让结果更稳。

具体来说，它至少会改善下面几类问题。

### 1. 减少方向性返工

很多时候 Agent 不是不会写，而是一开始理解偏了，结果一路写下去，最后返工。

`brainstorming + writing-plans` 这一类 workflow，本质上是在把"想明白再写"前置，而且前置得更彻底。

### 2. 减少拍脑袋式修 bug

很多开发者自己修 bug 时都容易犯这个毛病，更别说 Agent 了。看到报错先改一把试试，是最自然但也最不稳的路径。

`systematic-debugging` 这种 skill 的价值，就是强行把"先找根因"变成默认动作。

### 3. 减少伪完成

这是我很认可的一点。

如果你不给 Agent 一个可运行的校验，它很容易停留在"看起来像做完了"。而 `verification-before-completion` 做的事情很直接：没有 fresh verification，就不要宣称完成。

### 4. 让团队里的使用方式更一致

很多时候团队里不是没人会用 Agent，而是每个人的用法差异太大。有人喜欢直接上手改，有人先列计划，有人会补测试，有人完全凭感觉。

`superpowers` 的价值之一，就是更容易把"我们希望 Agent 怎么工作"沉淀成共享流程，而不是只停留在少数人的个人经验里。

而且从官方仓库的组织方式看，这件事不是口头上的。它本身就在把 skill 当成行为代码来维护，连贡献指南里都明确写着：skills 不是 prose，而是会塑造 Agent 行为的 code，修改 skill 需要跑 eval。这个思路其实很值得团队借鉴，因为它意味着"怎么用 Agent"也可以被工程化管理。

## 它什么时候最有用

我不建议把 `superpowers` 理解成"所有任务都必须打开"的工具。

它最适合的是那些一旦走偏，就很容易返工、误修、漏验的任务。比如：

- 中等以上复杂度的需求开发
- 跨多个模块、多个文件的改动
- 容易返工的任务
- 容易误修的 bug
- 风险比较高、必须严格验证的修改
- 团队希望把使用方式沉淀为一致流程的时候

如果你真想体验它的价值，最好不要拿一个太小的任务去试。最好的试法，是挑一个真实且稍微复杂的任务，让它完整跑一遍流程。

这样你感受到的就不是"它会不会列计划"，而是"它会不会让整个做事过程更稳"。

## 它什么时候没必要用

这点我觉得也必须讲清楚，不然就会变成纯安利。

`superpowers` 不是银弹，也不适合所有事情。

而且它不只是"重"，还很"有主见"。从官方仓库的写法看，它对 TDD、根因分析、验证、评审、工作区隔离这些事情都有明显的强约束倾向。如果一个团队本来就更偏随手试、快速改、轻流程，那一上来就全盘接受 `superpowers`，体感上很可能会觉得它管得太多、节奏太慢。

下面这些场景，我觉得就不一定值得走完整套流程：

- 改文案、改注释、修 typo
- 一两行低风险配置修改
- 明确的一次性实验
- 任务本身成本很低，但流程成本明显更高的小活

它的代价其实很明确：

- 更重
- 更慢
- 更多步骤
- 更多 token

所以真正合理的用法不是"默认全开"，而是：

`当任务开始变复杂、变脆弱、变需要工程纪律时，再让 superpowers 上场。`

## 我现在为什么愿意推荐它

我现在会推荐 `superpowers`，不是因为我觉得 Agent 离开它就不会写代码，而是因为我越来越确认一件事：

在 AI Coding 这件事上，真正决定产出质量的，往往不只是模型能力，还有流程质量。

模型越来越强，这是行业共识。但越是这样，越容易让人忽视另外一件事：能力强，不等于过程稳。

`superpowers` 的价值，不在于把 Agent 变成另一个模型，而在于把很多本来应该做、但又很容易被跳过的工程动作，变成默认流程的一部分。

所以如果同事问我值不值得装，我的答案会是：

`值得装，也值得试，但不要拿最小任务试。`

最好的试法，不是拿它去改一个按钮文案，而是挑一个真实的、稍微复杂一点的任务，让它完整跑一遍。你会更容易看清楚，它真正提供的不是"更会写代码"，而是"更像一个做事有章法的工程师"。

## 参考资料

- Superpowers 官方仓库 README: <https://github.com/obra/superpowers>
- Superpowers 官方仓库 CLAUDE.md: <https://github.com/obra/superpowers/blob/main/CLAUDE.md>
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

## 附：我本地对照过的 superpowers skill

- `using-superpowers`
- `brainstorming`
- `writing-plans`
- `test-driven-development`
- `systematic-debugging`
- `verification-before-completion`
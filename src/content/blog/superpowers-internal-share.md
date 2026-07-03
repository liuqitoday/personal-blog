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

## 一开始，我其实看不上这个插件

说实话，我最开始觉得 `superpowers` 有点多余。

像 `Claude Code`、`Codex` 这样的 AI Coding Agent，本身已经很强了：能读代码、改文件、跑命令、跑测试，也都支持先规划再动手。站在开发者直觉上，很容易得出一个判断：既然 Agent 已经这么成熟了，再装一个 `superpowers`，是不是只是多套了一层提示词包装？

后来我回头认真看了官方文档和公开资料，才发现我之前误判的不是 Agent 的能力，而是流程纪律的价值。

我现在对 `superpowers` 的理解是：

`它解决的不是 Agent 会不会写代码，而是 Agent 能不能更稳定地按工程化流程工作。`

## superpowers 到底是什么

从 `obra/superpowers` 官方仓库看，它的定位不是"一个提示词插件"，而是建立在可组合 skills 和初始指令之上的完整软件开发方法论。而且它支持的不只是 `Claude Code`，还覆盖 `Codex App`、`Codex CLI`、`Cursor`、`GitHub Copilot CLI`、`Kimi Code`、`OpenCode` 等多个 harness。

这点很重要，因为今天主流 Agent 其实并不缺"规划能力"。

`Claude Code` 官方文档已经把推荐流程写成了 `Explore -> Plan -> Implement -> Commit`，并且提供了显式的 `Plan mode`。`Codex` 也提供 planning workflow、skills 和 `AGENTS.md`。真正容易缺的，往往不是"会不会先想"，而是后面的执行纪律：

- 需求没讲清楚就直接动手
- 列了计划但执行很快跑偏
- 没查根因就开始试错式修 bug
- 没做 fresh verification 就宣称完成

而 `superpowers` 做的事情，就是把这些本来容易被跳过的动作，变成默认流程。

最典型的几个 skill 是：

- `brainstorming`：先澄清需求和设计，再动手
- `writing-plans`：先把实现计划拆细，再进入编码
- `test-driven-development`：先写失败测试，再写实现
- `systematic-debugging`：先查根因，再修 bug
- `verification-before-completion`：先验证，再宣称完成

官方 README 把这套链路叫做 `The Basic Workflow`，而且明确写了：这是 `mandatory workflows`，不是 `suggestions`。这也是我后来改观的关键点。它不是在给 Agent 补几句提示词，而是在重构 Agent 的默认工作流。

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

## 它具体值在哪

我自己的体感很明确：`superpowers` 的最大价值，不一定是让 Agent 更快，而是让结果更稳。

主要体现在四点：

- 减少方向性返工。先澄清需求、先写 plan，能明显减少一开始就写偏。
- 减少拍脑袋修 bug。先查根因，再下手，比"改一把试试"稳得多。
- 减少伪完成。先验证，再说完成，能少掉很多"看起来像做完了"。
- 让团队用法更一致。它更容易把"我们希望 Agent 怎么工作"沉淀成共享流程，而不是停留在个人习惯里。

这一点在官方仓库的组织方式里也能看出来。它并不是把 skills 当作文档来维护，而是当成会塑造 Agent 行为的东西来维护，甚至强调修改 skill 需要做 eval。这个思路很值得团队借鉴，因为它意味着"怎么用 Agent"也可以被工程化管理。

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

下面这些场景，我觉得就不一定值得走完整套流程：

- 改文案、改注释、修 typo
- 一两行低风险配置修改
- 明确的一次性实验
- 任务本身很小，但流程成本明显更高的小活

它的代价其实也很明确：更重、更慢、更多步骤、更多 token。

所以真正合理的用法不是"默认全开"，而是：

`当任务开始变复杂、变脆弱、变需要工程纪律时，再让 superpowers 上场。`

## 我的建议

如果同事问我值不值得装，我的答案会是：`值得装，也值得试。`

但不要拿最小任务试。

最好的试法，是挑一个真实的、稍微复杂一点的任务，让它完整跑一遍。这样你感受到的就不是"它会不会列计划"，而是"它会不会让整个做事过程更稳"。

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
- RigorBench: <https://arxiv.org/abs/2606.22678
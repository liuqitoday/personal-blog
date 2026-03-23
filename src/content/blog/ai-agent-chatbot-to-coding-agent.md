---
title: "从 ChatBot 到 Coding Agent：AI Agent 的概念、原理与实践"
description: "一篇面向研发实践的 AI Agent 入门文章：从 ChatBot 与 Agent 的区别讲起，拆解 ReAct、Tool Use、Agentic 架构模式，并结合一个零框架 Coding Agent 示例说明实现方式。"
pubDate: "2026-03-23T04:00:00.000Z"
updatedDate: "2026-03-23T04:00:00.000Z"
tags:
  - "AI Agent"
  - "LLM"
  - "ReAct"
  - "Coding Agent"
  - "MCP"
category: "ai"
---

过去两年，大模型产品已经把“对话式 AI”带进了日常工作流；而在 2025 到 2026 这两年，另一个更值得工程团队关注的方向，是 **AI Agent**。

如果说 ChatBot 的核心价值是“告诉你答案”，那么 Agent 的核心价值就是“帮你把事情做了”。它不只是生成一段文本，而是能够读取文件、调用工具、执行命令、观察结果，再决定下一步怎么做。

这篇文章试图回答三个问题：

1. AI Agent 到底是什么，和普通 ChatBot 差在哪里？
2. 它为什么能从“会说”变成“会做”？
3. 如果不依赖复杂框架，一个最小可用的 Coding Agent 应该怎么实现？

## 1. 从 ChatBot 到 Agent：发生了什么变化？

过去几年，大家最熟悉的是 ChatGPT、Claude 这类对话产品。它们很强，但本质还是“你问我答”：

```text
用户：帮我写一个排序函数
ChatBot：好的，这是一个快速排序的实现...
```

这种模式下，模型只能输出文本，不能真的进入你的项目里完成任务。

而 Agent 的交互是另一种形态：

```text
用户：帮我在项目里添加一个排序工具类
Agent：[思考] 我需要先看一下项目结构，了解代码规范...
       [调用工具] list_files("src/main/java/")
       [观察] 看到了现有包结构是 agent.tools...
       [调用工具] read_file("src/main/java/agent/tools/ReadFileTool.java")
       [观察] 了解了现有工具的编码风格...
       [调用工具] write_file("src/main/java/agent/tools/SortTool.java", "...")
       [回答] 已经创建好了 SortTool.java，遵循了现有 Tool 接口规范。
```

区别不在于“更聪明”，而在于它有了执行任务的闭环能力。

| 维度 | ChatBot | Agent |
|------|---------|-------|
| 交互模式 | 一问一答 | 多步循环 |
| 自主性 | 被动响应 | 主动规划、拆解、执行 |
| 工具使用 | 无 / 有限 | 完整工具调用能力 |
| 产出形式 | 文本回答 | 文本 + 真实副作用 |
| 错误处理 | 报告错误 | 分析错误原因并继续尝试 |

一句话概括：**ChatBot 告诉你答案，Agent 帮你把事情做了。**

## 2. AI Agent 是什么？

### 定义

AI Agent 是一种以大语言模型为“大脑”，通过工具与外部世界交互，并在循环中自主完成任务的系统。

Anthropic 在《Building Effective Agents》里给过一个很有用的区分：

- **Workflow**：流程由开发者预定义，模型只是其中一个节点
- **Agent**：流程由模型自主决定，开发者提供工具和边界

### 三个关键词

1. **LLM 驱动**：模型负责理解、推理和决策
2. **工具调用**：通过 Tool / Function Calling 访问外部能力
3. **循环执行**：不是一次调用结束，而是边做边看、持续推进

可以把它压缩成一个公式：

```text
Agent = LLM + Tools + Loop
```

## 3. 核心组件拆解

一个 Agent 通常由四个部分组成：

```text
┌─────────────────────────────────────────────┐
│                  AI Agent                    │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  LLM     │  │  Tools   │  │  Memory  │  │
│  │  (大脑)   │  │  (手脚)   │  │  (记忆)   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │         │
│       └──────┬──────┘             │         │
│              │                    │         │
│       ┌──────┴──────┐            │         │
│       │ Orchestrator │────────────┘         │
│       │ (编排/规划)   │                      │
│       └─────────────┘                       │
└─────────────────────────────────────────────┘
```

### 3.1 LLM：大脑

模型负责：

- 理解用户意图
- 推理下一步动作
- 决定调用哪个工具
- 综合工具结果形成回答

### 3.2 Tools：手脚

工具是 Agent 真正“做事”的来源。常见工具包括：

| 类型 | 示例 |
|------|------|
| 文件操作 | 读文件、写文件、列目录 |
| 命令执行 | 运行 shell 命令、执行脚本 |
| 信息检索 | 搜索引擎、数据库查询、API 调用 |
| 代码分析 | 依赖分析、语法解析、测试执行 |

一个好工具最少要包含三部分：**名称**、**描述**、**参数定义**。

### 3.3 Memory：记忆

- **短期记忆**：当前会话的消息历史
- **长期记忆**：跨会话保留的知识或偏好
- **工作记忆**：系统提示词、规则、任务边界

### 3.4 Orchestrator：编排器

编排器决定“怎么做”：

- 如何拆任务
- 工具按什么顺序执行
- 失败后如何恢复
- 什么时候该停止

在最简单的实现里，这个编排器其实就是一个 ReAct 循环。

## 4. ReAct：让模型学会“想一步，做一步”

### 4.1 什么是 ReAct？

ReAct 来自论文 *ReAct: Synergizing Reasoning and Acting in Language Models*。它的核心思想是：**推理和行动要交替进行**。

- 只推理不行动，容易幻觉
- 只行动不推理，容易乱用工具
- 推理指导行动，行动结果再反过来校验推理

### 4.2 Thought → Action → Observation

```text
用户问题
   │
   ▼
Thought: 我需要先查看项目结构
   │
   ▼
Action: list_files({"path": "src"})
   │
   ▼
Observation: Main.java, ReActLoop.java, ...
   │
   ▼
Thought: 已确认目录结构，接下来读取核心类
```

这个循环会持续进行，直到模型认为任务已经完成。

### 4.3 为什么它有效？

| 方式 | 主要问题 |
|------|----------|
| 纯 Chain-of-Thought | 容易脱离真实世界信息 |
| 纯 Tool Use | 缺少规划，执行零散 |
| ReAct | 推理有依据，行动有方向 |

ReAct 的另一个优势是可解释性强。你能看到模型为什么调用某个工具，也能看到工具结果如何影响下一步。

## 5. Tool Use / Function Calling：给 LLM 装上手脚

Agent 能不能真正落地，基础就在 Tool Use。

### 5.1 工作流程

```text
开发者                  LLM API                    工具运行时
   │                      │                           │
   │─ messages + tools ─> │                           │
   │                      │─ 模型决定调用工具 ───────> │
   │ <─ tool_calls ────── │                           │
   │─ 实际执行工具 ─────────────────────────────────> │
   │ <─ 工具结果 ──────────────────────────────────── │
   │─ 把结果追加回消息历史 ─> │                       │
   │ <─ final response ─── │                         │
```

### 5.2 三个关键概念

**1. 工具定义**

```json
{
  "type": "function",
  "function": {
    "name": "read_file",
    "description": "Read the contents of a file at the given path",
    "parameters": {
      "type": "object",
      "properties": {
        "path": {
          "type": "string",
          "description": "The file path to read"
        }
      },
      "required": ["path"]
    }
  }
}
```

**2. 工具调用**

```json
{
  "role": "assistant",
  "content": "我需要先读取这个文件的内容...",
  "tool_calls": [{
    "id": "call_abc123",
    "type": "function",
    "function": {
      "name": "read_file",
      "arguments": "{\"path\": \"src/Main.java\"}"
    }
  }]
}
```

**3. 工具结果**

```json
{
  "role": "tool",
  "tool_call_id": "call_abc123",
  "content": "package agent;\n\npublic class Main {\n    ..."
}
```

### 5.3 一个容易被忽略但很重要的事实

**LLM 不会自己执行工具。**

它只会输出一个结构化的“调用请求”，真正执行工具的是宿主程序。这件事很关键，因为它意味着：

- **安全性**：执行权限仍然由开发者控制
- **灵活性**：工具背后可以接任何系统
- **可审计性**：每次调用都能记录下来

## 6. 常见 Agentic 架构模式

很多团队一提 Agent，就默认想到复杂的多智能体系统。但实践里，更常见也更有效的方式往往是从简单模式开始。

```text
增强 LLM → 提示链 → 路由 → 并行化 → 编排者-工人 → 自主 Agent
```

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| 增强 LLM | LLM + 检索 + 工具 | 所有 Agent 的基础 |
| 提示链 | 固定顺序的多次调用 | 生成、审查、修正 |
| 路由 | 先分类，再分发处理 | 客服、意图识别 |
| 并行化 | 多路分析后聚合 | 多视角评估 |
| 编排者-工人 | 动态拆解任务 | 复杂多步骤流程 |
| 自主 Agent | 在循环里自主决策 | 开放式任务 |

一个很实用的原则是：**先从最简单的方案开始，只在必要时增加复杂度。**

## 7. 动手实现：零框架构建一个 Coding Agent

理解 Agent 最快的方法，不是先学一个大而全的框架，而是自己实现一个最小可用版本。

下面是一个不依赖 Agent 框架的 Java 演示项目结构：

```text
code-agent-native-demo/
├── pom.xml
├── agent.properties.example
└── src/main/java/agent/
    ├── Main.java
    ├── AgentConfig.java
    ├── SystemPrompt.java
    ├── ConversationHistory.java
    ├── LLMClient.java
    ├── LLMLogger.java
    ├── ReActLoop.java
    ├── ToolRegistry.java
    ├── ToolDefinition.java
    ├── ToolResult.java
    ├── ConsoleRenderer.java
    └── tools/
        ├── Tool.java
        ├── ReadFileTool.java
        ├── WriteFileTool.java
        ├── ListFilesTool.java
        └── ExecuteCommandTool.java
```

这个实现的一个重点是：**外部依赖只有 Gson，HTTP 客户端直接用 JDK 17 自带的 `HttpClient`。**

### 7.1 Tool 接口：定义契约

```java
public interface Tool {
    String name();
    String description();
    JsonObject parameterSchema();
    ToolResult execute(JsonObject args);
}
```

前三个方法是给模型看的，最后一个方法是给运行时用的。

### 7.2 ToolDefinition：转成 API 需要的格式

```java
public static JsonObject toFunctionSchema(Tool tool) {
    JsonObject function = new JsonObject();
    function.addProperty("name", tool.name());
    function.addProperty("description", tool.description());
    function.add("parameters", tool.parameterSchema());

    JsonObject wrapper = new JsonObject();
    wrapper.addProperty("type", "function");
    wrapper.add("function", function);
    return wrapper;
}
```

### 7.3 ToolRegistry：负责注册和分发

```java
public class ToolRegistry {
    private final Map<String, Tool> tools = new LinkedHashMap<>();

    public ToolRegistry() {
        register(new ReadFileTool());
        register(new WriteFileTool());
        register(new ListFilesTool());
        register(new ExecuteCommandTool());
    }
}
```

增加一个新工具，通常只需要两步：

1. 实现 `Tool` 接口
2. 在 `ToolRegistry` 里注册

### 7.4 ConversationHistory：管理上下文

```java
public class ConversationHistory {
    private final List<JsonObject> messages = new ArrayList<>();
    private String systemPrompt;

    public void addUserMessage(String content) { ... }
    public void addAssistantMessage(JsonObject assistantMessage) { ... }
    public void addToolResult(String toolCallId, String content) { ... }
}
```

对话里常见四种消息角色：

| 角色 | 说明 |
|------|------|
| `system` | 行为规范和边界 |
| `user` | 用户输入 |
| `assistant` | 模型回复，可能包含工具调用 |
| `tool` | 工具返回结果 |

### 7.5 LLMClient：请求大模型接口

```java
public JsonObject chatCompletion(JsonArray messages, JsonArray tools) throws Exception {
    JsonObject body = new JsonObject();
    body.addProperty("model", model);
    body.add("messages", messages);
    if (tools != null && tools.size() > 0) {
        body.add("tools", tools);
    }

    HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
            .build();

    HttpResponse<String> response =
            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    return JsonParser.parseString(response.body()).getAsJsonObject();
}
```

这类实现通常兼容 OpenAI 风格的接口协议，因此可以对接多种模型供应商。

### 7.6 ReActLoop：最核心的循环

```java
public void run(ConversationHistory history) {
    JsonArray tools = toolRegistry.toJsonArray();

    for (int iteration = 0; iteration < maxIterations; iteration++) {
        JsonObject response = llmClient.chatCompletion(history.toJsonArray(), tools);

        JsonObject message = response.getAsJsonArray("choices")
                .get(0).getAsJsonObject()
                .getAsJsonObject("message");
        String content = message.has("content")
                ? message.get("content").getAsString()
                : null;

        if (message.has("tool_calls") && message.getAsJsonArray("tool_calls").size() > 0) {
            history.addAssistantMessage(message);

            for (JsonElement tc : message.getAsJsonArray("tool_calls")) {
                String toolCallId = tc.getAsJsonObject().get("id").getAsString();
                String toolName = tc.getAsJsonObject()
                        .getAsJsonObject("function")
                        .get("name").getAsString();
                String argsString = tc.getAsJsonObject()
                        .getAsJsonObject("function")
                        .get("arguments").getAsString();

                JsonObject args = JsonParser.parseString(argsString).getAsJsonObject();
                ToolResult result = toolRegistry.execute(toolName, args);
                history.addToolResult(toolCallId, result.output());
            }
            continue;
        }

        return;
    }
}
```

这段逻辑其实就做了两件事：

1. 让模型基于完整上下文做决策
2. 如果模型请求工具，就执行工具并把结果再喂回去

这不到 50 行的循环，就是一个最小 ReAct Agent 的核心。

### 7.7 一次完整执行过程

假设用户输入：

```text
帮我看看 pom.xml 用了什么依赖
```

一次执行可能会长这样：

```text
[Thought] 用户想知道 pom.xml 的依赖信息，我需要先读取这个文件
[Action]  read_file({"path": "pom.xml"})
[Observe] <project> ... <artifactId>gson</artifactId> ... </project>
[Answer]  项目只有一个外部依赖：Gson，用于 JSON 解析。
```

### 7.8 为什么“零框架”仍然有价值？

在很多场景里，直接使用 LLM API 加上少量编排代码，就已经足够。

这种方式的价值在于：

| 优势 | 说明 |
|------|------|
| 深入理解 | 能真正看清 Agent 的底层运行方式 |
| 最小依赖 | 没有多余框架负担 |
| 完全可控 | 错误处理、日志、策略都自己掌握 |
| 易于调试 | 直接看请求、响应和工具结果 |

理解原理之后，再去用框架，判断会准确很多。

## 8. 真实应用场景

### 8.1 软件开发

- 编码助手：读代码、改代码、跑测试、提 PR
- 代码审查：发现 bug、风险和安全问题
- 测试生成：分析逻辑后自动补测试
- 运维辅助：分析日志、定位故障、执行修复

### 8.2 企业应用

- 智能客服：接知识库、工单系统、CRM
- 数据分析：自然语言转 SQL、执行并产出报告
- 文档处理：跨格式抽取、结构化和归档

### 8.3 行业场景

- 金融：风控、合规、报告自动化
- 医疗：文档辅助、药物交互检查
- 法律：合同审查、法规检索

## 9. 当前生态与趋势

### 9.1 常见框架

| 框架 | 语言 | 特点 |
|------|------|------|
| LangChain / LangGraph | Python, JS | 生态最广，适合复杂编排 |
| Spring AI | Java | 更适合企业 Java 场景 |
| Vercel AI SDK | TypeScript | 前端和流式体验友好 |
| AutoGen | Python | 偏多 Agent 协作 |
| CrewAI | Python | 基于角色的多 Agent 编排 |
| LlamaIndex | Python | 偏检索增强与知识场景 |

### 9.2 协议标准

**MCP（Model Context Protocol）**

MCP 正在成为模型与外部工具连接的标准接口。它的意义很像“AI 世界的通用外设协议”：工具提供方只要实现协议，客户端就能以一致方式接入。

**A2A（Agent-to-Agent Protocol）**

A2A 面向的是 Agent 与 Agent 之间的通信与协作，适合多智能体系统。

### 9.3 一个明显趋势

过去大家在讨论“模型能力”，现在越来越多团队开始讨论“系统能力”：

- 模型如何接外部工具
- 状态如何持久化
- 执行如何审计和回滚
- Agent 如何在真实生产环境中可控运行

这说明 Agent 已经从演示阶段进入工程化阶段。

## 10. 总结

如果要把整篇文章压缩成几句话，我会保留这几条：

1. **Agent = LLM + Tools + Loop**
2. **ReAct 是最基础也最重要的执行模式**
3. **工具设计往往比 prompt 技巧更关键**
4. **很多问题不需要一上来就做复杂多 Agent**
5. **理解底层原理，比记住某个框架 API 更重要**

对研发团队来说，Agent 不是一个“新聊天框”，而是一种新的软件形态：模型不只是回答问题，而是开始参与执行流程。

而真正决定它能不能进入生产的，往往不是模型本身，而是工具边界、编排逻辑、状态管理、权限控制和可观测性这些工程细节。

## 参考资料

- Anthropic, *Building Effective Agents*  
  https://www.anthropic.com/engineering/building-effective-agents
- Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models*  
  https://arxiv.org/abs/2210.03629
- Anthropic, Tool Use Documentation  
  https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview
- Model Context Protocol  
  https://modelcontextprotocol.io/
- OpenAI, Function Calling Guide  
  https://platform.openai.com/docs/guides/function-calling
- Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*  
  https://arxiv.org/abs/2201.11903

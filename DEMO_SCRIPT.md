# Claude Code 演示剧本

## 演示概述

本次演示将展示 Claude Code 的核心能力，包括安装使用、关键功能、扩展机制，以及通过一个实际项目演示 AI 辅助编程的完整流程。

---

## 第一部分：安装与启动

### 1.1 安装 Claude Code

**旁白：**
> Claude Code 是 Anthropic 官方推出的命令行 AI 编程助手，可以直接在终端中与 Claude 进行交互，完成代码编写、调试、重构等任务。

**演示命令：**
```bash
# 使用 npm 全局安装
npm install -g @anthropic-ai/claude-code

# 验证安装
claude --version
```

**说明要点：**
- 需要 Node.js 18+ 环境
- 安装后会获得 `claude` 命令
- 首次使用需要登录 Anthropic 账号进行授权

### 1.2 启动 Claude Code

**演示命令：**
```bash
# 进入项目目录
cd ~/Desktop/github-codes/api-tester

# 启动 Claude Code
claude
```

**说明要点：**
- Claude Code 会自动识别当前目录为工作区
- 自动检测 git 仓库状态
- 进入交互式对话界面

---

## 第二部分：核心功能演示

### 2.1 Resume - 会话恢复

**旁白：**
> Claude Code 支持会话恢复功能，可以继续之前中断的对话，保持上下文连贯性。

**演示命令：**
```bash
# 查看历史会话列表
claude --resume

# 或者直接恢复最近的会话
claude -c
```

**说明要点：**
- `--resume` 显示可恢复的会话列表
- `-c` 或 `--continue` 直接继续最近一次会话
- 会话上下文完整保留，无需重复说明背景

### 2.2 @ 引用 - 文件和文件夹引用

**旁白：**
> 使用 @ 符号可以快速引用文件或文件夹，让 Claude 直接读取相关内容，无需手动粘贴代码。

**演示操作：**
```
# 在对话中输入：
请帮我分析 @frontend/src/App.jsx 这个文件的结构

# 引用整个文件夹：
请解读 @backend 目录下的代码架构

# 引用多个文件：
对比 @frontend/package.json 和 @backend/package.json 的依赖差异
```

**说明要点：**
- 输入 `@` 后会自动补全文件路径
- 支持引用单个文件或整个目录
- Claude 会自动读取并理解引用的内容
- 大幅减少上下文切换，提高沟通效率

### 2.3 Compact - 上下文压缩

**旁白：**
> 当对话变长时，可以使用 /compact 命令压缩上下文，保留关键信息的同时释放 token 空间。

**演示操作：**
```
# 在对话中输入：
/compact
```

**说明要点：**
- 自动总结之前的对话内容
- 保留重要的代码上下文和决策
- 释放 token 空间用于后续对话
- 适合长时间编程会话使用

---

## 第三部分：扩展机制介绍

### 3.1 MCP (Model Context Protocol)

**旁白：**
> MCP 是模型上下文协议，允许 Claude Code 连接外部数据源和工具，扩展其能力边界。

**说明要点：**
- 可以连接数据库、API、文件系统等外部资源
- 支持自定义 MCP Server 扩展功能
- 配置文件位于 `~/.claude/` 目录

**配置示例：**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "/path/to/allowed/dir"]
    }
  }
}
```

### 3.2 Agent - 智能代理

**旁白：**
> Claude Code 内置多种专业 Agent，可以自主完成复杂的多步骤任务。

**说明要点：**
- **Explore Agent**: 代码库探索，快速理解项目结构
- **Plan Agent**: 任务规划，设计实现方案
- **Bash Agent**: 命令执行，处理终端操作
- Agent 可以并行工作，提高效率

### 3.3 Skill - 技能扩展

**旁白：**
> Skill 是可复用的任务模板，通过斜杠命令快速调用预定义的工作流。

**常用 Skill 示例：**
```
/commit          # 智能生成 commit message 并提交
/review-pr       # 审查 Pull Request
/skill-creator   # 创建自定义 Skill
```

**说明要点：**
- 使用 `/` 前缀调用 Skill
- 可以创建团队共享的自定义 Skill
- 封装最佳实践，保证一致性

---

## 第四部分：实战演示 - API Tester 项目

### 4.1 代码仓库解读

**旁白：**
> 现在让我们用 Claude Code 来解读这个 API Tester 项目，看看 AI 如何快速理解一个陌生的代码库。

**演示输入：**
```
请帮我全面解读这个项目的代码结构和功能，包括：
1. 项目整体架构
2. 前后端技术栈
3. 核心功能模块
4. 数据流转过程
```

**预期 Claude 输出要点：**
- 识别出前后端分离架构
- 前端：React + Vite
- 后端：Express + Redis
- 核心功能：HTTP 请求代理、历史记录、模板管理、分组功能

### 4.2 新功能开发 - Generate Code

**旁白：**
> 接下来演示 Claude Code 最强大的能力——根据需求自动编写代码。我们要实现一个"生成代码"功能。

**演示输入：**
```
请帮我实现一个 "Generate Code" 功能：

需求描述：
1. 在请求栏旁边添加一个 "Generate Code" 按钮
2. 点击后弹出一个模态框
3. 模态框内使用 Tab 页展示不同编程语言的示例代码
4. 支持的语言：cURL、JavaScript (fetch)、Python (requests)、Go、Java、PHP
5. 代码应该根据当前填写的请求信息（method、url、headers、body）动态生成
6. 每个 Tab 页内的代码支持一键复制

请直接修改代码实现这个功能。
```

**演示过程说明：**
- 观察 Claude 如何分析现有代码结构
- 观察 Claude 如何规划实现方案
- 观察 Claude 自动编辑多个文件
- 展示生成的代码质量

### 4.3 启动项目并演示

**旁白：**
> 代码写完了，让 Claude 帮我们启动项目，验证功能是否正常。

**演示输入：**
```
请帮我启动这个项目，我需要同时运行前端和后端服务。
```

**预期操作：**
- Claude 自动识别启动命令
- 启动 Redis（如需要）
- 启动后端服务 (npm run dev)
- 启动前端服务 (npm run dev)
- 提供访问地址

**功能验证：**
1. 打开浏览器访问 http://localhost:5173
2. 填写一个示例请求（如 GET https://api.github.com）
3. 点击 "Generate Code" 按钮
4. 展示模态框中各语言的代码生成效果
5. 演示代码复制功能

### 4.4 提交代码

**旁白：**
> 功能开发完成，最后让 Claude 帮我们提交代码。

**演示输入：**
```
请帮我提交这次的代码改动
```

**预期操作：**
- Claude 自动执行 git status 查看改动
- 分析改动内容，生成合适的 commit message
- 执行 git add 和 git commit
- 展示提交结果

---

## 第五部分：总结

### 演示回顾

**旁白：**
> 让我们回顾一下今天演示的内容：

1. **安装启动** - 一行命令安装，进入项目目录即可使用
2. **核心功能** - Resume 会话恢复、@ 文件引用、Compact 上下文压缩
3. **扩展机制** - MCP 协议扩展、Agent 智能代理、Skill 技能模板
4. **实战演示** - 代码解读、功能开发、项目启动、代码提交

### 关键价值

- **效率提升**：自然语言描述需求，AI 自动编写代码
- **学习成本低**：无需记忆复杂命令，对话式交互
- **上下文理解**：AI 理解整个项目，给出符合现有风格的代码
- **全流程覆盖**：从理解代码到开发测试到提交，一站式完成

---

## 附录：常用命令速查

| 命令 | 说明 |
|------|------|
| `claude` | 启动 Claude Code |
| `claude -c` | 继续上次会话 |
| `claude --resume` | 选择历史会话恢复 |
| `@文件路径` | 引用文件内容 |
| `/compact` | 压缩上下文 |
| `/help` | 查看帮助信息 |
| `Ctrl+C` | 中断当前操作 |
| `exit` 或 `Ctrl+D` | 退出 Claude Code |

---

*演示预计时长：15-20 分钟*

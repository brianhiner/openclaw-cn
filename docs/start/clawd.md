---
summary: "运行 Clawdbot 作为个人助手的端到端指南，包含安全警告"
read_when:
  - 新建助手实例
  - 审查安全/权限影响
---
# 使用 Clawdbot 构建个人助手（Clawd 风格）

Clawdbot 是一个用于 **Pi** 代理的 WhatsApp + Telegram + Discord + iMessage 网关。插件增加了 Mattermost 支持。本指南是 "个人助手" 设置：一个专用的 WhatsApp 号码，行为类似于您始终在线的代理。

## ⚠️ 安全第一

您将代理置于以下位置：
- 在您的机器上运行命令（取决于您的 Pi 工具设置）
- 读取/写入工作区中的文件
- 通过 WhatsApp/Telegram/Discord/Mattermost（插件）发送消息

保守开始：
- 始终设置 `channels.whatsapp.allowFrom`（永远不要在您的个人 Mac 上运行面向全世界开放的服务）。
- 为助手使用专用的 WhatsApp 号码。
- 心跳现在默认每 30 分钟一次。在信任设置之前禁用，方法是设置 `agents.defaults.heartbeat.every: "0m"`。
## 先决条件

- Node **22+**
- Clawdbot 在 PATH 中可用（推荐：全局安装）
- 助手的第二个电话号码（SIM/eSIM/预付费）

```bash
npm install -g moltbot-cn@latest
# 或：pnpm add -g moltbot-cn@latest
```

从源码（开发）：

```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖
pnpm build
pnpm link --global
```

## 双手机设置（推荐）

您需要这样：

```
您的手机（个人）              第二部手机（助手）
┌─────────────────┐           ┌─────────────────┐
│  您的 WhatsApp  │  ──────▶  │  助手 WA        │
│  +1-555-YOU     │  消息     │  +1-555-CLAWD   │
└─────────────────┘           └────────┬────────┘
                                       │ 通过二维码连接
                                       ▼
                              ┌─────────────────┐
                              │  您的 Mac       │
                              │  (clawdbot)      │
                              │    Pi 代理      │
                              └─────────────────┘
```

如果您将个人 WhatsApp 与 Clawdbot 关联，每条发给您的消息都会变成 "代理输入"。这很少是您想要的结果。
## 5分钟快速开始

1) 配对 WhatsApp Web（显示二维码；用助手手机扫描）：

```bash
moltbot-cn channels login
```

2) 启动网关（保持运行）：

```bash
moltbot-cn gateway --port 18789
```

3) 在 `~/.clawdbot/clawdbot.json` 中放置最小配置：

```json5
{
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}
```

现在从您的白名单手机向助手号码发送消息。

入门完成后，我们会自动打开带有网关令牌的仪表板并打印令牌化链接。稍后重新打开：`moltbot-cn dashboard`。
## 给代理一个工作空间（AGENTS）

Clawd 从其工作空间目录读取操作指令和 "记忆"。

默认情况下，Clawdbot 使用 `~/clawd` 作为代理工作空间，并将在设置/首次代理运行时自动创建它（以及初始的 `AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md`）。`BOOTSTRAP.md` 仅在工作空间全新时创建（删除后不应再出现）。

提示：将此文件夹视为 Clawd 的 "记忆" 并将其设为 git 仓库（理想情况下是私有的），以便备份您的 `AGENTS.md` + 记忆文件。如果安装了 git，全新的工作空间会自动初始化。

```bash
moltbot-cn setup
```

完整的工作空间布局 + 备份指南：[代理工作空间](/concepts/agent-workspace)
记忆工作流程：[记忆](/concepts/memory)

可选：使用 `agents.defaults.workspace` 选择不同的工作空间（支持 `~`）。

```json5
{
  agent: {
    workspace: "~/clawd"
  }
}
```

如果您已经从仓库部署自己的工作空间文件，您可以完全禁用引导文件创建：

```json5
{
  agent: {
    skipBootstrap: true
  }
}
```
## 将其转变为 "助手" 的配置

Clawdbot 默认为良好的助手设置，但通常您需要调整：
- `SOUL.md` 中的个性/指令
- 思考默认值（如需要）
- 心跳（一旦信任它）

示例：

```json5
{
  logging: { level: "info" },
  agent: {
    model: "anthropic/claude-opus-4-5",
    workspace: "~/clawd",
    thinkingDefault: "high",
    timeoutSeconds: 1800,
    // 从 0 开始；稍后启用。
    heartbeat: { every: "0m" }
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: {
        "*": { requireMention: true }
      }
    }
  },
  routing: {
    groupChat: {
      mentionPatterns: ["@clawd", "clawd"]
    }
  },
  session: {
    scope: "per-sender",
    resetTriggers: ["/new", "/reset"],
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 10080
    }
  }
}
```
## 会话和记忆

- 会话文件：`~/.clawdbot/agents/<agentId>/sessions/{{SessionId}}.jsonl`
- 会话元数据（令牌使用情况、最后路由等）：`~/.clawdbot/agents/<agentId>/sessions/sessions.json`（旧版：`~/.clawdbot/sessions/sessions.json`）
- `/new` 或 `/reset` 为此聊天启动一个新会话（可通过 `resetTriggers` 配置）。如果单独发送，代理会回复简短问候以确认重置。
- `/compact [instructions]` 压缩会话上下文并报告剩余的上下文预算。
## 心跳（主动模式）

默认情况下，Clawdbot 每 30 分钟运行一次心跳，提示为：
`如果存在 HEARTBEAT.md，则阅读它（工作区上下文）。严格遵循它。不要从之前的聊天中推断或重复旧任务。如果没有需要注意的事情，回复 HEARTBEAT_OK。`
设置 `agents.defaults.heartbeat.every: "0m"` 以禁用。

- 如果 `HEARTBEAT.md` 存在但实际上是空的（只有空白行和像 `# 标题` 这样的 markdown 标题），Clawdbot 会跳过心跳运行以节省 API 调用。
- 如果文件缺失，心跳仍会运行，模型决定做什么。
- 如果代理回复 `HEARTBEAT_OK`（可选择带短填充；参见 `agents.defaults.heartbeat.ackMaxChars`），Clawdbot 会抑制该心跳的出站传递。
- 心跳运行完整的代理回合 — 较短的间隔会消耗更多令牌。

```json5
{
  agent: {
    heartbeat: { every: "30m" }
  }
}
```
## 媒体输入和输出

传入附件（图像/音频/文档）可以通过模板呈现给您的命令：
- `{{MediaPath}}`（本地临时文件路径）
- `{{MediaUrl}}`（伪 URL）
- `{{Transcript}}`（如果启用了音频转录）

代理的传出附件：在单独一行包含 `MEDIA:<path-or-url>`（无空格）。例如：

```
这是截图。
MEDIA:/tmp/screenshot.png
```

Clawdbot 提取这些并随文本一起作为媒体发送。
## 操作清单

```bash
moltbot-cn status          # 本地状态（凭据、会话、排队事件）
moltbot-cn status --all    # 完整诊断（只读、可粘贴）
moltbot-cn status --deep   # 添加网关健康检查（Telegram + Discord）
moltbot-cn health --json   # 网关健康快照（WS）
```

日志位于 `/tmp/clawdbot/` 下（默认：`clawdbot-YYYY-MM-DD.log`）。

## 下一步

- WebChat：[WebChat](/web/webchat)
- 网关操作：[网关运行手册](/gateway)
- Cron + 唤醒：[Cron 作业](/automation/cron-jobs)
- macOS 菜单栏伴侣：[Clawdbot macOS 应用](/platforms/macos)
- iOS 节点应用：[iOS 应用](/platforms/ios)
- Android 节点应用：[Android 应用](/platforms/android)
- Windows 状态：[Windows (WSL2)](/platforms/windows)
- Linux 状态：[Linux 应用](/platforms/linux)
- 安全：[安全](/gateway/security)
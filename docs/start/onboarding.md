---
summary: "Clawdbot（macOS 应用）首次运行入门流程"
read_when:
  - 设计 macOS 入门助手
  - 实现认证或身份设置
---
# 入门（macOS 应用）

本文档描述了**当前**首次运行的入门流程。目标是
顺畅的 "第 0 天" 体验：选择网关运行位置，连接认证，运行
向导，然后让代理自行引导。

## 页面顺序（当前）

1) 欢迎 + 安全通知
2) **网关选择**（本地 / 远程 / 稍后配置）
3) **认证（Anthropic OAuth）** — 仅本地
4) **设置向导**（网关驱动）
5) **权限**（TCC 提示）
6) **CLI**（可选）
7) **入门聊天**（专用会话）
8) 准备就绪
## 1) 本地与远程

**网关**在哪里运行？

- **本地（这台 Mac）：** 入门可以运行 OAuth 流程并在本地写入凭据。
- **远程（通过 SSH/Tailnet）：** 入门**不会**在本地运行 OAuth；
  凭据必须存在于网关主机上。
- **稍后配置：** 跳过设置并保持应用未配置。

网关认证提示：
- 向导现在甚至为回环生成一个**令牌**，因此本地 WS 客户端必须进行认证。
- 如果您禁用认证，任何本地进程都可以连接；仅在完全受信任的机器上使用。
- 对于多机访问或非回环绑定，请使用**令牌**。
## 2) 仅本地认证（Anthropic OAuth）

macOS 应用支持 Anthropic OAuth（Claude Pro/Max）。流程：

- 打开浏览器进行 OAuth（PKCE）
- 要求用户粘贴 `code#state` 值
- 将凭据写入 `~/.clawdbot/credentials/oauth.json`

其他提供商（OpenAI、自定义 API）目前通过环境变量或配置文件配置。
## 3) 设置向导（网关驱动）

应用可以运行与 CLI 相同的设置向导。这使入门与网关端行为保持同步
并避免在 SwiftUI 中重复逻辑。

## 4) 权限

入门请求 TCC 权限以用于：

- 通知
- 辅助功能
- 屏幕录制
- 麦克风 / 语音识别
- 自动化（AppleScript）

## 5) CLI（可选）

应用可以通过 npm/pnpm 安装全局 `clawdbot` CLI，这样终端
工作流和 launchd 任务就可以开箱即用。

## 6) 入门聊天（专用会话）

设置后，应用会打开一个专用的入门聊天会话，以便代理可以
自我介绍并指导下一步。这使首次运行指导与您的
正常对话分开。
## 代理引导仪式

在首次代理运行时，Clawdbot 引导一个工作空间（默认为 `~/clawd`）：

- 初始化 `AGENTS.md`、`BOOTSTRAP.md`、`IDENTITY.md`、`USER.md`
- 运行一个简短的问答仪式（一次一个问题）
- 将身份 + 偏好写入 `IDENTITY.md`、`USER.md`、`SOUL.md`
- 完成后移除 `BOOTSTRAP.md`，使其只运行一次

## 可选：Gmail 钩子（手动）

Gmail Pub/Sub 设置目前是一个手动步骤。使用：

```bash
moltbot-cn webhooks gmail setup --account you@gmail.com
```

详情请参见 [/automation/gmail-pubsub](/automation/gmail-pubsub)。

## 远程模式说明

当网关在另一台机器上运行时，凭据和工作空间文件存储在**该主机上**。如果需要在远程模式下使用 OAuth，请在网关主机上创建：

- `~/.clawdbot/credentials/oauth.json`
- `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`

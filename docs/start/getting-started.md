---
summary: "初学者指南：从零到第一条消息（向导、认证、通道、配对）"
read_when:
  - 零基础首次设置
  - 想要最快地从安装 → 入门 → 发送首条消息
---

# 开始使用

目标：尽可能快地从**零** → **首次可用聊天**（使用合理默认值）。

推荐路径：使用**CLI 入门向导**（`moltbot-cn onboard`）。它会设置：
- 模型/认证（推荐 OAuth）
- 网关设置
- 通道（WhatsApp/Telegram/Discord/Mattermost（插件）/...）
- 配对默认值（安全私信）
- 工作区引导 + 技能
- 可选后台服务

如果您想了解更深层的参考页面，请跳转至：[向导](/start/wizard)，[设置](/start/setup)，[配对](/start/pairing)，[安全](/gateway/security)。

沙盒说明：`agents.defaults.sandbox.mode: "non-main"` 使用 `session.mainKey`（默认为`"main"`），
因此群组/频道会话会被沙盒化。如果希望主代理始终
在主机上运行，请设置明确的每个代理覆盖：

```json
{
  "routing": {
    "agents": {
      "main": {
        "workspace": "~/clawd",
        "sandbox": { "mode": "off" }
      }
    }
  }
}
```

## 0) 前提条件

- Node `>=22`
- `pnpm`（可选；如果从源码构建则推荐）
- **推荐：** 用于网络搜索的 Brave Search API 密钥。最简单的路径：
  `moltbot-cn configure --section web`（存储 `tools.web.search.apiKey`）。
  参见 [Web 工具](/tools/web)。

macOS：如果计划构建应用程序，请安装 Xcode / CLT。仅 CLI + 网关的话，Node 就足够了。
Windows：使用 **WSL2**（推荐 Ubuntu）。强烈推荐 WSL2；原生 Windows 未经测试，问题更多，工具兼容性也较差。请先安装 WSL2，然后在 WSL 内运行 Linux 步骤。参见 [Windows (WSL2)](/platforms/windows)。

## 1) 安装 CLI（推荐）

```bash
curl -fsSL https://clawd.org.cn/install.sh | bash
```

安装程序选项（安装方法、非交互式、来自 GitHub）：[安装](/install)。

Windows（PowerShell）：

```powershell
iwr -useb https://clawd.org.cn/install.ps1 | iex
```

替代方案（全局安装）：

```bash
npm install -g moltbot-cn@latest
```

```bash
pnpm add -g moltbot-cn@latest
```

## 2) 运行入门向导（并安装服务）

```bash
moltbot-cn onboard --install-daemon
```

您将选择：
- **本地与远程**网关
- **认证**：OpenAI Code（Codex）订阅（OAuth）或 API 密钥。对于 Anthropic 我们推荐使用 API 密钥；也支持 `claude setup-token`。
- **提供商**：WhatsApp QR 登录、Telegram/Discord 机器人令牌、Mattermost 插件令牌等。
- **守护进程**：后台安装（launchd/systemd；WSL2 使用 systemd）
  - **运行时**：Node（推荐；WhatsApp/Telegram 必需）。**不推荐**使用 Bun。
- **网关令牌**：向导默认生成一个（即使在回环地址上）并存储在 `gateway.auth.token` 中。

向导文档：[向导](/start/wizard)

### 认证：其存储位置（重要）

- **推荐的 Anthropic 路径：** 设置一个 API 密钥（向导可以将其存储以供服务使用）。如果您想重用 Claude Code 凭据，也支持 `claude setup-token`。

- OAuth 凭据（旧版导入）：`~/.clawdbot/credentials/oauth.json`
- 认证配置文件（OAuth + API 密钥）：`~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`

无头/服务器提示：先在普通机器上完成 OAuth，然后将 `oauth.json` 复制到网关主机。

## 3) 启动网关

如果您在入门过程中安装了服务，网关应该已经在运行：

```bash
moltbot-cn gateway status
```

手动运行（前台）：

```bash
moltbot-cn gateway --port 18789 --verbose
```

仪表板（本地回环）：`http://127.0.0.1:18789/`
如果配置了令牌，请将其粘贴到控制界面设置中（存储为 `connect.params.auth.token`）。

⚠️ **Bun 警告（WhatsApp + Telegram）：** Bun 在这些
渠道上有已知问题。如果您使用 WhatsApp 或 Telegram，请使用 **Node** 运行网关。
## 3.5) 快速验证（2 分钟）

```bash
moltbot-cn status
moltbot-cn health
```

## 4) 配对 + 连接您的首个聊天界面

### WhatsApp（二维码登录）

```bash
moltbot-cn channels login
```

通过 WhatsApp → 设置 → 已连接的设备 扫描。

WhatsApp 文档：[WhatsApp](/channels/whatsapp)

### Telegram / Discord / 其他

向导可以为您写入令牌/配置。如果您更喜欢手动配置，请从以下开始：
- Telegram：[Telegram](/channels/telegram)
- Discord：[Discord](/channels/discord)
- Mattermost（插件）：[Mattermost](/channels/mattermost)

**Telegram 私信提示：** 您的首次私信会返回一个配对码。批准它（参见下一步）或机器人不会响应。
## 5) 私信安全（配对审批）

默认策略：未知私信会收到一个短代码，消息在获得批准前不会被处理。
如果您的首次私信没有得到回复，请批准配对：

```bash
moltbot-cn pairing list whatsapp
moltbot-cn pairing approve whatsapp <code>
```

配对文档：[配对](/start/pairing)

## 从源码运行（开发）

如果您正在修改 Clawdbot 本身，请从源码运行：

```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖
pnpm build
moltbot-cn onboard --install-daemon
```

如果您还没有全局安装，请从仓库中通过 `pnpm moltbot-cn ...` 运行入门步骤。

网关（来自此仓库）：

```bash
node dist/entry.js gateway --port 18789 --verbose
```

## 7) 端到端验证

在新的终端中，发送一条测试消息：

```bash
moltbot-cn message send --target +15555550123 --message "Hello from Clawdbot"
```

如果 `moltbot-cn health` 显示 "no auth configured"，请返回向导并设置 OAuth/密钥认证 — 代理在没有它的情况下无法响应。

提示：`moltbot-cn status --all` 是最佳的可粘贴只读调试报告。
健康检查：`moltbot-cn health`（或 `moltbot-cn status --deep`）向运行中的网关请求健康快照。

## 下一步（可选，但很棒）

- macOS 菜单栏应用 + 语音唤醒：[macOS 应用](/platforms/macos)
- iOS/Android 节点（Canvas/摄像头/语音）：[节点](/nodes)
- 远程访问（SSH 隧道 / Tailscale 服务）：[远程访问](/gateway/remote) 和 [Tailscale](/gateway/tailscale)
- 始终在线 / VPN 设置：[远程访问](/gateway/remote)，[exe.dev](/platforms/exe-dev)，[Hetzner](/platforms/hetzner)，[macOS 远程](/platforms/mac/remote)

---
summary: "设置指南：在保持最新版本的同时保持您的 Clawdbot 设置个性化"
read_when:
  - 设置新机器
  - 您想要 "最新 + 最佳" 版本而不破坏您的个人设置
---

# 设置

最后更新：2026-01-01

## 概述
- **定制化存在于仓库之外：** `~/clawd`（工作区）+ `~/.clawdbot/clawdbot.json`（配置）。
- **稳定工作流程：** 安装 macOS 应用；让它运行捆绑的网关。
- **前沿工作流程：** 通过 `pnpm gateway:watch` 自己运行网关，然后让 macOS 应用以本地模式附加。

## 先决条件（从源码）
- Node `>=22`
- `pnpm`
- Docker（可选；仅用于容器化设置/e2e — 参见 [Docker](/install/docker)）

## 定制策略（因此更新不会造成损害）

如果您想要 "100% 适合我" *并且* 易于更新，请将您的自定义保存在：

- **配置：** `~/.clawdbot/clawdbot.json`（JSON/JSON5 类似）
- **工作区：** `~/clawd`（技能、提示、记忆；将其设为私有 git 仓库）

引导一次：

```bash
moltbot-cn setup
```

在此仓库内部，使用本地 CLI 入口：

```bash
moltbot-cn setup
```

如果您还没有全局安装，请通过 `pnpm moltbot-cn setup` 运行它。
## 稳定工作流程（先用 macOS 应用）

1) 安装 + 启动 **Clawdbot.app**（菜单栏）。
2) 完成入门/权限清单（TCC 提示）。
3) 确保网关是**本地**且正在运行（应用管理它）。
4) 链接界面（示例：WhatsApp）：

```bash
moltbot-cn channels login
```

5) 健康检查：

```bash
moltbot-cn health
```

如果您的构建中不可用入门：
- 运行 `moltbot-cn setup`，然后 `moltbot-cn channels login`，然后手动启动网关（`moltbot-cn gateway`）。

## 前沿工作流程（网关在终端中）

目标：在 TypeScript 网关上工作，获得热重载，保持 macOS 应用 UI 附加。

### 0) （可选）也从源码运行 macOS 应用

如果您也希望 macOS 应用处于前沿：

```bash
./scripts/restart-mac.sh
```

### 1) 启动开发网关

```bash
pnpm install
pnpm gateway:watch
```

`gateway:watch` 在监视模式下运行网关并在 TypeScript 更改时重新加载。

### 2) 让 macOS 应用指向您正在运行的网关

在 **Clawdbot.app** 中：

- 连接模式：**本地**
应用将附加到配置端口上正在运行的网关。

### 3) 验证

- 应用内网关状态应显示 **"使用现有网关 …"**
- 或通过 CLI：

```bash
moltbot-cn health
```

### 常见错误
- **错误端口：** 网关 WS 默认为 `ws://127.0.0.1:18789`；保持应用 + CLI 在同一端口。
- **状态存储位置：**
  - 凭据：`~/.clawdbot/credentials/`
  - 会话：`~/.clawdbot/agents/<agentId>/sessions/`
  - 日志：`/tmp/clawdbot/`
## 更新（不破坏您的设置）

- 将 `~/clawd` 和 `~/.clawdbot/` 保留为 "您的内容"；不要将个人提示/配置放入 `clawdbot` 仓库。
- 更新源码：`git pull` + `pnpm install`（当锁文件更改时）+ 继续使用 `pnpm gateway:watch`。

## Linux（systemd 用户服务）

Linux 安装使用 systemd **用户** 服务。默认情况下，systemd 在注销/空闲时停止用户
服务，这会终止网关。入门尝试为您启用持久化（可能提示 sudo）。如果仍然关闭，请运行：

```bash
sudo loginctl enable-linger $USER
```

对于始终在线或多用户服务器，请考虑使用 **系统** 服务而不是
用户服务（不需要持久化）。参见 [网关运行手册](/gateway) 获取 systemd 注释。

## 相关文档

- [网关运行手册](/gateway)（标志、监督、端口）
- [网关配置](/gateway/configuration)（配置模式 + 示例）
- [Discord](/channels/discord) 和 [Telegram](/channels/telegram)（回复标签 + replyToMode 设置）
- [Clawdbot 助手设置](/start/clawd)
- [macOS 应用](/platforms/macos)（网关生命周期）
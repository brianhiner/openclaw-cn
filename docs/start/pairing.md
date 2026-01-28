---
summary: "配对概述：批准谁可以私信你 + 哪些节点可以加入"
read_when:
  - 设置私信访问控制
  - 配对新的 iOS/Android 节点
  - 审查 Clawdbot 安全策略
---

# 配对

"配对" 是 Clawdbot 的显式**所有者批准**步骤。
它在两个地方使用：

1) **私信配对**（谁被允许与机器人交谈）
2) **节点配对**（哪些设备/节点被允许加入网关网络）

安全上下文：[安全](/gateway/security)
## 1) 私信配对（入站聊天访问）

当通道配置了私信策略 `pairing` 时，未知发送者会收到一个短代码，他们的消息在您批准之前**不会被处理**。

默认私信策略记录在：[安全](/gateway/security)

配对代码：
- 8 个字符，大写，无歧义字符（`0O1I`）。
- **1小时后过期**。机器人仅在创建新请求时发送配对消息（大约每小时每个发送者一次）。
- 默认情况下，待处理的私信配对请求限制为**每个通道 3 个**；附加请求将被忽略，直到其中一个过期或被批准。

### 批准发送者

```bash
moltbot-cn pairing list telegram
moltbot-cn pairing approve telegram <CODE>
```

支持的通道：`telegram`、`whatsapp`、`signal`、`imessage`、`discord`、`slack`。
### 状态存储位置

存储在 `~/.clawdbot/credentials/` 下：
- 待处理请求：`<channel>-pairing.json`
- 已批准白名单存储：`<channel>-allowFrom.json`

将这些视为敏感文件（它们控制对您的助手的访问）。


## 2) 节点设备配对（iOS/Android/macOS/无头节点）

节点以 `role: node` 作为**设备**连接到网关。网关
创建一个必须批准的设备配对请求。

### 批准节点设备

```bash
moltbot-cn devices list
moltbot-cn devices approve <requestId>
moltbot-cn devices reject <requestId>
```

### 状态存储位置

存储在 `~/.clawdbot/devices/` 下：
- `pending.json`（短期存在；待处理请求会过期）
- `paired.json`（已配对设备 + 令牌）

### 注意

- 旧版 `node.pair.*` API（CLI：`moltbot-cn nodes pending/approve`）是一个
  单独的网关拥有的配对存储。WS 节点仍需要设备配对。

## 相关文档

- 安全模型 + 提示注入：[安全](/gateway/security)
- 安全更新（运行医生）：[更新](/install/updating)
- 通道配置：
  - Telegram：[Telegram](/channels/telegram)
  - WhatsApp：[WhatsApp](/channels/whatsapp)
  - Signal：[Signal](/channels/signal)
  - iMessage：[iMessage](/channels/imessage)
  - Discord：[Discord](/channels/discord)
  - Slack：[Slack](/channels/slack)

---
summary: "浏览器手动登录 + X/Twitter 发帖"
read_when:
  - 您需要在浏览器自动化中登录网站
  - 您想通过 AI 助手发布 X/Twitter 更新
---

# 浏览器登录 + X/Twitter 发帖

## 手动登录（推荐）

当网站需要登录时，请在 **clawd 浏览器**（AI 控制的独立浏览器）中**手动登录**。

**重要：** 不要把密码给 AI。自动登录通常会触发反机器人检测，可能导致账号被锁定。

返回主文档：[浏览器自动化](/tools/browser)

---

## 哪个浏览器配置文件？

Moltbot 控制的是一个**专用的 Chrome 配置文件**（名为 `clawd`，橙色 UI）。这与您的日常浏览器完全分开。

**两种方式访问该浏览器：**

1. **让 AI 打开浏览器**，然后您自己登录
2. **通过命令行打开**：

```bash
moltbot-cn browser start
moltbot-cn browser open https://x.com
```

如果有多个配置文件，使用 `--browser-profile <名称>`（默认是 `clawd`）。

---

## X/Twitter 推荐流程

| 功能 | 推荐方式 |
|------|----------|
| **浏览/搜索/读取** | 使用 **bird** CLI 工具（无需浏览器，更稳定） |
| **发布更新** | 使用 **host 浏览器**（手动登录后） |

> bird 仓库：https://github.com/steipete/bird

---

## 沙箱模式 + 主机浏览器访问

沙箱模式的浏览器会话**更容易触发反机器人检测**。对于 X/Twitter 等严格网站，建议使用**主机浏览器**。

如果 AI 助手在沙箱中运行，浏览器工具默认使用沙箱。要允许主机控制：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        browser: {
          allowHostControl: true
        }
      }
    }
  }
}
```

然后指定主机浏览器：

```bash
moltbot-cn browser open https://x.com --browser-profile clawd --target host
```

或者禁用发帖代理的沙箱模式。

---

## 相关文档

- [浏览器自动化](/tools/browser) - 主文档
- [Chrome 扩展](/tools/chrome-extension) - 控制现有标签页

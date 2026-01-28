---
summary: "Chrome 扩展：让 AI 控制您现有的 Chrome 标签页"
read_when:
  - 您想让 AI 控制现有的 Chrome 标签页
  - 您想了解浏览器接管的安全影响
---

# Chrome 扩展（浏览器中继）

Moltbot Chrome 扩展让 AI 助手可以控制您**现有的 Chrome 标签页**（而不是启动一个独立的浏览器）。

通过工具栏按钮一键附加/分离。

---

## 工作原理

该扩展由三部分组成：

| 组件 | 说明 |
|------|------|
| **浏览器控制服务器** | AI/工具调用的 HTTP API |
| **本地中继服务器** | 连接控制服务器和扩展（默认 `http://127.0.0.1:18792`） |
| **Chrome MV3 扩展** | 通过 `chrome.debugger` 附加到标签页 |

Moltbot 通过标准的 `browser` 工具控制附加的标签页。

---

## 安装步骤

### 第一步：安装扩展文件

```bash
moltbot-cn browser extension install
```

### 第二步：查看扩展目录

```bash
moltbot-cn browser extension path
```

### 第三步：加载到 Chrome

1. 打开 Chrome，访问 `chrome://extensions`
2. 开启右上角的“**开发者模式**”
3. 点击“**加载已解压的扩展程序**”
4. 选择上一步输出的目录

### 第四步：固定扩展图标

点击 Chrome 工具栏的拼图图标，将 Moltbot 扩展固定到工具栏。

---

## 使用方法

### 附加到标签页

1. 打开您想让 AI 控制的标签页
2. 点击扩展图标
3. 图标显示 `ON` 表示已附加
4. 再次点击分离

### 通过命令行使用

```bash
# 查看已附加的标签页
moltbot-cn browser --browser-profile chrome tabs

# 获取页面快照
moltbot-cn browser --browser-profile chrome snapshot
```

### AI 助手使用

AI 调用 `browser` 工具时指定 `profile="chrome"`。

---

## 扩展图标状态

| 图标 | 含义 |
|------|------|
| `ON` | 已附加，AI 可以控制该标签页 |
| `…` | 正在连接本地中继服务器 |
| `!` | 中继服务器不可达 |

**如果看到 `!`：**
- 确保网关正在运行（默认设置）
- 或在本机运行 `moltbot-cn browser serve`

---

## 哪个标签页被控制？

- 扩展**不会**自动控制“您正在查看的标签页”
- 它只控制您**明确附加**的标签页（通过点击工具栏按钮）
- 要切换：打开另一个标签页，点击扩展图标

---

## 需要运行 `browser serve` 吗？

| 场景 | 是否需要 |
|------|----------|
| 网关和 Chrome 在同一台机器 | **不需要**（网关自动启动中继服务器） |
| 网关在另一台机器 | **需要**（在 Chrome 机器上运行） |

---

## 更新扩展

升级 Moltbot 后：

1. 重新安装扩展文件：
```bash
moltbot-cn browser extension install
```

2. 在 Chrome 中重新加载：
   - 打开 `chrome://extensions`
   - 点击扩展上的“重新加载”按钮

---

## 安全注意事项

> **重要：** 这个扩展很强大，也有风险。等于给 AI“动手操作您的浏览器”的能力。

扩展使用 Chrome 的调试器 API。附加后，AI 可以：
- 在该标签页中点击/输入/导航
- 读取页面内容
- 访问该标签页的登录会话

**这不像独立的 clawd 浏览器那样隔离。**

**建议：**
- 使用专门的 Chrome 配置文件（与个人浏览分开）
- 不要附加到有敏感信息的标签页
- 保持控制服务器仅本地访问

---

## 相关文档

- [浏览器自动化](/tools/browser) - 主文档
- [浏览器登录](/tools/browser-login) - 网站登录指南
- [安全文档](/gateway/security) - 安全审计

---
summary: "浏览器控制服务器 + 自动化命令"
read_when:
  - 您想让 AI 助手自动操控浏览器
  - 您需要调试浏览器自动化问题
  - 您想了解浏览器配置和生命周期
---

# 浏览器自动化

Moltbot 可以运行一个**独立的 Chrome/Brave/Edge 浏览器配置文件**，由 AI 助手控制。这个浏览器与您的日常浏览器完全隔离。

**简单理解：**
- 这是一个**专门给 AI 用的浏览器**，不会影响您的个人浏览器
- AI 可以**打开网页、点击、输入、截图**
- 默认配置文件名为 `clawd`（橙色标识）

## 功能特点

- 独立的浏览器配置文件（不影响您的日常浏览）
- 标签页管理（打开/关闭/切换）
- 自动化操作（点击/输入/拖拽/选择）
- 页面快照、截图、PDF 导出
- 支持多配置文件（`clawd`、`work`、`remote` 等）

---

## 快速开始

```bash
# 查看浏览器状态
moltbot-cn browser status

# 启动浏览器
moltbot-cn browser start

# 打开网页
moltbot-cn browser open https://example.com

# 获取页面快照
moltbot-cn browser snapshot
```

如果提示 "Browser disabled"，请在配置中启用浏览器并重启网关。

---

## 配置文件类型

| 配置文件 | 说明 |
|------|------|
| `clawd` | 独立管理的浏览器（无需扩展） |
| `chrome` | 通过扩展连接您的**系统浏览器**（需安装扩展） |

如果您希望默认使用独立浏览器，设置 `browser.defaultProfile: "clawd"`。

## 配置说明

配置文件位于 `~/.moltbot/moltbot.json`。

**基础配置示例：**

```json5
{
  browser: {
    enabled: true,           // 启用浏览器控制
    defaultProfile: "clawd", // 默认使用独立浏览器
    headless: false,         // 显示浏览器窗口（调试时建议开启）
    color: "#FF4500"         // 浏览器 UI 颜色标识
  }
}
```

**完整配置示例（高级用户）：**

```json5
{
  browser: {
    enabled: true,
    controlUrl: "http://127.0.0.1:18791",
    cdpUrl: "http://127.0.0.1:18792",
    defaultProfile: "clawd",
    color: "#FF4500",
    headless: false,
    noSandbox: false,       // Linux 可能需要设为 true
    attachOnly: false,      // 仅附加到已运行的浏览器
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    profiles: {
      clawd: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" }
    }
  }
}
```

### 配置字段说明

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `enabled` | 启用浏览器控制 | `true` |
| `defaultProfile` | 默认配置文件 | `chrome` |
| `headless` | 无头模式（不显示窗口） | `false` |
| `noSandbox` | 禁用沙箱（Linux 可能需要） | `false` |
| `executablePath` | 浏览器可执行文件路径 | 自动检测 |
| `color` | UI 颜色标识 | `#FF4500` |

---

## 指定浏览器

如果您的系统默认浏览器是 Chrome/Brave/Edge，Moltbot 会自动检测。您也可以手动指定：

**通过命令行设置：**

```bash
moltbot-cn config set browser.executablePath "/usr/bin/google-chrome"
```

**各平台配置示例：**

```json5
// macOS - Chrome
{ browser: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" } }

// macOS - Brave
{ browser: { executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" } }

// Windows
{ browser: { executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" } }

// Linux
{ browser: { executablePath: "/usr/bin/google-chrome" } }
```

**自动检测顺序：** Chrome → Brave → Edge → Chromium → Chrome Canary

---

## 多配置文件支持

Moltbot 支持多个命名的浏览器配置文件：

| 类型 | 说明 |
|------|------|
| **独立管理** | 专用浏览器实例，有独立的用户数据目录 |
| **远程 CDP** | 连接到其他机器上的浏览器 |
| **扩展中继** | 通过 Chrome 扩展控制现有标签页 |

**默认配置文件：**
- `clawd` - 独立管理的浏览器（自动创建）
- `chrome` - Chrome 扩展中继（内置）

**使用指定配置文件：**

```bash
moltbot-cn browser --browser-profile work start
moltbot-cn browser --browser-profile work open https://example.com
```

---

## Chrome 扩展中继（控制现有标签页）

Moltbot 还可以通过 Chrome 扩展控制您**现有的 Chrome 标签页**（而不是启动独立浏览器）。

详细指南：[Chrome 扩展](/tools/chrome-extension)

**快速设置：**

1. 安装扩展：
```bash
moltbot-cn browser extension install
```

2. 加载到 Chrome：
   - 打开 `chrome://extensions`
   - 启用“开发者模式”
   - 点击“加载已解压的扩展程序”
   - 选择 `moltbot-cn browser extension path` 输出的目录

3. 使用：
   - 固定扩展图标，点击即可附加到当前标签页（图标显示 `ON`）
   - 再次点击分离

---

## 隔离保证

- **独立用户数据目录**：不会触碰您的个人浏览器配置文件
- **独立端口**：避免与开发工作流冲突（不使用 9222 端口）
- **确定性标签页控制**：通过 targetId 精确定位标签页

---

## 浏览器选择

本地启动时，Moltbot 按以下顺序选择：
1. Chrome
2. Brave
3. Edge
4. Chromium
5. Chrome Canary

各平台搜索位置：
- **macOS**：`/Applications` 和 `~/Applications`
- **Linux**：`google-chrome`、`brave`、`microsoft-edge`、`chromium` 等
- **Windows**：常见安装位置

---

## CLI 命令参考

所有命令都支持 `--browser-profile <名称>` 指定配置文件，`--json` 输出 JSON 格式。

### 基础操作

```bash
# 浏览器状态
moltbot-cn browser status
moltbot-cn browser start
moltbot-cn browser stop

# 标签页管理
moltbot-cn browser tabs              # 列出所有标签页
moltbot-cn browser tab new           # 新建标签页
moltbot-cn browser tab select 2      # 选择第 2 个标签页
moltbot-cn browser tab close 2       # 关闭第 2 个标签页
moltbot-cn browser open https://example.com  # 打开网址
```

### 页面检查

```bash
# 截图
moltbot-cn browser screenshot              # 当前视窗
moltbot-cn browser screenshot --full-page  # 整页截图
moltbot-cn browser screenshot --ref 12     # 元素截图

# 页面快照
moltbot-cn browser snapshot                # AI 快照
moltbot-cn browser snapshot --interactive  # 交互元素列表
moltbot-cn browser snapshot --efficient    # 精简模式

# 调试信息
moltbot-cn browser console --level error   # 控制台错误
moltbot-cn browser errors --clear          # 页面错误
moltbot-cn browser requests --filter api   # 网络请求
moltbot-cn browser pdf                     # 导出 PDF
```

### 页面操作

```bash
# 导航
moltbot-cn browser navigate https://example.com
moltbot-cn browser resize 1280 720

# 交互（需先获取 snapshot 中的 ref）
moltbot-cn browser click 12              # 点击元素
moltbot-cn browser click 12 --double     # 双击
moltbot-cn browser type 23 "你好"        # 输入文本
moltbot-cn browser type 23 "你好" --submit  # 输入并提交
moltbot-cn browser press Enter           # 按键
moltbot-cn browser hover 44              # 悬停
moltbot-cn browser select 9 "选项A"      # 选择下拉框

# 等待
moltbot-cn browser wait --text "完成"    # 等待文本出现
moltbot-cn browser wait "#main"          # 等待元素可见
moltbot-cn browser wait --load networkidle  # 等待网络空闲

# 文件
moltbot-cn browser upload /tmp/file.pdf  # 上传文件
moltbot-cn browser download e12 /tmp/report.pdf  # 下载
```

### 状态管理

```bash
# Cookies
moltbot-cn browser cookies               # 查看 cookies
moltbot-cn browser cookies clear         # 清除 cookies

# 本地存储
moltbot-cn browser storage local get
moltbot-cn browser storage local set theme dark
moltbot-cn browser storage local clear

# 环境设置
moltbot-cn browser set offline on        # 离线模式
moltbot-cn browser set media dark        # 深色模式
moltbot-cn browser set timezone Asia/Shanghai  # 时区
moltbot-cn browser set locale zh-CN      # 语言
moltbot-cn browser set device "iPhone 14"  # 设备模拟
```

---

## 快照和引用 (ref)

Moltbot 支持两种快照模式：

| 模式 | 命令 | 引用格式 | 适用场景 |
|------|------|----------|----------|
| AI 快照 | `snapshot` | `12`（数字） | 默认，AI 助手使用 |
| 角色快照 | `snapshot --interactive` | `e12` | 交互元素列表 |

**使用流程：**
1. 获取快照：`moltbot-cn browser snapshot`
2. 找到目标元素的 ref
3. 执行操作：`moltbot-cn browser click 12`

**注意：** ref 在页面导航后会失效，需要重新获取快照。

---

## 调试技巧

当操作失败时（如“元素不可见”、“被遮挡”）：

1. 获取交互元素列表：`moltbot-cn browser snapshot --interactive`
2. 高亮显示目标元素：`moltbot-cn browser highlight e12`
3. 查看页面错误：`moltbot-cn browser errors --clear`
4. 查看网络请求：`moltbot-cn browser requests --filter api`
5. 录制跟踪：
   ```bash
   moltbot-cn browser trace start
   # 重现问题
   moltbot-cn browser trace stop  # 输出跟踪文件路径
   ```

---

## 安全与隐私

- 浏览器配置文件可能包含登录会话，请妥善保管
- 登录和反机器人检测说明请参考 [浏览器登录](/tools/browser-login)
- 控制 URL 应保持本地访问，除非您有意暴露

---

## 故障排除

Linux 特有问题（尤其是 snap 版 Chromium），请参考
[浏览器故障排除（Linux）](/tools/browser-linux-troubleshooting)。

---

## 相关文档

- [Chrome 扩展](/tools/chrome-extension) - 控制现有 Chrome 标签页
- [浏览器登录](/tools/browser-login) - 网站登录和 X/Twitter 发帖
- [浏览器故障排除（Linux）](/tools/browser-linux-troubleshooting) - Linux 问题解决

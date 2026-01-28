---
summary: "修复 Linux 上的 Chrome/Brave/Edge CDP 启动问题"
read_when: "Linux 上浏览器控制失败，尤其是 snap 版 Chromium"
---

# 浏览器故障排除（Linux）

---

## 问题："Failed to start Chrome CDP on port 18800"

浏览器控制服务器无法启动 Chrome/Brave/Edge，报错：
```
{"error":"Error: Failed to start Chrome CDP on port 18800 for profile \"clawd\"."}
```

### 原因

在 Ubuntu 和许多 Linux 发行版上，默认的 Chromium 是 **snap 包**。Snap 的 AppArmor 限制会干扰 Moltbot 启动和监控浏览器进程。

运行 `apt install chromium` 实际上安装的是重定向到 snap 的存根包：
```
Note, selecting 'chromium-browser' instead of 'chromium'
chromium-browser is already the newest version (2:1snap1-0ubuntu2).
```

这**不是**真正的浏览器，只是一个包装器。

---

## 解决方案 1：安装 Google Chrome（推荐）

安装官方 Google Chrome `.deb` 包，不受 snap 限制：

```bash
# 下载并安装
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb

# 如果有依赖错误
sudo apt --fix-broken install -y
```

然后更新配置 (`~/.moltbot/moltbot.json`)：

```json
{
  "browser": {
    "enabled": true,
    "executablePath": "/usr/bin/google-chrome-stable",
    "headless": true,
    "noSandbox": true
  }
}
```

---

## 解决方案 2：使用 Snap Chromium + 仅附加模式

如果必须使用 snap 版 Chromium，配置 Moltbot 附加到手动启动的浏览器：

### 第一步：更新配置

```json
{
  "browser": {
    "enabled": true,
    "attachOnly": true,
    "headless": true,
    "noSandbox": true
  }
}
```

### 第二步：手动启动 Chromium

```bash
chromium-browser --headless --no-sandbox --disable-gpu \
  --remote-debugging-port=18800 \
  --user-data-dir=$HOME/.moltbot/browser/clawd/user-data \
  about:blank &
```

### 第三步（可选）：创建 systemd 服务自动启动

创建文件 `~/.config/systemd/user/moltbot-browser.service`：

```ini
[Unit]
Description=Moltbot Browser (Chrome CDP)
After=network.target

[Service]
ExecStart=/snap/bin/chromium --headless --no-sandbox --disable-gpu --remote-debugging-port=18800 --user-data-dir=%h/.moltbot/browser/clawd/user-data about:blank
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

启用服务：

```bash
systemctl --user enable --now moltbot-browser.service
```

---

## 验证浏览器工作正常

```bash
# 检查状态
curl -s http://127.0.0.1:18791/ | jq '{running, pid, chosenBrowser}'

# 测试浏览
curl -s -X POST http://127.0.0.1:18791/start
curl -s http://127.0.0.1:18791/tabs
```

---

## 配置参考

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `browser.enabled` | 启用浏览器控制 | `true` |
| `browser.executablePath` | 浏览器可执行文件路径 | 自动检测 |
| `browser.headless` | 无头模式（不显示 GUI） | `false` |
| `browser.noSandbox` | 添加 `--no-sandbox` 标志 | `false` |
| `browser.attachOnly` | 仅附加到已运行的浏览器 | `false` |
| `browser.cdpPort` | Chrome DevTools Protocol 端口 | `18800` |

---

## 问题："Chrome extension relay is running, but no tab is connected"

您正在使用 `chrome` 配置文件（扩展中继），它需要将 Chrome 扩展附加到一个标签页。

**解决方法：**

1. **使用独立管理的浏览器：**
   ```bash
   moltbot-cn browser start --browser-profile clawd
   ```
   或设置 `browser.defaultProfile: "clawd"`

2. **使用扩展中继：**
   - 安装扩展
   - 打开一个标签页
   - 点击扩展图标附加

---

## 相关文档

- [浏览器自动化](/tools/browser) - 主文档
- [Chrome 扩展](/tools/chrome-extension) - 控制现有标签页

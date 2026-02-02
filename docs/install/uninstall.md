---
summary: "完全卸载 Clawdbot（CLI、服务、状态、工作区）"
read_when:
  - 想从机器上删除 Clawdbot
  - 卸载后 gateway 服务仍在运行
---

# 卸载

两种方式：
- **简单方式**：如果 `openclaw-cn` 仍然安装。
- **手动服务删除**：如果 CLI 已删除但服务仍在运行。

## 简单方式（CLI 仍然安装）

推荐：使用内置卸载器：

```bash
openclaw-cn uninstall
```

非交互式（自动化 / npx）：

```bash
openclaw-cn uninstall --all --yes --non-interactive
npx -y openclaw-cn uninstall --all --yes --non-interactive
```

手动步骤（相同效果）：

1) 停止 gateway 服务：

```bash
openclaw-cn gateway stop
```

2) 卸载 gateway 服务（launchd/systemd/schtasks）：

```bash
openclaw-cn gateway uninstall
```

3) 删除状态 + 配置：

**Linux / macOS：**
```bash
rm -rf "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
```

**Windows（PowerShell）：**
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.openclaw"
```

如果你将 `OPENCLAW_CONFIG_PATH` 设置为状态目录之外的自定义位置，也删除该文件。

4) 删除工作区（可选，删除 agent 文件）：

**Linux / macOS：**
```bash
rm -rf ~/clawd
```

**Windows（PowerShell）：**
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\clawd"
```

5) 删除 CLI 安装（选择你使用的那个）：

```bash
npm rm -g openclaw-cn
pnpm remove -g openclaw-cn
bun remove -g openclaw-cn
```

6) 如果你安装了 macOS 应用：

```bash
rm -rf /Applications/Clawdbot.app
```

注意：
- 如果你使用了配置文件（`--profile` / `OPENCLAW_PROFILE`），对每个状态目录重复步骤 3（默认是 `~/.openclaw-<profile>`）。
- 在远程模式下，状态目录在 **gateway 主机**上，所以在那里也运行步骤 1-4。

## 手动服务删除（CLI 未安装）

如果 gateway 服务持续运行但 `openclaw-cn` 丢失，使用此方法。

### macOS（launchd）

默认标签是 `com.openclaw.gateway`（或 `com.openclaw.<profile>`）：

```bash
launchctl bootout gui/$UID/com.openclaw.gateway
rm -f ~/Library/LaunchAgents/com.openclaw.gateway.plist
```

如果你使用了配置文件，将标签和 plist 名称替换为 `com.openclaw.<profile>`。

### Linux（systemd 用户单元）

默认单元名称是 `clawdbot-gateway.service`（或 `clawdbot-gateway-<profile>.service`）：

```bash
systemctl --user disable --now clawdbot-gateway.service
rm -f ~/.config/systemd/user/clawdbot-gateway.service
systemctl --user daemon-reload
```

### Windows（计划任务）

默认任务名称是 `Clawdbot Gateway`（或 `Clawdbot Gateway (<profile>)`）。
任务脚本在你的状态目录下。

```powershell
schtasks /Delete /F /TN "Clawdbot Gateway"
Remove-Item -Force "$env:USERPROFILE\.openclaw\gateway.cmd"
```

如果你使用了配置文件，删除匹配的任务名称和 `~\.openclaw-<profile>\gateway.cmd`。

## 普通安装 vs 源码检出

### 普通安装（install.sh / npm / pnpm / bun）

如果你使用了 `https://clawd.org.cn/install.sh` 或 `install.ps1`，CLI 是用 `npm install -g openclaw-cn@latest` 安装的。
用 `npm rm -g openclaw-cn`（或 `pnpm remove -g openclaw-cn` / `bun remove -g openclaw-cn`，如果你用那种方式安装的话）删除它。

### 源码检出（git clone）

如果你从仓库检出运行（`git clone` + `openclaw-cn ...` / `bun run openclaw-cn ...`）：

1) 在删除仓库**之前**卸载 gateway 服务（使用上面的简单方式或手动服务删除）。
2) 删除仓库目录。
3) 如上所示删除状态 + 工作区。

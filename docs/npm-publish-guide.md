# npm 发布指南

本文档说明如何将 `moltbot-cn` 发布到 npm。

## 前置准备

### 1. 注册 npm 账号
如果你还没有 npm 账号，前往 https://www.npmjs.com/signup 注册。

### 2. 创建 npm Access Token
1. 登录 npm: https://www.npmjs.com/
2. 点击头像 → **Access Tokens**
3. 点击 **Generate New Token** → 选择 **Automation**
4. 复制生成的 token（格式类似 `npm_xxxxxxxxxxxxxx`）

### 3. 配置 GitHub Secrets
1. 进入你的 GitHub 仓库
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 名称：`NPM_TOKEN`
5. 值：粘贴你刚才复制的 npm token
6. 点击 **Add secret**

## 本地测试发布（可选）

在正式发布前，你可以本地测试打包：

```bash
# 构建项目
pnpm build
pnpm ui:build

# 打包（不发布）
pnpm pack
```

这会生成一个 `.tgz` 文件，你可以测试安装：

```bash
npm install -g ./moltbot-cn-2026.1.25.tgz
```

## 手动发布到 npm

如果你想手动发布（而不是通过 GitHub Actions）：

```bash
# 1. 登录 npm（只需首次执行）
npm login

# 2. 构建项目
pnpm build
pnpm ui:build

# 3. 发布
pnpm publish --access public
```

## 通过 GitHub Actions 自动发布

### 发布流程

1. **更新版本号**（可选）
   ```bash
   # 修改 package.json 中的 version
   # 例如从 2026.1.25 改为 2026.1.26
   ```

2. **提交更改**
   ```bash
   git add package.json
   git commit -m "chore: bump version to 2026.1.26"
   git push
   ```

3. **创建并推送 tag**
   ```bash
   # 创建 tag（版本号前加 v）
   git tag v2026.1.26
   
   # 推送 tag 到 GitHub
   git push origin v2026.1.26
   ```

4. **自动发布**
   - GitHub Actions 会自动检测到新 tag
   - 自动构建并发布到 npm
   - 查看进度：仓库页面 → **Actions** tab

### 查看发布状态

1. 进入 GitHub 仓库的 **Actions** tab
2. 查看 **Publish to npm** workflow 的运行状态
3. 如果失败，点击查看详细日志

## 验证发布

发布成功后，验证包是否可用：

```bash
# 查看包信息
npm view moltbot-cn

# 安装测试
npm install -g moltbot-cn

# 验证版本
moltbot-cn --version
```

## 版本管理建议

建议使用语义化版本（虽然当前使用日期版本）：

- **主要版本（Major）**: 破坏性更新，例如 `2026.1.x` → `2026.2.x`
- **次要版本（Minor）**: 新功能，向后兼容，例如 `2026.1.25` → `2026.1.26`
- **补丁版本（Patch）**: Bug 修复，例如可以考虑 `2026.1.25.1`

## 常见问题

### 1. 发布失败：包名已存在
确保包名 `moltbot-cn` 在 npm 上可用。如果已被占用，需要更换包名。

### 2. 权限错误
确保 `NPM_TOKEN` 配置正确，且有发布权限。

### 3. 构建失败
本地先运行 `pnpm build && pnpm ui:build` 确保构建成功。

### 4. 如何撤销发布
发布后 72 小时内可以撤销：
```bash
npm unpublish moltbot-cn@2026.1.25
```

⚠️ **注意**：撤销后的版本号不能再次使用。

## 发布检查清单

发布前确认：
- [ ] 代码已测试通过
- [ ] 版本号已更新
- [ ] CHANGELOG.md 已更新
- [ ] NPM_TOKEN 已配置
- [ ] 本地构建成功
- [ ] README 文档正确

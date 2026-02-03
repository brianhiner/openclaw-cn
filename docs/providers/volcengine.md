---
summary: "使用火山引擎 (豆包) 模型"
read_when:
  - 您想使用火山引擎/豆包模型
  - 您想配置字节跳动的 AI 服务
---

# 火山引擎 (Volcengine)

火山引擎是字节跳动旗下的云服务平台，提供豆包等大语言模型的 API 服务。

## 快速开始

### 方式一：引导安装（推荐）

运行 onboard 命令，选择「火山引擎 (ARK) API key」：

```bash
openclaw-cn onboard
```

按提示输入 API Key，系统会自动配置并验证模型访问权限。

### 方式二：手动配置

1. 设置环境变量或在配置中添加 API Key：

```bash
export VOLCENGINE_API_KEY="your-api-key"
```

2. 配置供应商：

```json5
{
  "models": {
    "providers": {
      "volcengine": {
        "baseUrl": "https://ark.cn-beijing.volces.com/api/v3",
        "apiKey": "${VOLCENGINE_API_KEY}",
        "api": "openai-completions",
        "models": [
          { "id": "doubao-1-5-pro-32k-250115", "name": "豆包 1.5 Pro 32K" },
          { "id": "doubao-1-5-lite-32k-250115", "name": "豆包 1.5 Lite 32K" }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "volcengine/doubao-1-5-pro-32k-250115" }
    }
  }
}
```

## 获取 API Key

1. 登录 [火山引擎控制台](https://console.volcengine.com/)
2. 进入「火山方舟」(ARK) 控制台
3. 创建 API Key 或使用现有的 Key
4. 如果使用付费模型，需要先在控制台创建推理接入点 (Endpoint)

## 模型 ID

火山引擎的模型 ID 格式取决于您的配置方式：

- **按量付费模型**：使用模型名称，如 `doubao-1-5-pro-32k-250115`
- **自定义 Endpoint**：使用您在控制台创建的 Endpoint ID

常用模型：

| 模型 ID | 说明 |
|---------|------|
| `doubao-1-5-pro-32k-250115` | 豆包 1.5 Pro，32K 上下文 |
| `doubao-1-5-lite-32k-250115` | 豆包 1.5 Lite，32K 上下文 |
| `doubao-pro-32k` | 豆包 Pro，32K 上下文 |
| `doubao-lite-32k` | 豆包 Lite，32K 上下文 |

## 企业用户：自定义 Header

如果需要为请求添加自定义 Header（如标识调用来源用于审计），可通过环境变量配置：

```bash
export MODEL_AGENT_CLIENT_REQ_ID="X-Custom-Source"
export MODEL_AGENT_CLIENT_REQ_VALUE="your-app-name"
```

配置后，所有发往火山引擎的请求都会带上该 Header。

## 切换模型

```bash
# 设置默认模型
openclaw-cn models set volcengine/doubao-1-5-pro-32k-250115

# 在聊天中切换
/model volcengine/doubao-1-5-pro-32k-250115
```

## 故障排除

### "Endpoint not found" 错误

检查模型 ID 是否正确。如果使用自定义 Endpoint，确保 ID 与控制台一致。

### "Permission denied" 错误

确保 API Key 有访问该模型的权限，或在控制台开通按量付费。

## 相关文档

- [自定义供应商配置](/guides/custom-ai-providers)
- [模型选择](/concepts/models)

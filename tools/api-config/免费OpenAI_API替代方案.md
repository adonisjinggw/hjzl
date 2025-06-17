# 🆓 免费OpenAI API替代方案指南

## 🎯 OpenMemory配置的API密钥选项

由于OpenMemory需要API密钥来处理AI功能，以下是一些免费或低成本的替代方案：

## 🌟 推荐的免费API服务

### 1. 硅基流动 (SiliconCloud)
- **免费额度**: 新用户赠送5元，约可调用1000次
- **API地址**: `https://api.siliconflow.cn/v1`
- **支持模型**: Qwen, ChatGLM, Llama等
- **注册地址**: https://cloud.siliconflow.cn/
- **配置示例**:
```bash
OPENAI_API_KEY="sk-your-silicon-api-key"
OPENAI_API_BASE="https://api.siliconflow.cn/v1"
```

### 2. DeepSeek API
- **免费额度**: 每月500万token
- **API地址**: `https://api.deepseek.com/v1`
- **支持模型**: deepseek-chat, deepseek-coder
- **注册地址**: https://platform.deepseek.com/
- **配置示例**:
```bash
OPENAI_API_KEY="sk-your-deepseek-key"
OPENAI_API_BASE="https://api.deepseek.com/v1"
```

### 3. 智谱AI (ChatGLM)
- **免费额度**: 新用户赠送18元，约可调用1800次
- **API地址**: `https://open.bigmodel.cn/api/paas/v4`
- **支持模型**: glm-4, glm-3-turbo
- **注册地址**: https://open.bigmodel.cn/
- **配置示例**:
```bash
OPENAI_API_KEY="your-zhipu-api-key"
OPENAI_API_BASE="https://open.bigmodel.cn/api/paas/v4"
```

### 4. Moonshot AI (Kimi)
- **免费额度**: 新用户赠送15元
- **API地址**: `https://api.moonshot.cn/v1`
- **支持模型**: moonshot-v1-8k, moonshot-v1-32k
- **注册地址**: https://platform.moonshot.cn/
- **配置示例**:
```bash
OPENAI_API_KEY="sk-your-moonshot-key"
OPENAI_API_BASE="https://api.moonshot.cn/v1"
```

## 🔧 配置OpenMemory使用免费API

### 方法1: 环境变量配置
```cmd
# 在Windows PowerShell中设置
setx OPENAI_API_KEY "sk-your-free-api-key"
setx OPENAI_API_BASE "https://your-chosen-api-base"
```

### 方法2: 修改MCP配置
编辑 `C:\Users\Administrator\.cursor\mcp.json`:
```json
"openmemory": {
  "command": "python",
  "args": [
    "C:/OpenMemory/openmemory_mcp_server.py"
  ],
  "env": {
    "OPENAI_API_KEY": "sk-your-free-api-key",
    "OPENAI_API_BASE": "https://your-chosen-api-base"
  }
}
```

### 方法3: 修改服务器代码
如果需要直接在代码中配置，可以修改 `openmemory_mcp_server.py`:
```python
import os
os.environ['OPENAI_API_KEY'] = 'sk-your-free-api-key'
os.environ['OPENAI_API_BASE'] = 'https://your-chosen-api-base'
```

## 📝 申请步骤示例（以硅基流动为例）

1. **注册账号**: 访问 https://cloud.siliconflow.cn/
2. **实名认证**: 完成手机号和身份认证
3. **获取API Key**: 
   - 进入控制台
   - 点击"API密钥"
   - 创建新的API密钥
4. **获取免费额度**: 新用户自动获得5元免费额度
5. **配置使用**: 将API密钥配置到OpenMemory中

## ⚠️ 注意事项

### 使用限制
- 免费额度有限，请合理使用
- 部分服务有调用频率限制
- 某些高级功能可能需要付费

### 安全提醒
- 不要将API密钥泄露给他人
- 不要在公开代码中硬编码API密钥
- 定期更换API密钥

### 兼容性
- 大部分免费API都兼容OpenAI格式
- 如果遇到兼容性问题，可能需要调整模型名称
- 建议先测试API是否正常工作

## 🚀 快速开始

推荐使用**硅基流动**或**DeepSeek**，因为它们：
- 免费额度较多
- 兼容性好
- 注册简单
- 服务稳定

选择一个服务，注册获取API密钥后，按照上述方法配置到OpenMemory中即可开始使用AI记忆功能！

## 🔄 备选方案

如果免费额度用完，还可以考虑：
- 轮换使用多个免费服务
- 购买低价套餐（通常几十元可用很久）
- 使用本地部署的开源模型（如Ollama）

祝您使用愉快！🎉 
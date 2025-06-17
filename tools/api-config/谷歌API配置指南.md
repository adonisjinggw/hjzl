# 🔧 谷歌API配置指南 - OpenMemory

## 🌟 谷歌API支持

谷歌提供了多种AI API服务，都可以用于OpenMemory：

### 1. Google Gemini API
- **服务**: Google AI Studio / Vertex AI
- **模型**: gemini-pro, gemini-pro-vision
- **API地址**: `https://generativelanguage.googleapis.com/v1beta`
- **免费额度**: 每分钟15次请求，每天1500次请求

### 2. Google Cloud Vertex AI
- **服务**: Google Cloud Platform
- **模型**: gemini-pro, text-bison, chat-bison
- **API地址**: 根据地区而定
- **免费额度**: 新用户$300免费额度

## 🔧 配置方法

### 方法1: 使用Gemini API (推荐)

#### 获取API密钥
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录您的Google账号
3. 点击"Create API Key"
4. 复制生成的API密钥

#### 配置OpenMemory
由于Gemini API格式与OpenAI不完全兼容，需要使用适配器。

**选项A: 使用LiteLLM代理**
```bash
# 安装LiteLLM
pip install litellm

# 启动代理服务器
litellm --model gemini/gemini-pro --api_key your-gemini-api-key --port 8000
```

然后配置OpenMemory使用本地代理：
```json
"openmemory": {
  "command": "python",
  "args": [
    "C:/OpenMemory/openmemory_mcp_server.py"
  ],
  "env": {
    "OPENAI_API_KEY": "your-gemini-api-key",
    "OPENAI_API_BASE": "http://localhost:8000/v1"
  }
}
```

**选项B: 修改OpenMemory代码支持Gemini**
编辑 `C:\OpenMemory\openmemory_mcp_server.py`，在文件开头添加：

```python
import os
import google.generativeai as genai

# 配置Gemini API
genai.configure(api_key="your-gemini-api-key")

# 创建Gemini模型实例
gemini_model = genai.GenerativeModel('gemini-pro')

# 如果需要，可以创建一个OpenAI兼容的包装器
class GeminiWrapper:
    def __init__(self, model):
        self.model = model
    
    def chat_completions_create(self, messages, **kwargs):
        # 将OpenAI格式转换为Gemini格式
        prompt = messages[-1]['content'] if messages else ""
        response = self.model.generate_content(prompt)
        return {
            'choices': [{'message': {'content': response.text}}]
        }

# 替换OpenAI客户端
openai_client = GeminiWrapper(gemini_model)
```

### 方法2: 使用Google Cloud Vertex AI

#### 设置认证
1. 在Google Cloud Console创建项目
2. 启用Vertex AI API
3. 创建服务账号并下载JSON密钥文件
4. 设置环境变量：
```cmd
setx GOOGLE_APPLICATION_CREDENTIALS "path\to\your\service-account-key.json"
```

#### 配置OpenMemory
```json
"openmemory": {
  "command": "python",
  "args": [
    "C:/OpenMemory/openmemory_mcp_server.py"
  ],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "path/to/your/service-account-key.json",
    "GOOGLE_CLOUD_PROJECT": "your-project-id"
  }
}
```

## 🚀 快速配置脚本

创建一个快速配置脚本 `配置谷歌API.bat`：

```batch
@echo off
echo 配置谷歌API for OpenMemory
echo.

echo 请选择谷歌API类型：
echo 1. Gemini API (推荐，简单)
echo 2. Vertex AI (高级功能)
echo.

set /p choice="请选择 (1-2): "

if "%choice%"=="1" (
    echo.
    echo 请访问 https://makersuite.google.com/app/apikey 获取Gemini API密钥
    set /p api_key="请输入您的Gemini API密钥: "
    
    echo 正在安装LiteLLM代理...
    pip install litellm
    
    echo 正在配置MCP...
    REM 这里添加配置MCP的代码
    
    echo ✅ 配置完成！
    echo 请运行以下命令启动代理：
    echo litellm --model gemini/gemini-pro --api_key %api_key% --port 8000
    
) else if "%choice%"=="2" (
    echo.
    echo Vertex AI配置需要：
    echo 1. Google Cloud项目
    echo 2. 服务账号JSON密钥
    echo 3. 启用Vertex AI API
    echo.
    echo 请参考详细文档进行配置
)

pause
```

## 💡 使用建议

### 推荐配置
对于大多数用户，推荐使用 **Gemini API + LiteLLM代理** 的方案：
- 配置简单
- 免费额度充足
- 性能优秀
- 兼容性好

### 性能对比
- **Gemini Pro**: 性能接近GPT-4，响应速度快
- **免费额度**: 每天1500次请求，对个人使用足够
- **多模态**: 支持文本和图像输入

### 注意事项
1. **API限制**: 注意每分钟和每天的请求限制
2. **网络访问**: 确保能访问Google服务
3. **代理设置**: 如果使用LiteLLM，需要保持代理服务运行
4. **模型选择**: 根据需求选择合适的模型

## 🔄 完整配置流程

1. **获取API密钥**: 从Google AI Studio获取Gemini API密钥
2. **安装代理**: `pip install litellm`
3. **启动代理**: `litellm --model gemini/gemini-pro --api_key YOUR_KEY --port 8000`
4. **配置OpenMemory**: 设置API_BASE为 `http://localhost:8000/v1`
5. **重启Cursor**: 重启应用程序加载新配置
6. **测试功能**: 验证OpenMemory是否正常工作

现在您可以使用谷歌的强大AI能力为OpenMemory提供记忆功能了！🎉

## 🆘 故障排除

如果遇到问题：
1. 检查API密钥是否正确
2. 确认代理服务是否运行
3. 验证网络连接
4. 查看Cursor开发者工具的错误信息

需要帮助可以参考Google AI文档或联系技术支持。 
@echo off
chcp 65001 >nul
echo ================================
echo      OpenMemory MCP 服务器
echo ================================
echo.

REM 请在下面设置您的OpenAI API密钥
REM 格式: set OPENAI_API_KEY=sk-your-api-key-here
set OPENAI_API_KEY=

REM 检查API密钥是否已设置
if "%OPENAI_API_KEY%"=="" (
    echo ❌ 请先在此文件中设置您的OpenAI API密钥！
    echo.
    echo 📝 编辑步骤：
    echo 1. 在记事本中打开此文件
    echo 2. 找到 "set OPENAI_API_KEY=" 这一行
    echo 3. 在等号后面填入您的API密钥
    echo 4. 保存文件后重新运行
    echo.
    echo 💡 API密钥格式示例: sk-xxxxxxxxxxxxxxxxxxxxx
    echo.
    pause
    exit /b 1
)

echo ✅ API密钥已设置
echo 🚀 正在启动OpenMemory MCP服务器...
echo.
echo 📋 服务器信息：
echo - 端口: stdio (标准输入输出)
echo - 功能: AI记忆存储与检索
echo - 数据: 本地存储
echo.
echo 💡 服务器启动后，请在Cursor中测试记忆功能
echo    例如：请帮我记住我喜欢使用TypeScript开发
echo.

python openmemory_mcp_server.py

echo.
echo 服务器已停止
pause 
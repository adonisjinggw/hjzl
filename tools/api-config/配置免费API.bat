@echo off
chcp 65001 > nul
echo.
echo ========================================
echo      OpenMemory 免费API配置工具
echo ========================================
echo.

echo 推荐的免费API服务商：
echo 1. 硅基流动 (SiliconCloud) - 新用户5元免费额度
echo 2. DeepSeek API - 每月500万token免费
echo 3. 智谱AI (ChatGLM) - 新用户18元免费额度
echo 4. Moonshot AI (Kimi) - 新用户15元免费额度
echo 5. 手动配置
echo.

set /p choice="请选择服务商 (1-5): "

if "%choice%"=="1" (
    set api_base=https://api.siliconflow.cn/v1
    echo 您选择了硅基流动。请访问 https://cloud.siliconflow.cn/ 注册并获取API密钥
) else if "%choice%"=="2" (
    set api_base=https://api.deepseek.com/v1
    echo 您选择了DeepSeek。请访问 https://platform.deepseek.com/ 注册并获取API密钥
) else if "%choice%"=="3" (
    set api_base=https://open.bigmodel.cn/api/paas/v4
    echo 您选择了智谱AI。请访问 https://open.bigmodel.cn/ 注册并获取API密钥
) else if "%choice%"=="4" (
    set api_base=https://api.moonshot.cn/v1
    echo 您选择了Moonshot AI。请访问 https://platform.moonshot.cn/ 注册并获取API密钥
) else if "%choice%"=="5" (
    set /p api_base="请输入API基础URL: "
) else (
    echo 无效选择，退出...
    pause
    exit /b
)

echo.
set /p api_key="请输入您的API密钥: "

if "%api_key%"=="" (
    echo 错误：API密钥不能为空
    pause
    exit /b
)

echo.
echo 配置方式：
echo 1. 环境变量（推荐）
echo 2. 修改MCP配置文件
echo.

set /p config_method="请选择配置方式 (1-2): "

if "%config_method%"=="1" (
    echo.
    echo 正在设置环境变量...
    setx OPENAI_API_KEY "%api_key%" > nul
    setx OPENAI_API_BASE "%api_base%" > nul
    echo ✅ 环境变量设置完成！
    echo.
    echo 注意：您需要重启Cursor才能生效。
) else if "%config_method%"=="2" (
    echo.
    echo 正在更新MCP配置文件...
    
    REM 创建临时的配置文件
    echo { > temp_mcp.json
    echo   "mcpServers": { >> temp_mcp.json
    echo     "browser-tools": { >> temp_mcp.json
    echo       "command": "npx", >> temp_mcp.json
    echo       "args": ["@agentdeskai/browser-tools-mcp@latest"], >> temp_mcp.json
    echo       "env": { >> temp_mcp.json
    echo         "BROWSER_TOOLS_HOST": "127.0.0.1", >> temp_mcp.json
    echo         "BROWSER_TOOLS_PORT": "3025" >> temp_mcp.json
    echo       } >> temp_mcp.json
    echo     }, >> temp_mcp.json
    echo     "playwright": { >> temp_mcp.json
    echo       "command": "npx", >> temp_mcp.json
    echo       "args": ["-y", "@executeautomation/playwright-mcp-server"] >> temp_mcp.json
    echo     }, >> temp_mcp.json
    echo     "mcp-feedback-collector": { >> temp_mcp.json
    echo       "command": "node", >> temp_mcp.json
    echo       "args": ["C:/Users/Administrator/Downloads/24小时自动抓热点技巧/node_modules/mcp-feedback-collector/dist/cli.js"], >> temp_mcp.json
    echo       "env": { >> temp_mcp.json
    echo         "MCP_API_KEY": "sk-ANAnmUDpzgDgvVwi2wupoxS0tEXviF4MzbhEsQAh9Wv2CgQW", >> temp_mcp.json
    echo         "MCP_API_BASE_URL": "https://api.ssopen.top", >> temp_mcp.json
    echo         "MCP_DEFAULT_MODEL": "grok-3", >> temp_mcp.json
    echo         "MCP_WEB_PORT": "5050", >> temp_mcp.json
    echo         "MCP_DIALOG_TIMEOUT": "60000", >> temp_mcp.json
    echo         "NODE_ENV": "production" >> temp_mcp.json
    echo       } >> temp_mcp.json
    echo     }, >> temp_mcp.json
    echo     "openmemory": { >> temp_mcp.json
    echo       "command": "python", >> temp_mcp.json
    echo       "args": ["C:/OpenMemory/openmemory_mcp_server.py"], >> temp_mcp.json
    echo       "env": { >> temp_mcp.json
    echo         "OPENAI_API_KEY": "%api_key%", >> temp_mcp.json
    echo         "OPENAI_API_BASE": "%api_base%" >> temp_mcp.json
    echo       } >> temp_mcp.json
    echo     } >> temp_mcp.json
    echo   } >> temp_mcp.json
    echo } >> temp_mcp.json
    
    REM 复制到正确位置
    copy temp_mcp.json "C:\Users\Administrator\.cursor\mcp.json" > nul
    del temp_mcp.json > nul
    
    echo ✅ MCP配置文件更新完成！
) else (
    echo 无效选择，退出...
    pause
    exit /b
)

echo.
echo ========================================
echo           配置完成！
echo ========================================
echo.
echo 下一步：
echo 1. 重启Cursor应用程序
echo 2. 检查MCP工具列表中是否有openmemory
echo 3. 开始使用AI记忆功能
echo.
echo 如果遇到问题，请查看"免费OpenAI_API替代方案.md"文档
echo.
pause 
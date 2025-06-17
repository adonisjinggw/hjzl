@echo off
chcp 65001 > nul
echo.
echo ========================================
echo     快速配置谷歌API for OpenMemory
echo ========================================
echo.

echo 请在下方输入您的谷歌Gemini API密钥：
echo （如果您还没有API密钥，请访问：https://makersuite.google.com/app/apikey）
echo.

set /p api_key="谷歌API密钥: "

if "%api_key%"=="" (
    echo.
    echo ❌ 错误：API密钥不能为空
    pause
    exit /b
)

echo.
echo 正在更新MCP配置文件...

REM 创建包含谷歌API的配置文件
echo { > temp_google_mcp.json
echo   "mcpServers": { >> temp_google_mcp.json
echo     "browser-tools": { >> temp_google_mcp.json
echo       "command": "npx", >> temp_google_mcp.json
echo       "args": ["@agentdeskai/browser-tools-mcp@latest"], >> temp_google_mcp.json
echo       "env": { >> temp_google_mcp.json
echo         "BROWSER_TOOLS_HOST": "127.0.0.1", >> temp_google_mcp.json
echo         "BROWSER_TOOLS_PORT": "3025" >> temp_google_mcp.json
echo       } >> temp_google_mcp.json
echo     }, >> temp_google_mcp.json
echo     "playwright": { >> temp_google_mcp.json
echo       "command": "npx", >> temp_google_mcp.json
echo       "args": ["-y", "@executeautomation/playwright-mcp-server"] >> temp_google_mcp.json
echo     }, >> temp_google_mcp.json
echo     "mcp-feedback-collector": { >> temp_google_mcp.json
echo       "command": "node", >> temp_google_mcp.json
echo       "args": ["C:/Users/Administrator/Downloads/24小时自动抓热点技巧/node_modules/mcp-feedback-collector/dist/cli.js"], >> temp_google_mcp.json
echo       "env": { >> temp_google_mcp.json
echo         "MCP_API_KEY": "sk-ANAnmUDpzgDgvVwi2wupoxS0tEXviF4MzbhEsQAh9Wv2CgQW", >> temp_google_mcp.json
echo         "MCP_API_BASE_URL": "https://api.ssopen.top", >> temp_google_mcp.json
echo         "MCP_DEFAULT_MODEL": "grok-3", >> temp_google_mcp.json
echo         "MCP_WEB_PORT": "5050", >> temp_google_mcp.json
echo         "MCP_DIALOG_TIMEOUT": "60000", >> temp_google_mcp.json
echo         "NODE_ENV": "production" >> temp_google_mcp.json
echo       } >> temp_google_mcp.json
echo     }, >> temp_google_mcp.json
echo     "openmemory": { >> temp_google_mcp.json
echo       "command": "python", >> temp_google_mcp.json
echo       "args": ["C:/OpenMemory/openmemory_mcp_server.py"], >> temp_google_mcp.json
echo       "env": { >> temp_google_mcp.json
echo         "OPENAI_API_KEY": "%api_key%", >> temp_google_mcp.json
echo         "USE_GOOGLE_API": "true", >> temp_google_mcp.json
echo         "GOOGLE_API_KEY": "%api_key%" >> temp_google_mcp.json
echo       } >> temp_google_mcp.json
echo     } >> temp_google_mcp.json
echo   } >> temp_google_mcp.json
echo } >> temp_google_mcp.json

REM 备份原文件
copy "C:\Users\Administrator\.cursor\mcp.json" "C:\Users\Administrator\.cursor\mcp.json.backup" > nul

REM 应用新配置
copy temp_google_mcp.json "C:\Users\Administrator\.cursor\mcp.json" > nul
del temp_google_mcp.json > nul

echo ✅ 配置更新完成！
echo.
echo 📋 配置详情：
echo - API密钥已设置
echo - 支持谷歌API
echo - 原配置已备份为 mcp.json.backup
echo.
echo 🚀 下一步：
echo 1. 重启Cursor应用程序
echo 2. 检查MCP工具列表中的openmemory
echo 3. 测试记忆功能
echo.
echo 如果需要启动LiteLLM代理（推荐）：
echo litellm --model gemini/gemini-pro --api_key %api_key% --port 8000
echo.
pause 
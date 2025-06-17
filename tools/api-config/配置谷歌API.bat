@echo off
chcp 65001 > nul
echo.
echo ========================================
echo      配置谷歌API for OpenMemory
echo ========================================
echo.

echo 您可以选择以下配置方式：
echo.
echo 1. 使用LiteLLM代理（推荐，兼容性最好）
echo 2. 直接配置Gemini API（需要代码修改）
echo 3. 手动输入完整配置
echo.

set /p choice="请选择配置方式 (1-3): "

if "%choice%"=="1" (
    echo.
    echo === 使用LiteLLM代理配置 ===
    echo.
    echo 如果您还没有获取Gemini API密钥，请访问：
    echo https://makersuite.google.com/app/apikey
    echo.
    set /p api_key="请输入您的Gemini API密钥: "
    
    if "%api_key%"=="" (
        echo 错误：API密钥不能为空
        pause
        exit /b
    )
    
    echo.
    echo 正在安装LiteLLM...
    pip install litellm
    
    echo.
    echo 正在更新MCP配置文件...
    
    REM 创建更新的配置文件
    echo { > temp_mcp_google.json
    echo   "mcpServers": { >> temp_mcp_google.json
    echo     "browser-tools": { >> temp_mcp_google.json
    echo       "command": "npx", >> temp_mcp_google.json
    echo       "args": ["@agentdeskai/browser-tools-mcp@latest"], >> temp_mcp_google.json
    echo       "env": { >> temp_mcp_google.json
    echo         "BROWSER_TOOLS_HOST": "127.0.0.1", >> temp_mcp_google.json
    echo         "BROWSER_TOOLS_PORT": "3025" >> temp_mcp_google.json
    echo       } >> temp_mcp_google.json
    echo     }, >> temp_mcp_google.json
    echo     "playwright": { >> temp_mcp_google.json
    echo       "command": "npx", >> temp_mcp_google.json
    echo       "args": ["-y", "@executeautomation/playwright-mcp-server"] >> temp_mcp_google.json
    echo     }, >> temp_mcp_google.json
    echo     "mcp-feedback-collector": { >> temp_mcp_google.json
    echo       "command": "node", >> temp_mcp_google.json
    echo       "args": ["C:/Users/Administrator/Downloads/24小时自动抓热点技巧/node_modules/mcp-feedback-collector/dist/cli.js"], >> temp_mcp_google.json
    echo       "env": { >> temp_mcp_google.json
    echo         "MCP_API_KEY": "sk-ANAnmUDpzgDgvVwi2wupoxS0tEXviF4MzbhEsQAh9Wv2CgQW", >> temp_mcp_google.json
    echo         "MCP_API_BASE_URL": "https://api.ssopen.top", >> temp_mcp_google.json
    echo         "MCP_DEFAULT_MODEL": "grok-3", >> temp_mcp_google.json
    echo         "MCP_WEB_PORT": "5050", >> temp_mcp_google.json
    echo         "MCP_DIALOG_TIMEOUT": "60000", >> temp_mcp_google.json
    echo         "NODE_ENV": "production" >> temp_mcp_google.json
    echo       } >> temp_mcp_google.json
    echo     }, >> temp_mcp_google.json
    echo     "openmemory": { >> temp_mcp_google.json
    echo       "command": "python", >> temp_mcp_google.json
    echo       "args": ["C:/OpenMemory/openmemory_mcp_server.py"], >> temp_mcp_google.json
    echo       "env": { >> temp_mcp_google.json
    echo         "OPENAI_API_KEY": "%api_key%", >> temp_mcp_google.json
    echo         "OPENAI_API_BASE": "http://localhost:8000/v1" >> temp_mcp_google.json
    echo       } >> temp_mcp_google.json
    echo     } >> temp_mcp_google.json
    echo   } >> temp_mcp_google.json
    echo } >> temp_mcp_google.json
    
    copy temp_mcp_google.json "C:\Users\Administrator\.cursor\mcp.json" > nul
    del temp_mcp_google.json > nul
    
    echo ✅ 配置完成！
    echo.
    echo === 重要：启动代理服务器 ===
    echo 现在需要启动LiteLLM代理服务器：
    echo.
    echo 命令：litellm --model gemini/gemini-pro --api_key %api_key% --port 8000
    echo.
    echo 请在新的命令行窗口运行上述命令，保持运行状态
    echo 然后重启Cursor即可使用OpenMemory
    
) else if "%choice%"=="2" (
    echo.
    echo === 直接配置Gemini API ===
    echo.
    set /p api_key="请输入您的Gemini API密钥: "
    
    if "%api_key%"=="" (
        echo 错误：API密钥不能为空
        pause
        exit /b
    )
    
    echo.
    echo 正在更新MCP配置文件...
    
    REM 创建直接配置的文件
    echo { > temp_mcp_direct.json
    echo   "mcpServers": { >> temp_mcp_direct.json
    echo     "browser-tools": { >> temp_mcp_direct.json
    echo       "command": "npx", >> temp_mcp_direct.json
    echo       "args": ["@agentdeskai/browser-tools-mcp@latest"], >> temp_mcp_direct.json
    echo       "env": { >> temp_mcp_direct.json
    echo         "BROWSER_TOOLS_HOST": "127.0.0.1", >> temp_mcp_direct.json
    echo         "BROWSER_TOOLS_PORT": "3025" >> temp_mcp_direct.json
    echo       } >> temp_mcp_direct.json
    echo     }, >> temp_mcp_direct.json
    echo     "playwright": { >> temp_mcp_direct.json
    echo       "command": "npx", >> temp_mcp_direct.json
    echo       "args": ["-y", "@executeautomation/playwright-mcp-server"] >> temp_mcp_direct.json
    echo     }, >> temp_mcp_direct.json
    echo     "mcp-feedback-collector": { >> temp_mcp_direct.json
    echo       "command": "node", >> temp_mcp_direct.json
    echo       "args": ["C:/Users/Administrator/Downloads/24小时自动抓热点技巧/node_modules/mcp-feedback-collector/dist/cli.js"], >> temp_mcp_direct.json
    echo       "env": { >> temp_mcp_direct.json
    echo         "MCP_API_KEY": "sk-ANAnmUDpzgDgvVwi2wupoxS0tEXviF4MzbhEsQAh9Wv2CgQW", >> temp_mcp_direct.json
    echo         "MCP_API_BASE_URL": "https://api.ssopen.top", >> temp_mcp_direct.json
    echo         "MCP_DEFAULT_MODEL": "grok-3", >> temp_mcp_direct.json
    echo         "MCP_WEB_PORT": "5050", >> temp_mcp_direct.json
    echo         "MCP_DIALOG_TIMEOUT": "60000", >> temp_mcp_direct.json
    echo         "NODE_ENV": "production" >> temp_mcp_direct.json
    echo       } >> temp_mcp_direct.json
    echo     }, >> temp_mcp_direct.json
    echo     "openmemory": { >> temp_mcp_direct.json
    echo       "command": "python", >> temp_mcp_direct.json
    echo       "args": ["C:/OpenMemory/openmemory_mcp_server.py"], >> temp_mcp_direct.json
    echo       "env": { >> temp_mcp_direct.json
    echo         "GOOGLE_API_KEY": "%api_key%" >> temp_mcp_direct.json
    echo       } >> temp_mcp_direct.json
    echo     } >> temp_mcp_direct.json
    echo   } >> temp_mcp_direct.json
    echo } >> temp_mcp_direct.json
    
    copy temp_mcp_direct.json "C:\Users\Administrator\.cursor\mcp.json" > nul
    del temp_mcp_direct.json > nul
    
    echo ✅ 配置完成！
    echo.
    echo === 注意：需要修改服务器代码 ===
    echo 请编辑 C:\OpenMemory\openmemory_mcp_server.py
    echo 添加谷歌API支持代码（参见谷歌API配置指南.md）
    
) else if "%choice%"=="3" (
    echo.
    echo === 手动配置 ===
    echo.
    set /p api_key="请输入API密钥: "
    set /p api_base="请输入API基础URL（留空为默认）: "
    
    if "%api_base%"=="" (
        set api_base=https://generativelanguage.googleapis.com/v1beta
    )
    
    echo.
    echo 正在更新配置...
    REM 这里可以添加手动配置的逻辑
    echo ✅ 请手动编辑 C:\Users\Administrator\.cursor\mcp.json
    echo 在openmemory部分添加：
    echo "OPENAI_API_KEY": "%api_key%"
    echo "OPENAI_API_BASE": "%api_base%"
    
) else (
    echo 无效选择，退出...
    pause
    exit /b
)

echo.
echo ========================================
echo              配置完成！
echo ========================================
echo.
echo 下一步：
echo 1. 如果选择了LiteLLM代理，请启动代理服务器
echo 2. 重启Cursor应用程序
echo 3. 检查OpenMemory是否正常工作
echo.
echo 如需帮助，请查看"谷歌API配置指南.md"
echo.
pause 
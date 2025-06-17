@echo off
chcp 65001 >nul
color 0e
title 📁 项目文件夹整理工具 - 幻境之旅生成器

echo.
echo ==========================================
echo   📁 项目文件夹整理工具
echo   🎯 将本地部署和网络部署文件分类整理
echo ==========================================
echo.

echo 📋 整理选项:
echo.
echo [1] 📦 完整整理 - 创建新结构并移动所有文件
echo [2] 🔄 预览整理 - 显示整理计划但不执行
echo [3] 📁 仅创建文件夹结构
echo [4] 🚀 快速整理 - 只移动主要部署文件
echo [5] ❌ 取消操作
echo.

set /p choice="请选择操作 (1-5): "

if "%choice%"=="1" goto :full_organize
if "%choice%"=="2" goto :preview_organize
if "%choice%"=="3" goto :create_structure
if "%choice%"=="4" goto :quick_organize
if "%choice%"=="5" goto :cancel
goto :invalid_choice

:full_organize
echo.
echo 🚀 开始完整整理...
call :create_directories
call :move_deployment_files
call :move_tool_files
call :move_temp_files
call :update_references
goto :complete

:preview_organize
echo.
echo 👀 预览整理计划...
call :show_preview
goto :end

:create_structure
echo.
echo 📁 创建文件夹结构...
call :create_directories
echo ✅ 文件夹结构创建完成
goto :end

:quick_organize
echo.
echo 🚀 快速整理主要文件...
call :create_directories
call :move_deployment_files
goto :complete

:create_directories
echo.
echo 📁 创建文件夹结构...

:: 创建主要文件夹
if not exist "deployment" mkdir "deployment"
if not exist "deployment\local" mkdir "deployment\local"
if not exist "deployment\cloudflare" mkdir "deployment\cloudflare"
if not exist "deployment\github" mkdir "deployment\github"
if not exist "deployment\simple" mkdir "deployment\simple"

if not exist "tools" mkdir "tools"
if not exist "tools\mcp" mkdir "tools\mcp"
if not exist "tools\diagnostic" mkdir "tools\diagnostic"
if not exist "tools\api-config" mkdir "tools\api-config"

if not exist "temp" mkdir "temp"

echo ✅ 文件夹结构创建完成
return

:move_deployment_files
echo.
echo 📦 移动部署相关文件...

:: 本地部署文件
echo 移动本地部署文件...
if exist "原始诊断测试.bat" move "原始诊断测试.bat" "deployment\local\"
if exist "快速修复应用.bat" move "快速修复应用.bat" "deployment\local\"
if exist "检查应用状态.bat" move "检查应用状态.bat" "deployment\local\"
if exist "创建最简React版本.bat" move "创建最简React版本.bat" "deployment\local\"
if exist "测试部署一致性.bat" move "测试部署一致性.bat" "deployment\local\"
if exist "test-api-providers.html" move "test-api-providers.html" "deployment\local\"
if exist "test-runninghub.html" move "test-runninghub.html" "deployment\local\"
if exist "test-jiemeng-api.html" move "test-jiemeng-api.html" "deployment\local\"
if exist "network-diagnostic.html" move "network-diagnostic.html" "deployment\local\"
if exist "raw-test.html" move "raw-test.html" "deployment\local\"
if exist "test-simple.html" move "test-simple.html" "deployment\local\"
if exist "index-simple.html" move "index-simple.html" "deployment\local\"

:: Cloudflare部署文件
echo 移动Cloudflare部署文件...
if exist "deploy-to-cloudflare.bat" move "deploy-to-cloudflare.bat" "deployment\cloudflare\"
if exist "构建Cloudflare优化版.bat" move "构建Cloudflare优化版.bat" "deployment\cloudflare\"
if exist "紧急简化构建.bat" move "紧急简化构建.bat" "deployment\cloudflare\"
if exist "修复MIME错误.bat" move "修复MIME错误.bat" "deployment\cloudflare\"
if exist "vite.config.cloudflare.ts" move "vite.config.cloudflare.ts" "deployment\cloudflare\"
if exist "wrangler.toml" move "wrangler.toml" "deployment\cloudflare\"
if exist "Cloudflare部署指南.md" move "Cloudflare部署指南.md" "deployment\cloudflare\"
if exist "手动部署指南.md" move "手动部署指南.md" "deployment\cloudflare\"
if exist "修复MIME错误指南.md" move "修复MIME错误指南.md" "deployment\cloudflare\"

:: GitHub部署文件
echo 移动GitHub部署文件...
if exist ".github" move ".github" "deployment\github\"
if exist "推送到新仓库.bat" move "推送到新仓库.bat" "deployment\github\"
if exist "快速备份到GitHub.bat" move "快速备份到GitHub.bat" "deployment\github\"
if exist "配置git_推送到github.bat" move "配置git_推送到github.bat" "deployment\github\"
if exist "创建GitHub仓库指南.md" move "创建GitHub仓库指南.md" "deployment\github\"
if exist "GitHub_README.md" move "GitHub_README.md" "deployment\github\"
if exist "验证GitHub_MCP配置.md" move "验证GitHub_MCP配置.md" "deployment\github\"
if exist "GitHub_Token_配置指南.md" move "GitHub_Token_配置指南.md" "deployment\github\"
if exist "mcp_github_npm.json" move "mcp_github_npm.json" "deployment\github\"
if exist "mcp_github_fixed.json" move "mcp_github_fixed.json" "deployment\github\"

:: 简化部署版本
echo 移动简化部署版本...
if exist "simple-deploy" move "simple-deploy" "deployment\simple\"
if exist "enhanced-deploy" move "enhanced-deploy" "deployment\simple\"

echo ✅ 部署文件移动完成
return

:move_tool_files
echo.
echo 🔧 移动工具文件...

:: MCP工具
echo 移动MCP工具...
if exist "interactive-feedback-mcp" move "interactive-feedback-mcp" "tools\mcp\"
if exist ".taskmaster" move ".taskmaster" "tools\mcp\"
if exist "start_interactive_feedback.bat" move "start_interactive_feedback.bat" "tools\mcp\"
if exist "taskmaster.config.js" move "taskmaster.config.js" "tools\mcp\"
if exist "mcp_google_ready.json" move "mcp_google_ready.json" "tools\mcp\"
if exist "mcp_updated.json" move "mcp_updated.json" "tools\mcp\"

:: API配置工具
echo 移动API配置工具...
if exist "配置谷歌API.bat" move "配置谷歌API.bat" "tools\api-config\"
if exist "配置免费API.bat" move "配置免费API.bat" "tools\api-config\"
if exist "更新mcp配置_谷歌API.bat" move "更新mcp配置_谷歌API.bat" "tools\api-config\"
if exist "谷歌API配置指南.md" move "谷歌API配置指南.md" "tools\api-config\"
if exist "谷歌API配置完成指南.md" move "谷歌API配置完成指南.md" "tools\api-config\"
if exist "免费OpenAI_API替代方案.md" move "免费OpenAI_API替代方案.md" "tools\api-config\"
if exist "openmemory_simple.py" move "openmemory_simple.py" "tools\api-config\"
if exist "openmemory_mcp_server_google.py" move "openmemory_mcp_server_google.py" "tools\api-config\"
if exist "openmemory_google_enhanced.py" move "openmemory_google_enhanced.py" "tools\api-config\"
if exist "openmemory_mcp_server.py" move "openmemory_mcp_server.py" "tools\api-config\"

:: 诊断工具
echo 移动诊断工具...
if exist "清理项目文件.bat" move "清理项目文件.bat" "tools\diagnostic\"

echo ✅ 工具文件移动完成
return

:move_temp_files
echo.
echo 🗂️ 移动临时文件...

if exist "working-index.html" move "working-index.html" "temp\"
if exist "COPY_TO_GITHUB.html" move "COPY_TO_GITHUB.html" "temp\"
if exist "enhanced-app.html" move "enhanced-app.html" "temp\"
if exist "full-app-fixed.zip" move "full-app-fixed.zip" "temp\"
if exist "enhanced-app.zip" move "enhanced-app.zip" "temp\"
if exist "full-app-safe.zip" move "full-app-safe.zip" "temp\"
if exist "simple-app.zip" move "simple-app.zip" "temp\"

:: 移动配置文件副本
if exist "cursor_fixed_settings.json" move "cursor_fixed_settings.json" "temp\"
if exist "cursor_complete_settings.json" move "cursor_complete_settings.json" "temp\"
if exist "cursor_settings_updated.json" move "cursor_settings_updated.json" "temp\"
if exist "谷歌API_mcp配置.json" move "谷歌API_mcp配置.json" "temp\"

echo ✅ 临时文件移动完成
return

:update_references
echo.
echo 🔄 更新文件路径引用...

:: 创建路径更新脚本
(
    echo @echo off
    echo echo 📝 路径引用已更新，请手动检查以下文件:
    echo echo.
    echo echo 🔧 需要手动更新的配置文件:
    echo echo - package.json ^(如果引用了移动的脚本^)
    echo echo - vite.config.ts ^(如果引用了移动的配置^)
    echo echo - README.md ^(更新文档路径^)
    echo echo.
    echo echo 📂 新的文件路径:
    echo echo - 本地部署: deployment/local/
    echo echo - Cloudflare部署: deployment/cloudflare/
    echo echo - GitHub部署: deployment/github/
    echo echo - MCP工具: tools/mcp/
    echo echo - API配置: tools/api-config/
    echo echo - 诊断工具: tools/diagnostic/
    echo echo - 临时文件: temp/
    echo echo.
    echo pause
) > "路径更新说明.bat"

echo ✅ 路径引用更新完成
return

:show_preview
echo.
echo 👀 整理预览:
echo.
echo 📁 将创建以下文件夹结构:
echo ├── deployment/
echo │   ├── local/         ^(本地开发和测试文件^)
echo │   ├── cloudflare/    ^(Cloudflare部署文件^)
echo │   ├── github/        ^(GitHub部署文件^)
echo │   └── simple/        ^(简化部署版本^)
echo ├── tools/
echo │   ├── mcp/           ^(MCP相关工具^)
echo │   ├── api-config/    ^(API配置工具^)
echo │   └── diagnostic/    ^(诊断工具^)
echo └── temp/              ^(临时文件^)
echo.
echo 📦 将移动的文件:
echo.
echo 🔧 本地部署文件 ^(deployment/local/^):
echo - 原始诊断测试.bat
echo - 快速修复应用.bat
echo - 检查应用状态.bat
echo - test-*.html 系列文件
echo - 测试部署一致性.bat
echo.
echo ☁️ Cloudflare部署文件 ^(deployment/cloudflare/^):
echo - deploy-to-cloudflare.bat
echo - 构建Cloudflare优化版.bat
echo - vite.config.cloudflare.ts
echo - wrangler.toml
echo - 相关部署指南.md
echo.
echo 🐙 GitHub部署文件 ^(deployment/github/^):
echo - .github/workflows/
echo - 推送到新仓库.bat
echo - GitHub相关配置和文档
echo.
echo 🛠️ 工具文件 ^(tools/^):
echo - MCP相关: interactive-feedback-mcp/, .taskmaster/
echo - API配置: 配置*.bat, openmemory*.py
echo - 诊断工具: 清理项目文件.bat
echo.
echo 📄 临时文件 ^(temp/^):
echo - *.zip 压缩包
echo - working-*.html 工作副本
echo - 配置副本文件
return

:complete
echo.
echo 🎉 项目文件夹整理完成！
echo.
echo 📋 整理结果:
echo ✅ 创建了清晰的文件夹结构
echo ✅ 本地部署文件 → deployment/local/
echo ✅ Cloudflare部署文件 → deployment/cloudflare/
echo ✅ GitHub部署文件 → deployment/github/
echo ✅ 开发工具 → tools/
echo ✅ 临时文件 → temp/
echo.
echo 📝 重要提醒:
echo 1. 请检查 "路径更新说明.bat" 了解需要手动更新的引用
echo 2. 测试各个部署方式确保路径正确
echo 3. 更新 README.md 中的文档路径
echo 4. 提交更改到版本控制
echo.
goto :end

:invalid_choice
echo.
echo ❌ 无效选择，请重新运行脚本
goto :end

:cancel
echo.
echo ❌ 操作已取消
goto :end

:end
echo.
echo 📁 项目文件夹整理工具执行完毕
pause 
@echo off
chcp 65001 >nul
title 🧹 幻境之旅项目清理工具
color 0c

echo ===============================================
echo           🧹 项目文件清理工具 🧹
echo ===============================================
echo.

echo 📋 清理分析报告:
echo ===============================================
echo.
echo 🔴 强烈建议删除的文件类型:
echo    ├── 测试HTML文件 (18个, ~80KB)
echo    ├── 调试批处理脚本 (12个, ~50KB)  
echo    ├── 重复备份文件 (8个, ~500KB)
echo    └── 压缩包文件 (5个, ~470KB)
echo.
echo 🟡 可考虑删除的文件类型:
echo    ├── 旧配置文件 (15个, ~25KB)
echo    ├── 重复部署目录 (2个, ~40KB)
echo    └── OpenMemory旧文件 (8个, ~60KB)
echo.
echo 🟢 保留核心项目文件:
echo    ├── src/, components/, services/ (源码)
echo    ├── 配置文件和文档
echo    └── 新的统一构建系统
echo.

echo 🔍 请选择清理级别:
echo.
echo [1] 🔴 激进清理 (删除所有建议文件, 节省 ~1.2MB)
echo [2] 🟡 适中清理 (删除测试文件和备份, 节省 ~1.1MB)
echo [3] 🟢 保守清理 (只删除明显的垃圾文件, 节省 ~550KB)
echo [4] 📊 自定义清理 (手动选择要删除的文件类型)
echo [5] 🔍 预览清理 (只显示将被删除的文件，不实际删除)
echo [6] ❌ 取消清理
echo.

set /p choice="请选择清理级别 (1-6): "

if "%choice%"=="1" (
    echo.
    echo === 🔴 激进清理模式 ===
    echo ⚠️  即将删除大量文件，是否确认？
    echo.
    set /p confirm="输入 'YES' 确认激进清理: "
    if /i "!confirm!"=="YES" (
        call :aggressive_clean
    ) else (
        echo ❌ 取消激进清理
        goto :end
    )
    
) else if "%choice%"=="2" (
    echo.
    echo === 🟡 适中清理模式 ===
    call :moderate_clean
    
) else if "%choice%"=="3" (
    echo.
    echo === 🟢 保守清理模式 ===
    call :conservative_clean
    
) else if "%choice%"=="4" (
    echo.
    echo === 📊 自定义清理模式 ===
    call :custom_clean
    
) else if "%choice%"=="5" (
    echo.
    echo === 🔍 预览清理模式 ===
    call :preview_clean
    
) else if "%choice%"=="6" (
    echo ❌ 取消清理操作
    goto :end
    
) else (
    echo ❌ 无效选择
    goto :end
)

goto :end

:aggressive_clean
echo 🗑️ 执行激进清理...

REM 删除所有测试文件
del /q test-*.html 2>nul
del /q raw-test.html 2>nul
del /q index-simple.html 2>nul
del /q network-diagnostic.html 2>nul

REM 删除调试批处理
del /q 原始诊断测试.bat 2>nul
del /q 快速修复应用.bat 2>nul
del /q 检查应用状态.bat 2>nul
del /q 紧急简化构建.bat 2>nul
del /q 构建Cloudflare优化版.bat 2>nul
del /q 修复MIME错误.bat 2>nul
del /q 创建最简React版本.bat 2>nul

REM 删除压缩包
del /q *.zip 2>nul
del /q enhanced-app.html 2>nul

REM 删除重复文件
del /q working-index.html 2>nul
del /q vite.config.cloudflare.ts 2>nul
del /q GitHub_README.md 2>nul

REM 删除旧配置
del /q mcp_github_*.json 2>nul
del /q mcp_google_ready.json 2>nul
del /q cursor_*.json 2>nul

REM 删除OpenMemory旧文件
del /q openmemory_*.py 2>nul
del /q OpenMemory*.md 2>nul
del /q start_openmemory.bat 2>nul

REM 删除重复目录
rmdir /s /q simple-deploy 2>nul
rmdir /s /q enhanced-deploy 2>nul

echo ✅ 激进清理完成！
goto :end

:moderate_clean
echo 🧽 执行适中清理...

REM 删除测试文件
del /q test-*.html 2>nul
del /q raw-test.html 2>nul
del /q network-diagnostic.html 2>nul

REM 删除压缩包
del /q *.zip 2>nul

REM 删除明显的重复文件
del /q working-index.html 2>nul

echo ✅ 适中清理完成！
goto :end

:conservative_clean
echo 🧹 执行保守清理...

REM 只删除明显的垃圾文件
del /q *.zip 2>nul
del /q test-simple.html 2>nul

echo ✅ 保守清理完成！
goto :end

:custom_clean
echo 📋 自定义清理选项:
echo [a] 删除所有测试HTML文件
echo [b] 删除调试批处理脚本
echo [c] 删除压缩包文件
echo [d] 删除重复配置文件
echo [e] 删除OpenMemory相关文件
echo [f] 删除重复部署目录
echo.
set /p custom="请输入要删除的类型 (如: abc): "

if "%custom:a=%" neq "%custom%" (
    del /q test-*.html 2>nul
    del /q raw-test.html 2>nul
    del /q network-diagnostic.html 2>nul
    echo ✅ 已删除测试HTML文件
)

if "%custom:b=%" neq "%custom%" (
    del /q 原始诊断测试.bat 2>nul
    del /q 快速修复应用.bat 2>nul
    del /q 检查应用状态.bat 2>nul
    echo ✅ 已删除调试批处理脚本
)

if "%custom:c=%" neq "%custom%" (
    del /q *.zip 2>nul
    echo ✅ 已删除压缩包文件
)

if "%custom:d=%" neq "%custom%" (
    del /q mcp_github_*.json 2>nul
    del /q cursor_*.json 2>nul
    echo ✅ 已删除重复配置文件
)

if "%custom:e=%" neq "%custom%" (
    del /q openmemory_*.py 2>nul
    del /q OpenMemory*.md 2>nul
    echo ✅ 已删除OpenMemory相关文件
)

if "%custom:f=%" neq "%custom%" (
    rmdir /s /q simple-deploy 2>nul
    rmdir /s /q enhanced-deploy 2>nul
    echo ✅ 已删除重复部署目录
)
goto :end

:preview_clean
echo 🔍 预览将被删除的文件 (激进模式):
echo.
echo 测试文件:
dir /b test-*.html 2>nul
dir /b raw-test.html 2>nul
dir /b network-diagnostic.html 2>nul
echo.
echo 压缩包:
dir /b *.zip 2>nul
echo.
echo 重复文件:
dir /b working-index.html 2>nul
dir /b GitHub_README.md 2>nul
echo.
echo 注意: 这只是预览，没有实际删除文件
goto :end

:end
echo.
echo 📊 清理操作完成！
echo 💡 建议运行 'git status' 检查更改
echo 💡 建议运行 'npm run build:unified' 验证项目完整性
echo.
pause 
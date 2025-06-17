@echo off
chcp 65001 >nul
echo 🚀 推送幻境之旅生成器到GitHub新仓库

echo.
echo 📋 当前仓库信息：
echo    - 仓库名称：huanjing-ai-generator
echo    - 仓库地址：https://github.com/adonisjinggw/huanjing-ai-generator
echo    - 项目类型：React + TypeScript + Vite AI应用

echo.
echo 🔍 检查Git状态...
git status

echo.
echo 🔗 验证远程仓库配置...
git remote -v

echo.
echo 🚀 开始推送到GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 推送成功！
    echo 📍 仓库地址：https://github.com/adonisjinggw/huanjing-ai-generator
    echo.
    echo 🎯 项目已成功备份到GitHub，包含：
    echo    ✅ 完整的React+TypeScript+Vite项目代码
    echo    ✅ 16个文本服务商 + 18个图像服务商集成
    echo    ✅ 地图功能和响应式UI设计
    echo    ✅ 所有配置文件和文档
    echo    ✅ 完整的提交历史记录
    echo.
    echo 🌟 您现在可以：
    echo    - 在GitHub上查看和管理项目
    echo    - 与他人分享项目链接
    echo    - 设置GitHub Pages部署
    echo    - 配置CI/CD自动化
    echo.
) else (
    echo.
    echo ❌ 推送失败！
    echo 💡 可能的原因：
    echo    - 仓库尚未创建
    echo    - 网络连接问题
    echo    - 权限不足
    echo.
    echo 🔧 解决方案：
    echo    1. 确认已在GitHub创建仓库
    echo    2. 检查网络连接
    echo    3. 验证GitHub账号权限
)

echo.
pause 
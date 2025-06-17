@echo off
chcp 65001 >nul
echo 🚀 开始配置Git并推送到GitHub仓库...

echo.
echo 📋 配置Git用户信息...
git config user.name "adonisjinggw"
git config user.email "adonisjinggw@gmail.com"

echo.
echo 📂 添加所有文件到Git...
git add .

echo.
echo 💾 提交所有文件...
git commit -m "🎯 初始提交：幻境之旅生成器完整项目备份"

echo.
echo 🔗 添加远程仓库...
git remote add origin https://github.com/adonisjinggw/lvxing.git

echo.
echo 📤 推送到GitHub仓库...
git push -u origin main

echo.
echo ✅ 推送完成！请检查GitHub仓库：https://github.com/adonisjinggw/lvxing
pause 
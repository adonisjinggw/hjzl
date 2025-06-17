@echo off
chcp 65001 >nul
echo 🚀 幻境之旅生成器 - 快速备份到GitHub

echo.
echo 📋 第一步：配置Git用户信息
git config user.name adonisjinggw
git config user.email adonisjinggw@gmail.com

echo.
echo 📂 第二步：添加所有文件
git add .

echo.
echo 💾 第三步：提交文件
git commit -m "🎯 幻境之旅生成器完整项目备份 - React+TypeScript+Vite AI应用"

echo.
echo 🔗 第四步：设置远程仓库
git remote remove origin 2>nul
git remote add origin https://github.com/adonisjinggw/lvxing.git

echo.
echo 🌿 第五步：创建main分支并推送
git branch -M main
git push -u origin main

echo.
echo ✅ 备份完成！
echo 📍 仓库地址：https://github.com/adonisjinggw/lvxing
echo.
echo 📋 项目信息：
echo    - 项目名称：幻境之旅生成器
echo    - 技术栈：React + TypeScript + Vite
echo    - 功能：AI图像和文本生成应用
echo    - 集成：16个文本服务商 + 18个图像服务商
echo.
pause 
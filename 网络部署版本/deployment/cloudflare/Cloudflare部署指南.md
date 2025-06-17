# 🚀 幻境之旅生成器 - Cloudflare Pages 部署指南

## 📋 部署概述

本项目支持一键部署到 **Cloudflare Pages**，享受全球CDN加速、免费HTTPS证书和无限带宽。

### 🌟 Cloudflare Pages 优势
- ✅ **全球CDN加速** - 200+个城市的边缘节点
- ✅ **免费额度充足** - 每月500次构建，无限制带宽
- ✅ **自动HTTPS** - 免费SSL证书自动续期
- ✅ **Git集成** - 支持GitHub/GitLab自动部署
- ✅ **预览部署** - 每个分支自动生成预览地址

## 🛠️ 快速部署

### 方法一：一键部署脚本（推荐）
```bash
# 双击运行部署脚本
./deploy-to-cloudflare.bat
```

### 方法二：手动部署
```bash
# 1. 构建项目
npm run build

# 2. 登录Cloudflare（首次使用）
npx wrangler login

# 3. 部署到Cloudflare Pages
npm run deploy
```

## ⚙️ 环境变量配置

部署成功后，需要在Cloudflare Pages控制台配置以下环境变量：

### 1. 登录Cloudflare Dashboard
访问：https://dash.cloudflare.com/

### 2. 进入Pages项目设置
找到项目 `huanjing-zhilv-generator` → Settings → Environment variables

### 3. 添加必要环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `GEMINI_API_KEY` | Google Gemini API密钥 | `AIza...` |
| `NODE_ENV` | 运行环境 | `production` |

### 4. 设置方法

#### 通过Web界面设置：
1. 在Environment variables页面点击"Add variable"
2. 输入变量名和值
3. 选择环境（Production/Preview）
4. 点击"Save"

#### 通过命令行设置：
```bash
# 设置生产环境变量
npx wrangler pages secret put GEMINI_API_KEY --project-name=huanjing-zhilv-generator

# 设置预览环境变量  
npx wrangler pages secret put GEMINI_API_KEY --project-name=huanjing-zhilv-generator --env=preview
```

## 🔄 自动部署设置

### GitHub Actions自动部署
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
    
    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: huanjing-zhilv-generator
        directory: dist
```

### 需要的GitHub Secrets：
- `CLOUDFLARE_API_TOKEN`：Cloudflare API令牌
- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare账户ID
- `GEMINI_API_KEY`：Google Gemini API密钥

## 📊 部署状态检查

### 检查部署状态
```bash
npx wrangler pages project list
npx wrangler pages deployment list --project-name=huanjing-zhilv-generator
```

### 查看日志
```bash
npx wrangler pages deployment tail --project-name=huanjing-zhilv-generator
```

## 🌐 访问地址

部署成功后，应用将在以下地址可用：

- **生产环境**：https://huanjing-zhilv-generator.pages.dev
- **自定义域名**：可在Cloudflare Pages控制台添加

## 🔧 高级配置

### 自定义构建设置
在Cloudflare Pages控制台 → Settings → Builds and deployments：

- **构建命令**：`npm run build`
- **构建输出目录**：`dist`
- **Node.js版本**：`18`

### 重定向规则
创建 `dist/_redirects` 文件支持SPA路由：
```
/*    /index.html   200
```

### Headers配置
创建 `dist/_headers` 文件优化缓存：
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

## ❗ 常见问题

### Q: 部署后显示白屏？
A: 检查构建是否成功，确认 `dist` 目录包含所有必要文件。

### Q: API调用失败？
A: 确认环境变量已正确设置，特别是 `GEMINI_API_KEY`。

### Q: 自定义域名如何配置？
A: 在Cloudflare Pages控制台 → Custom domains 添加域名。

### Q: 如何回滚部署？
A: 在Cloudflare Pages控制台选择历史部署版本并promote。

## 📞 支持与帮助

- **Cloudflare Pages文档**：https://developers.cloudflare.com/pages/
- **Wrangler CLI文档**：https://developers.cloudflare.com/workers/wrangler/
- **项目仓库**：提交Issue获取技术支持

---

🎉 **恭喜！您的"幻境之旅生成器"现已部署到全球CDN，用户可通过高速网络访问您的应用！** 
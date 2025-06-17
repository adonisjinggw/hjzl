# 🔑 GitHub MCP Token 配置指南

## 步骤1：获取GitHub Personal Access Token

1. **访问GitHub Settings**：
   - 登录GitHub账号
   - 点击右上角头像 → Settings
   - 左侧菜单选择 "Developer settings"
   - 点击 "Personal access tokens" → "Tokens (classic)"

2. **创建新Token**：
   - 点击 "Generate new token" → "Generate new token (classic)"
   - Note: 填写 "MCP GitHub Integration"
   - Expiration: 选择合适的过期时间（建议90天）

3. **选择权限范围**：
   ```
   ✅ repo (完整仓库访问权限)
   ✅ workflow (GitHub Actions工作流权限)
   ✅ write:packages (包写入权限)
   ✅ delete:packages (包删除权限)
   ✅ admin:org (组织管理权限，如需要)
   ✅ user (用户信息权限)
   ✅ project (项目权限)
   ✅ gist (Gist权限)
   ```

4. **生成并复制Token**：
   - 点击 "Generate token"
   - **立即复制Token并保存**（只显示一次！）

## 步骤2：配置系统环境变量

### 方法A：通过系统设置（推荐）
1. 按 `Win + R`，输入 `sysdm.cpl`
2. 点击 "高级" → "环境变量"
3. 在 "用户变量" 中点击 "新建"
4. 变量名：`GITHUB_PERSONAL_ACCESS_TOKEN`
5. 变量值：粘贴您的Token
6. 确定保存

### 方法B：通过PowerShell临时设置
```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "您的Token"
```

## 步骤3：验证配置
重启Cursor应用程序，GitHub MCP工具应该显示为已启用状态。

## 🚨 安全提醒
- Token具有强大权限，请妥善保管
- 不要在代码中硬编码Token
- 定期轮换Token提高安全性
- 不再使用时及时删除Token

## 🎯 完成标志
配置成功后，您将在Cursor的MCP设置中看到：
- ✅ GitHub (X tools enabled)

如需帮助，请联系技术支持。 
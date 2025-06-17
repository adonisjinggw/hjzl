# 🛡️ 安全备份指南 - TaskMaster AI 集成版

## 📋 概述

本指南介绍如何安全地备份项目到GitHub，同时保护本地的敏感配置信息（如API密钥）。

## 🔐 安全原则

1. **本地配置不上传** - 真实API密钥只保存在本地
2. **GitHub使用占位符** - 远程仓库中的配置文件使用占位符
3. **自动化处理** - 脚本自动处理敏感信息替换和恢复
4. **备份完整性** - 确保项目功能完整性不受影响

## 🛠️ 使用方法

### 方法1: 安全自动备份 (推荐)

```bash
# 执行安全备份 - 自动处理敏感信息
npm run backup:safe
```

这个命令会：
1. 🔒 临时替换配置文件中的敏感信息
2. 📦 提交并推送到GitHub
3. 🔄 恢复本地配置文件的真实内容
4. ✅ 保持您的本地环境不受影响

### 方法2: 快速本地备份

```bash
# 仅本地备份，不推送到GitHub
npm run backup:quick
```

### 方法3: 手动安全备份

```bash
# 1. 运行安全备份脚本
node scripts/safe-github-backup.js

# 2. 检查本地配置是否恢复
git status
```

## 📁 保护的文件类型

### 自动处理的敏感文件
- `.cursor/mcp.json` - MCP服务器配置
- `package.json` - npm脚本中的API密钥
- `backups/*.json` - 备份配置文件

### 处理的敏感信息
- GitHub Personal Access Token: `github_pat_*`
- OpenAI API Key: `sk-*`
- Google API Key: `AIzaSy*`
- OpenRouter API Key: `sk-or-v1-*`

## 🚫 永不上传的文件

这些文件被 `.gitignore` 保护，永远不会上传到GitHub：

```
.env.taskmaster.local      # 本地环境变量
.cursor/mcp.local.json     # 本地MCP配置
config.local.*             # 所有本地配置
secrets.*                  # 密钥文件
credentials.*              # 凭证文件
```

## 🔧 配置验证

### 检查本地配置完整性
```bash
# 验证TaskMaster AI能否正常工作
npm run taskmaster:status

# 验证MCP服务器能否启动
npm run taskmaster:mcp
```

### 检查GitHub备份状态
1. 访问GitHub仓库页面
2. 检查 `.cursor/mcp.json` 文件
3. 确认API密钥已被替换为占位符

## ⚠️ 注意事项

### 🔒 安全提醒
- **绝不手动提交**包含真实API密钥的文件
- **使用安全脚本**进行所有GitHub备份操作
- **定期检查**GitHub仓库确保没有敏感信息泄露

### 🛟 应急恢复
如果意外提交了敏感信息：

```bash
# 1. 立即撤销最后一次提交
git reset --hard HEAD~1

# 2. 强制推送覆盖远程
git push origin main --force

# 3. 或者删除敏感内容后重新提交
# 编辑文件移除敏感信息
git add .
git commit -m "🔒 移除敏感信息"
git push origin main
```

## 📊 备份状态确认

### ✅ 正常状态指标
- 本地 TaskMaster AI 功能正常
- GitHub 仓库中配置文件使用占位符
- `.gitignore` 文件包含适当的保护规则
- 备份脚本可以无错误执行

### ❌ 问题排查
1. **备份失败**: 检查网络连接和GitHub权限
2. **配置丢失**: 运行 `git checkout .` 恢复文件
3. **API密钥无效**: 检查 `.cursor/mcp.json` 中的密钥

## 🎯 最佳实践

1. **定期备份**: 每次重要更改后运行安全备份
2. **环境隔离**: 开发、测试、生产环境分别配置
3. **密钥轮换**: 定期更新API密钥增强安全性
4. **团队协作**: 团队成员各自配置本地密钥

---

**创建时间**: 2025-01-01  
**适用版本**: TaskMaster AI v1.1.0+  
**维护者**: MCP角色6 - GitHub备份专家 
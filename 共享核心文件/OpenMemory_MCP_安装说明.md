# OpenMemory MCP 服务器安装和配置指南

## 概述
OpenMemory MCP是一个基于Mem0的本地内存服务器，它为MCP兼容的客户端（如Cursor、Claude Desktop等）提供持久化的AI记忆功能。

## 功能特性
- **本地优先**: 所有数据存储在您的本地机器上
- **跨客户端记忆**: 在不同AI工具间共享上下文
- **持久化存储**: 记忆在会话间保持
- **语义搜索**: 基于向量的智能记忆检索

## 已完成的安装步骤

### 1. 依赖项安装 ✅
- mem0ai (0.1.81) - 已安装
- mcp (1.9.3) - 已安装
- 所有相关依赖 - 已安装

### 2. MCP服务器创建 ✅
- `openmemory_mcp_server.py` - 已创建
- 提供4个核心工具:
  - `add_memories`: 存储新记忆
  - `search_memory`: 搜索相关记忆
  - `list_memories`: 查看所有记忆
  - `delete_all_memories`: 清除所有记忆

### 3. Cursor配置 ✅
- 配置文件已备份: `settings.json.backup`
- 新配置已应用到: `C:\Users\Administrator\AppData\Roaming\Cursor\User\settings.json`

## 使用步骤

### 第1步: 设置OpenAI API密钥
1. 编辑 `start_openmemory.bat` 文件
2. 将 `your_openai_api_key_here` 替换为您的实际OpenAI API密钥

### 第2步: 启动MCP服务器
```bash
# 方法1: 使用批处理文件
start_openmemory.bat

# 方法2: 直接运行Python脚本
python openmemory_mcp_server.py
```

### 第3步: 重启Cursor
1. 完全关闭Cursor应用程序
2. 重新启动Cursor
3. 检查MCP设置界面，应该能看到"openmemory"服务器

### 第4步: 验证连接
在Cursor中，您应该能看到MCP服务器已连接，并可以使用以下功能：
- 存储对话记忆
- 搜索历史信息
- 管理记忆数据

## 配置文件位置
- **MCP服务器脚本**: `openmemory_mcp_server.py`
- **Cursor配置**: `C:\Users\Administrator\AppData\Roaming\Cursor\User\settings.json`
- **备份配置**: `C:\Users\Administrator\AppData\Roaming\Cursor\User\settings.json.backup`

## 当前配置
```json
{
    "mcp": {
        "servers": {
            "openmemory": {
                "command": "python",
                "args": [
                    "C:\\Users\\Administrator\\Downloads\\幻境之旅生成器 (4)\\openmemory_mcp_server.py"
                ],
                "env": {
                    "OPENAI_API_KEY": ""
                }
            }
        }
    }
}
```

## 故障排除

### 问题1: MCP服务器无法连接
- 确保OpenAI API密钥设置正确
- 检查Python路径是否正确
- 确认所有依赖包已安装

### 问题2: 记忆功能不工作
- 检查网络连接
- 验证OpenAI API密钥有效性
- 查看控制台错误信息

### 问题3: Cursor无法识别MCP服务器
- 重启Cursor应用程序
- 检查配置文件语法是否正确
- 确认文件路径使用双反斜杠

## 使用示例

### 存储记忆
```
请记住我喜欢使用TypeScript进行前端开发
```

### 搜索记忆
```
你记得我的编程偏好吗？
```

### 查看所有记忆
```
列出我所有的记忆
```

## 注意事项
1. 需要有效的OpenAI API密钥
2. 确保网络连接稳定
3. 记忆数据存储在本地，定期备份重要信息
4. 首次使用可能需要一些时间来初始化向量数据库

## 支持和文档
- Mem0官方文档: https://docs.mem0.ai/
- MCP协议文档: https://modelcontextprotocol.io/
- GitHub仓库: https://github.com/mem0ai/mem0 
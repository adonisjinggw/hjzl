#!/usr/bin/env python3
"""
OpenMemory MCP Server - 谷歌API增强版
A local memory server powered by Mem0 for MCP clients with Google API support
"""

import asyncio
import json
import sys
import os
from typing import Any, Dict, List, Optional

# 谷歌API支持
try:
    import google.generativeai as genai
    import litellm
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False
    print("Warning: Google API packages not installed. Install with: pip install google-generativeai litellm")

from mem0 import Memory
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
)

class GoogleAPIMemoryServer:
    """内存服务器，支持谷歌API"""
    
    def __init__(self):
        self.use_google_api = os.getenv("USE_GOOGLE_API", "false").lower() == "true"
        self.google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.use_google_api and GOOGLE_API_AVAILABLE:
            self._setup_google_api()
        
        # 初始化Mem0内存，支持自定义配置
        self.memory = self._init_memory()
    
    def _setup_google_api(self):
        """设置谷歌API"""
        if self.google_api_key:
            try:
                genai.configure(api_key=self.google_api_key)
                print("✅ 谷歌API配置成功")
            except Exception as e:
                print(f"❌ 谷歌API配置失败: {e}")
        else:
            print("⚠️ 未提供谷歌API密钥")
    
    def _init_memory(self):
        """初始化记忆系统，支持谷歌API"""
        try:
            # 如果使用谷歌API，创建自定义配置
            if self.use_google_api and GOOGLE_API_AVAILABLE and self.google_api_key:
                config = {
                    "llm": {
                        "provider": "litellm",
                        "config": {
                            "model": "gemini/gemini-pro",
                            "api_key": self.google_api_key,
                            "api_base": "https://generativelanguage.googleapis.com/v1beta"
                        }
                    }
                }
                return Memory(config=config)
            else:
                # 使用默认配置
                return Memory()
        except Exception as e:
            print(f"❌ 内存系统初始化失败: {e}")
            # 回退到默认配置
            return Memory()

# 全局内存实例
memory_server = GoogleAPIMemoryServer()
memory = memory_server.memory

class OpenMemoryMCPServer:
    def __init__(self):
        self.server = Server("openmemory")
        self._setup_handlers()
    
    def _setup_handlers(self):
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """列出可用的内存工具"""
            return [
                Tool(
                    name="add_memories",
                    description="存储新的记忆内容",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "text": {"type": "string", "description": "要存储为记忆的文本内容"},
                            "user_id": {"type": "string", "description": "用户标识符", "default": "default_user"},
                            "metadata": {"type": "object", "description": "记忆的可选元数据"}
                        },
                        "required": ["text"]
                    }
                ),
                Tool(
                    name="search_memory",
                    description="检索相关记忆",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "搜索查询"},
                            "user_id": {"type": "string", "description": "用户标识符", "default": "default_user"},
                            "limit": {"type": "integer", "description": "最大结果数量", "default": 10}
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="list_memories",
                    description="查看所有存储的记忆",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "用户标识符", "default": "default_user"}
                        }
                    }
                ),
                Tool(
                    name="delete_memory",
                    description="删除指定记忆",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "memory_id": {"type": "string", "description": "要删除的记忆ID"},
                            "user_id": {"type": "string", "description": "用户标识符", "default": "default_user"}
                        },
                        "required": ["memory_id"]
                    }
                ),
                Tool(
                    name="delete_all_memories",
                    description="清除所有记忆",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "用户标识符", "default": "default_user"}
                        }
                    }
                ),
                Tool(
                    name="update_memory",
                    description="更新现有记忆",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "memory_id": {"type": "string", "description": "要更新的记忆ID"},
                            "new_text": {"type": "string", "description": "新的记忆内容"},
                            "user_id": {"type": "string", "description": "用户标识符", "default": "default_user"}
                        },
                        "required": ["memory_id", "new_text"]
                    }
                ),
                Tool(
                    name="get_api_status",
                    description="检查API状态和配置",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                )
            ]

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: dict) -> List[TextContent]:
            """处理工具调用"""
            try:
                if name == "add_memories":
                    text = arguments.get("text", "")
                    user_id = arguments.get("user_id", "default_user")
                    metadata = arguments.get("metadata", {})
                    
                    if not text:
                        return [TextContent(
                            type="text",
                            text="❌ 错误：文本内容不能为空"
                        )]
                    
                    # 使用Mem0添加记忆
                    result = memory.add(text, user_id=user_id, metadata=metadata)
                    
                    return [TextContent(
                        type="text",
                        text=f"✅ 记忆添加成功：\n{json.dumps(result, indent=2, ensure_ascii=False)}"
                    )]
                
                elif name == "search_memory":
                    query = arguments.get("query", "")
                    user_id = arguments.get("user_id", "default_user")
                    limit = arguments.get("limit", 10)
                    
                    if not query:
                        return [TextContent(
                            type="text",
                            text="❌ 错误：搜索查询不能为空"
                        )]
                    
                    # 使用Mem0搜索记忆
                    results = memory.search(query, user_id=user_id, limit=limit)
                    
                    if not results:
                        return [TextContent(
                            type="text",
                            text=f"🔍 未找到与 '{query}' 相关的记忆"
                        )]
                    
                    return [TextContent(
                        type="text",
                        text=f"🔍 搜索结果 (查询: {query}):\n{json.dumps(results, indent=2, ensure_ascii=False)}"
                    )]
                
                elif name == "list_memories":
                    user_id = arguments.get("user_id", "default_user")
                    
                    # 获取所有记忆
                    results = memory.get_all(user_id=user_id)
                    
                    if not results:
                        return [TextContent(
                            type="text",
                            text=f"📝 用户 {user_id} 暂无存储的记忆"
                        )]
                    
                    return [TextContent(
                        type="text",
                        text=f"📝 用户 {user_id} 的所有记忆:\n{json.dumps(results, indent=2, ensure_ascii=False)}"
                    )]
                
                elif name == "delete_memory":
                    memory_id = arguments.get("memory_id", "")
                    user_id = arguments.get("user_id", "default_user")
                    
                    if not memory_id:
                        return [TextContent(
                            type="text",
                            text="❌ 错误：记忆ID不能为空"
                        )]
                    
                    # 删除指定记忆
                    result = memory.delete(memory_id=memory_id)
                    
                    return [TextContent(
                        type="text",
                        text=f"🗑️ 记忆删除成功 (ID: {memory_id}):\n{json.dumps(result, indent=2, ensure_ascii=False)}"
                    )]
                
                elif name == "delete_all_memories":
                    user_id = arguments.get("user_id", "default_user")
                    
                    # 删除所有记忆
                    result = memory.delete_all(user_id=user_id)
                    
                    return [TextContent(
                        type="text",
                        text=f"🗑️ 用户 {user_id} 的所有记忆已删除:\n{json.dumps(result, indent=2, ensure_ascii=False)}"
                    )]
                
                elif name == "update_memory":
                    memory_id = arguments.get("memory_id", "")
                    new_text = arguments.get("new_text", "")
                    user_id = arguments.get("user_id", "default_user")
                    
                    if not memory_id or not new_text:
                        return [TextContent(
                            type="text",
                            text="❌ 错误：记忆ID和新文本内容都不能为空"
                        )]
                    
                    # 更新记忆
                    result = memory.update(memory_id=memory_id, data=new_text)
                    
                    return [TextContent(
                        type="text",
                        text=f"✏️ 记忆更新成功 (ID: {memory_id}):\n{json.dumps(result, indent=2, ensure_ascii=False)}"
                    )]
                
                elif name == "get_api_status":
                    status = {
                        "memory_system": "Mem0",
                        "google_api_available": GOOGLE_API_AVAILABLE,
                        "using_google_api": memory_server.use_google_api,
                        "google_api_key_configured": bool(memory_server.google_api_key),
                        "server_version": "1.1.0 (Google API Enhanced)"
                    }
                    
                    return [TextContent(
                        type="text",
                        text=f"📊 OpenMemory API状态:\n{json.dumps(status, indent=2, ensure_ascii=False)}"
                    )]
                
                else:
                    return [TextContent(
                        type="text",
                        text=f"❌ 未知工具: {name}"
                    )]
                    
            except Exception as e:
                error_msg = f"❌ 执行 {name} 时出错: {str(e)}"
                print(error_msg)  # 也输出到控制台用于调试
                return [TextContent(
                    type="text",
                    text=error_msg
                )]

    async def run(self):
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="openmemory",
                    server_version="1.1.0",
                    capabilities=self.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={}
                    )
                )
            )

async def main():
    print("🚀 OpenMemory MCP服务器启动中...")
    
    # 显示配置信息
    if memory_server.use_google_api:
        print("🔧 配置: 使用谷歌API")
        if memory_server.google_api_key:
            print("✅ 谷歌API密钥已配置")
        else:
            print("⚠️ 谷歌API密钥未配置")
    else:
        print("🔧 配置: 使用默认API")
    
    server = OpenMemoryMCPServer()
    print("✅ 服务器启动成功，等待连接...")
    await server.run()

if __name__ == "__main__":
    asyncio.run(main()) 
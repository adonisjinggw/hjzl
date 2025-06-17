#!/usr/bin/env python3
"""
OpenMemory MCP Server - 简化版
A simple memory server for MCP clients without complex dependencies
"""

import asyncio
import json
import sys
import os
import pickle
from typing import Any, Dict, List, Optional
from datetime import datetime
import uuid

from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
)

class SimpleMemoryStore:
    """简单的内存存储，使用文件系统"""
    
    def __init__(self, storage_path="./simple_memory.pkl"):
        self.storage_path = storage_path
        self.memories = self._load_memories()
    
    def _load_memories(self):
        """从文件加载记忆"""
        try:
            if os.path.exists(self.storage_path):
                with open(self.storage_path, 'rb') as f:
                    return pickle.load(f)
        except Exception as e:
            print(f"加载记忆失败: {e}")
        return {}
    
    def _save_memories(self):
        """保存记忆到文件"""
        try:
            with open(self.storage_path, 'wb') as f:
                pickle.dump(self.memories, f)
        except Exception as e:
            print(f"保存记忆失败: {e}")
    
    def add_memory(self, text: str, user_id: str = "default", metadata: dict = None):
        """添加记忆"""
        memory_id = str(uuid.uuid4())
        memory = {
            "id": memory_id,
            "text": text,
            "user_id": user_id,
            "metadata": metadata or {},
            "created_at": datetime.now().isoformat()
        }
        
        if user_id not in self.memories:
            self.memories[user_id] = []
        
        self.memories[user_id].append(memory)
        self._save_memories()
        return memory
    
    def search_memories(self, query: str, user_id: str = "default", limit: int = 10):
        """搜索记忆（简单文本匹配）"""
        user_memories = self.memories.get(user_id, [])
        results = []
        
        query_lower = query.lower()
        for memory in user_memories:
            if query_lower in memory["text"].lower():
                results.append(memory)
                if len(results) >= limit:
                    break
        
        return results
    
    def get_all_memories(self, user_id: str = "default"):
        """获取用户所有记忆"""
        return self.memories.get(user_id, [])
    
    def delete_all_memories(self, user_id: str = "default"):
        """删除用户所有记忆"""
        if user_id in self.memories:
            count = len(self.memories[user_id])
            del self.memories[user_id]
            self._save_memories()
            return {"deleted_count": count}
        return {"deleted_count": 0}

# 全局记忆存储
memory_store = SimpleMemoryStore()

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
                    name="get_server_status",
                    description="检查服务器状态",
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
                    
                    result = memory_store.add_memory(text, user_id, metadata)
                    
                    return [TextContent(
                        type="text",
                        text=f"✅ 记忆添加成功！\n📝 内容: {text}\n🆔 ID: {result['id']}\n⏰ 时间: {result['created_at']}"
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
                    
                    results = memory_store.search_memories(query, user_id, limit)
                    
                    if not results:
                        return [TextContent(
                            type="text",
                            text=f"🔍 未找到与 '{query}' 相关的记忆"
                        )]
                    
                    result_text = f"🔍 找到 {len(results)} 条相关记忆:\n\n"
                    for i, memory in enumerate(results, 1):
                        result_text += f"{i}. 📝 {memory['text']}\n   🆔 {memory['id']}\n   ⏰ {memory['created_at']}\n\n"
                    
                    return [TextContent(
                        type="text",
                        text=result_text
                    )]
                
                elif name == "list_memories":
                    user_id = arguments.get("user_id", "default_user")
                    
                    results = memory_store.get_all_memories(user_id)
                    
                    if not results:
                        return [TextContent(
                            type="text",
                            text=f"📝 用户 {user_id} 暂无存储的记忆"
                        )]
                    
                    result_text = f"📝 用户 {user_id} 的所有记忆 (共{len(results)}条):\n\n"
                    for i, memory in enumerate(results, 1):
                        result_text += f"{i}. 📝 {memory['text']}\n   🆔 {memory['id']}\n   ⏰ {memory['created_at']}\n\n"
                    
                    return [TextContent(
                        type="text",
                        text=result_text
                    )]
                
                elif name == "delete_all_memories":
                    user_id = arguments.get("user_id", "default_user")
                    
                    result = memory_store.delete_all_memories(user_id)
                    
                    return [TextContent(
                        type="text",
                        text=f"🗑️ 已删除用户 {user_id} 的 {result['deleted_count']} 条记忆"
                    )]
                
                elif name == "get_server_status":
                    total_memories = sum(len(memories) for memories in memory_store.memories.values())
                    total_users = len(memory_store.memories)
                    
                    status = {
                        "server_name": "OpenMemory Simple",
                        "version": "1.0.0",
                        "storage_type": "File System",
                        "total_memories": total_memories,
                        "total_users": total_users,
                        "storage_path": memory_store.storage_path,
                        "status": "Running"
                    }
                    
                    return [TextContent(
                        type="text",
                        text=f"📊 服务器状态:\n{json.dumps(status, indent=2, ensure_ascii=False)}"
                    )]
                
                else:
                    return [TextContent(
                        type="text",
                        text=f"❌ 未知工具: {name}"
                    )]
                    
            except Exception as e:
                error_msg = f"❌ 执行 {name} 时出错: {str(e)}"
                print(error_msg)
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
                    server_version="1.0.0",
                    capabilities=self.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={}
                    )
                )
            )

async def main():
    print("🚀 OpenMemory 简化版服务器启动中...")
    print("📁 存储方式: 本地文件系统")
    print("✅ 服务器启动成功，等待连接...")
    
    server = OpenMemoryMCPServer()
    await server.run()

if __name__ == "__main__":
    asyncio.run(main()) 
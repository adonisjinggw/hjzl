#!/usr/bin/env python3
"""
OpenMemory MCP Server
A local memory server powered by Mem0 for MCP clients
"""

import asyncio
import json
import sys
import os
from typing import Any, Dict, List, Optional

from mem0 import Memory
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
)

# Initialize Mem0 memory
memory = Memory()

class OpenMemoryMCPServer:
    def __init__(self):
        self.server = Server("openmemory")
        self._setup_handlers()
    
    def _setup_handlers(self):
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """List available memory tools."""
            return [
                Tool(
                    name="add_memories",
                    description="Store new memory objects",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "text": {"type": "string", "description": "The text to store as memory"},
                            "user_id": {"type": "string", "description": "User identifier", "default": "default_user"},
                            "metadata": {"type": "object", "description": "Optional metadata for the memory"}
                        },
                        "required": ["text"]
                    }
                ),
                Tool(
                    name="search_memory",
                    description="Retrieve relevant memories",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query"},
                            "user_id": {"type": "string", "description": "User identifier", "default": "default_user"},
                            "limit": {"type": "integer", "description": "Maximum number of results", "default": 10}
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="list_memories",
                    description="View all stored memories",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User identifier", "default": "default_user"}
                        }
                    }
                ),
                Tool(
                    name="delete_all_memories",
                    description="Clear all memories",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User identifier", "default": "default_user"}
                        }
                    }
                )
            ]

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: dict) -> List[TextContent]:
            """Handle tool calls."""
            try:
                if name == "add_memories":
                    text = arguments.get("text", "")
                    user_id = arguments.get("user_id", "default_user")
                    metadata = arguments.get("metadata", {})
                    
                    # Add memory using Mem0
                    result = memory.add(text, user_id=user_id, metadata=metadata)
                    
                    return [TextContent(
                        type="text",
                        text=f"Memory added successfully: {json.dumps(result, indent=2)}"
                    )]
                
                elif name == "search_memory":
                    query = arguments.get("query", "")
                    user_id = arguments.get("user_id", "default_user")
                    limit = arguments.get("limit", 10)
                    
                    # Search memories using Mem0
                    results = memory.search(query, user_id=user_id, limit=limit)
                    
                    return [TextContent(
                        type="text",
                        text=f"Search results:\n{json.dumps(results, indent=2)}"
                    )]
                
                elif name == "list_memories":
                    user_id = arguments.get("user_id", "default_user")
                    
                    # Get all memories using Mem0
                    results = memory.get_all(user_id=user_id)
                    
                    return [TextContent(
                        type="text",
                        text=f"All memories:\n{json.dumps(results, indent=2)}"
                    )]
                
                elif name == "delete_all_memories":
                    user_id = arguments.get("user_id", "default_user")
                    
                    # Delete all memories using Mem0
                    result = memory.delete_all(user_id=user_id)
                    
                    return [TextContent(
                        type="text",
                        text=f"All memories deleted for user {user_id}: {json.dumps(result, indent=2)}"
                    )]
                
                else:
                    return [TextContent(
                        type="text",
                        text=f"Unknown tool: {name}"
                    )]
                    
            except Exception as e:
                return [TextContent(
                    type="text",
                    text=f"Error executing {name}: {str(e)}"
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
    server = OpenMemoryMCPServer()
    await server.run()

if __name__ == "__main__":
    asyncio.run(main()) 
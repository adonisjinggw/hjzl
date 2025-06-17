#!/usr/bin/env node

/**
 * TaskMaster AI MCP 服务器测试脚本
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('🧪 测试 TaskMaster AI MCP 服务器...\n');

// 启动 MCP 服务器
const mcpServer = spawn('npm', ['run', 'taskmaster:mcp'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

let serverOutput = '';
let serverError = '';

mcpServer.stdout.on('data', (data) => {
  serverOutput += data.toString();
  console.log('📤 服务器输出:', data.toString().trim());
});

mcpServer.stderr.on('data', (data) => {
  serverError += data.toString();
  console.log('⚠️ 服务器错误:', data.toString().trim());
});

// 发送 MCP 初始化消息
const initMessage = JSON.stringify({
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": {
        "listChanged": true
      },
      "sampling": {}
    },
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}) + '\n';

console.log('📡 发送初始化消息...');
mcpServer.stdin.write(initMessage);

// 等待响应
await setTimeout(3000);

// 发送 tools/list 请求
const toolsListMessage = JSON.stringify({
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}) + '\n';

console.log('🔧 请求工具列表...');
mcpServer.stdin.write(toolsListMessage);

// 等待响应
await setTimeout(2000);

// 关闭服务器
mcpServer.kill();

console.log('\n✅ 测试完成！');
console.log('📊 服务器输出长度:', serverOutput.length);
console.log('⚠️ 错误输出长度:', serverError.length);

if (serverOutput.includes('FastMCP')) {
  console.log('🎉 TaskMaster AI MCP 服务器正常启动！');
} else {
  console.log('❌ 服务器启动可能有问题');
}

process.exit(0); 
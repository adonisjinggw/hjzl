#!/usr/bin/env node

/**
 * 安全GitHub备份脚本
 * 在备份时自动替换敏感信息，备份后恢复本地配置
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

console.log('🔒 开始安全备份流程...\n');

// 需要处理的敏感文件和替换规则
const sensitiveFiles = [
  {
    path: '.cursor/mcp.json',
    replacements: [
      {
        search: /github_pat_[A-Za-z0-9_]+/g,
        replace: 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'
      },
      {
        search: /sk-or-v1-[A-Za-z0-9]+/g,
        replace: 'YOUR_OPENROUTER_API_KEY'
      },
      {
        search: /sk-[A-Za-z0-9]+/g,
        replace: 'YOUR_OPENAI_API_KEY'
      },
      {
        search: /AIzaSy[A-Za-z0-9_-]+/g,
        replace: 'YOUR_GOOGLE_API_KEY'
      }
    ]
  },
  {
    path: 'package.json',
    replacements: [
      {
        search: /sk-or-v1-[A-Za-z0-9]+/g,
        replace: 'YOUR_OPENROUTER_API_KEY'
      },
      {
        search: /AIzaSy[A-Za-z0-9_-]+/g,
        replace: 'YOUR_GOOGLE_API_KEY'
      }
    ]
  }
];

// 备份原始文件内容
const originalContents = new Map();

try {
  // 1. 备份原始内容
  console.log('📋 备份原始文件内容...');
  for (const file of sensitiveFiles) {
    if (existsSync(file.path)) {
      const content = readFileSync(file.path, 'utf8');
      originalContents.set(file.path, content);
      console.log(`✅ 已备份: ${file.path}`);
    }
  }

  // 2. 替换敏感信息
  console.log('\n🔄 替换敏感信息...');
  for (const file of sensitiveFiles) {
    if (existsSync(file.path)) {
      let content = readFileSync(file.path, 'utf8');
      
      for (const replacement of file.replacements) {
        content = content.replace(replacement.search, replacement.replace);
      }
      
      writeFileSync(file.path, content);
      console.log(`🔒 已处理: ${file.path}`);
    }
  }

  // 3. Git 操作
  console.log('\n📦 执行Git备份...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "🚀 安全备份: TaskMaster AI v1.1.0 - 敏感信息已脱敏"', { stdio: 'inherit' });
  
  console.log('\n🚀 推送到GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('\n✅ GitHub备份成功！');

} catch (error) {
  console.error('\n❌ 备份过程中出现错误:', error.message);
} finally {
  // 4. 恢复原始文件内容
  console.log('\n🔄 恢复本地配置文件...');
  for (const [filePath, originalContent] of originalContents) {
    writeFileSync(filePath, originalContent);
    console.log(`✅ 已恢复: ${filePath}`);
  }
}

console.log('\n🎉 安全备份流程完成！');
console.log('📝 本地文件已恢复，GitHub上已保存脱敏版本'); 
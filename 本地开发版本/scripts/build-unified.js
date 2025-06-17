/**
 * 统一构建脚本 - 确保本地和部署环境一致
 * 解决本地运行与GitHub部署功能差异问题
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const distDir = 'dist';

console.log('🚀 开始统一构建流程...');

// 1. 检查环境变量配置
console.log('📋 检查环境变量配置...');

const envLocal = '.env.local';
const envProduction = '.env.production';

let geminiApiKey = 'demo_mode';
let isDemo = true;

// 尝试从本地环境文件读取
if (existsSync(envLocal)) {
  try {
    const envContent = readFileSync(envLocal, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match && match[1] && match[1] !== 'PLACEHOLDER_API_KEY') {
      geminiApiKey = match[1].trim();
      isDemo = false;
      console.log('✅ 使用本地API密钥配置');
    }
  } catch (error) {
    console.log('⚠️ 读取本地环境配置失败，使用演示模式');
  }
}

// 2. 创建生产环境配置
console.log('🔧 创建生产环境配置...');

if (!existsSync(envProduction)) {
  const prodEnvContent = `# 生产环境配置 - 自动生成
GEMINI_API_KEY=${geminiApiKey}
NODE_ENV=production
IS_DEMO_MODE=${isDemo}
VITE_APP_VERSION=${process.env.npm_package_version || '1.0.0'}
VITE_BUILD_TIME=${new Date().toISOString()}
`;
  
  writeFileSync(envProduction, prodEnvContent);
  console.log('✅ 生产环境配置文件已创建');
}

// 3. 执行构建
console.log('🏗️ 执行项目构建...');

try {
  // 设置环境变量并构建
  const buildEnv = {
    ...process.env,
    NODE_ENV: 'production',
    GEMINI_API_KEY: geminiApiKey,
    IS_DEMO_MODE: isDemo.toString()
  };
  
  execSync('npm run build', { 
    stdio: 'inherit',
    env: buildEnv 
  });
  
  console.log('✅ 项目构建完成');
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}

// 4. 确保dist目录存在
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// 5. 创建环境信息文件（用于调试）
const buildInfo = {
  buildTime: new Date().toISOString(),
  version: process.env.npm_package_version || '1.0.0',
  isDemoMode: isDemo,
  hasApiKey: !isDemo,
  environment: 'production',
  buildType: 'unified'
};

writeFileSync(join(distDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
console.log('📄 构建信息文件已生成');

// 6. 创建环境检测脚本
const envDetectScript = `
// 环境检测脚本 - 帮助调试部署问题
(function() {
  const buildInfo = ${JSON.stringify(buildInfo)};
  
  console.log('🔍 幻境之旅生成器 - 环境信息:');
  console.log('📅 构建时间:', buildInfo.buildTime);
  console.log('📦 版本:', buildInfo.version);
  console.log('🎭 演示模式:', buildInfo.isDemoMode);
  console.log('🔑 API密钥状态:', buildInfo.hasApiKey ? '已配置' : '未配置');
  console.log('🌍 环境:', buildInfo.environment);
  
  // 添加到window对象供调试使用
  window.__BUILD_INFO__ = buildInfo;
})();
`;

writeFileSync(join(distDir, 'env-detect.js'), envDetectScript);
console.log('🔧 环境检测脚本已生成');

// 7. 运行后处理脚本
console.log('📝 运行后处理脚本...');
try {
  const { execSync } = await import('child_process');
  execSync('node scripts/post-build.js', { stdio: 'inherit' });
  console.log('✅ 后处理完成');
} catch (error) {
  console.log('⚠️ 后处理脚本执行失败:', error.message);
}

console.log('\n🎉 统一构建流程完成！');
console.log('📊 构建摘要:');
console.log(`   - 演示模式: ${isDemo ? '启用' : '禁用'}`);
console.log(`   - API密钥: ${isDemo ? '使用演示模式' : '已配置'}`);
console.log(`   - 输出目录: ${distDir}`);
console.log(`   - 构建时间: ${buildInfo.buildTime}`);

if (isDemo) {
  console.log('\n💡 提示: 当前使用演示模式，功能可能受限');
  console.log('   要启用完整功能，请在 .env.local 中配置真实的 GEMINI_API_KEY');
} 
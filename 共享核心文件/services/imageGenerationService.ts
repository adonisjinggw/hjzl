/**
 * 智能图片生成服务
 * 支持多种AI图片生成API的智能选择和降级
 */

import type { ApiConfig } from '../types';
import { generateTencentHunyuanPhoto } from './tencentHunyuanService';
import { generateJieMengPhoto, hasJieMengApiKey } from './jiemengService';
import { generateVirtualPhoto } from './geminiService';
import { generateRunningHubPhoto, hasRunningHubApiKey } from './runninghubService';
import { generatePollinationsImage, optimizePromptForPollinations } from './pollinationsService';
import { hasOpenAIDalleApiKey } from './openaiDalleService';
import { hasStabilityApiKey } from './stabilityService';
import { trackApiCall } from './apiCallTracker';

/**
 * 统一图片生成服务
 * 根据用户的API配置自动选择最适合的图片生成服务
 * 支持Gemini、即梦3.0、Pollinations.AI和内置免费服务
 */

/**
 * 从localStorage获取当前的API配置
 */
const getCurrentApiConfig = (): ApiConfig | null => {
  try {
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      return JSON.parse(configJson) as ApiConfig;
    }
    return null;
  } catch (error) {
    console.error('获取API配置失败:', error);
    return null;
  }
};

/**
 * 获取Gemini API密钥状态（仅用于图像生成）
 * 这里检查的是文字生成配置中的Gemini密钥，因为Gemini同时支持文字和图像生成
 */
const hasGeminiApiKeyForImages = (): boolean => {
  try {
    const config = getCurrentApiConfig();
    if (config?.textGeneration?.enablePaid && 
        config?.textGeneration?.provider === 'gemini' && 
        config?.textGeneration?.apiKey) {
      return config.textGeneration.apiKey.trim().length > 0;
    }
    return false;
  } catch (error) {
    console.error('检查Gemini API密钥失败:', error);
    return false;
  }
};

/**
 * 检查是否有腾讯混元图像生成API密钥
 */
const hasTencentHunyuanApiKeyForImages = (): boolean => {
  const config = getCurrentApiConfig();
  return !!(config?.imageGeneration?.provider === 'tencent_hunyuan' && config?.imageGeneration?.apiKey);
};

/**
 * 获取图像生成服务优先级列表
 * 根据配置和可用性确定服务使用顺序
 */
const getImageGenerationPriority = (): string[] => {
  const config = getCurrentApiConfig();
  
  // 如果用户明确配置了图像生成服务，优先使用
  if (config?.imageGeneration?.provider) {
    const configuredProvider = config.imageGeneration.provider;
    const otherProviders = [
      'pollinations', 'hunyuan', 'jiemeng', 'runninghub', 'openai_dalle', 
      'stability', 'gemini', 'builtin_free'
    ].filter(p => p !== configuredProvider);
    return [configuredProvider, ...otherProviders];
  }
  
  // 优化后的默认优先级：免费服务优先，确保用户总能生成图片
  return [
    'pollinations', // Pollinations.AI (免费且稳定)
    'tencent_hunyuan', // 腾讯混元图像生成（OpenAI兼容格式）
    'openai_dalle', // OpenAI DALL-E
    'stability',    // Stability AI
    'jiemeng',      // 火山引擎即梦AI
    'runninghub',   // RunningHub AI
    'gemini',       // Google Gemini
    'builtin_free'  // 内置免费服务 (最后兜底)
  ];
};

/**
 * 安全的Base64编码，兼容中文和emoji
 * @param str 输入字符串
 * @returns Base64编码字符串
 */
function safeBtoa(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * 增强的免费API获取提示
 * 当没有可用的付费API时，向用户推荐免费API获取方式
 */
export function suggestFreeApiOptions(): {
  message: string;
  providers: Array<{
    name: string;
    url: string;
    features: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
} {
  return {
    message: '检测到您尚未配置API密钥，以下是推荐的免费服务：',
    providers: [
      {
        name: 'Pollinations.AI',
        url: 'https://pollinations.ai/',
        features: ['完全免费', '无需注册', 'Flux模型', '高质量输出'],
        difficulty: 'easy'
      },
      {
        name: 'DeepSeek API',
        url: 'https://platform.deepseek.com/',
        features: ['500万token/月免费', 'GPT兼容', '中文优化'],
        difficulty: 'easy'
      },
      {
        name: '硅基流动',
        url: 'https://cloud.siliconflow.cn/',
        features: ['新用户5元免费', '多模型支持', '国内访问快'],
        difficulty: 'easy'
      },
      {
        name: 'Google Gemini',
        url: 'https://makersuite.google.com/app/apikey',
        features: ['1500次/天免费', '多模态支持', '图像理解'],
        difficulty: 'medium'
      }
    ]
  };
}

/**
 * 智能选择图片生成服务
 * @param prompt 文本提示
 * @param filterStyle 滤镜风格
 * @param isRealistic 是否为真实风格
 * @param uploadedImageBase64 可选的上传图片
 * @param uploadedImageMimeType 上传图片的MIME类型
 * @returns 包含图片数据和API提供商信息的对象
 */
export async function generateIntelligentPhoto(
  prompt: string,
  filterStyle: string = '自然色彩',
  isRealistic: boolean = false,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<{
  imageBase64: string;
  apiProvider: string;
  promptUsed: string;
}> {
  // 🚫 确保所有生成的图片都没有文字内容
  const noTextPrompt = `${prompt}, no text, no words, no letters, no captions, no signs, 无文字, 无字母, 无标识, pure visual content only`;
  
  console.log('🤖 开始智能图片生成服务选择...');
  console.log('📝 优化后提示词:', noTextPrompt);
  console.log('🎭 滤镜风格:', filterStyle);
  console.log('🌍 真实风格:', isRealistic);
  console.log('🖼️ 有上传图片:', !!uploadedImageBase64);

  const config = getCurrentApiConfig();
  
  // 检查图像生成服务配置
  const imageGenEnabled = config?.imageGeneration?.enablePaid || false;
  console.log('💰 付费图像生成服务状态:', imageGenEnabled ? '已启用' : '未启用');

  const priorityList = getImageGenerationPriority();
  
  // 遍历优先级列表，尝试每个服务
  for (const serviceType of priorityList) {
    try {
      console.log(`🎯 尝试使用服务: ${serviceType}`);
      
      switch (serviceType) {
        case 'pollinations':
          console.log('🆓 使用Pollinations.AI免费生成图片...');
          try {
            // 优化提示词以适配Pollinations
            const optimizedPrompt = optimizePromptForPollinations(noTextPrompt, isRealistic, filterStyle);
            
            const pollinationsResult = await generatePollinationsImage(optimizedPrompt, {
              width: 1024,
              height: 1024,
              model: isRealistic ? 'flux-realism' : 'flux',
              enhance: true,
              nologo: true
            });
            
            return {
              imageBase64: pollinationsResult,
              apiProvider: 'pollinations',
              promptUsed: optimizedPrompt
            };
          } catch (error) {
            console.warn('⚠️ Pollinations.AI生成失败，尝试下一个服务:', error);
            continue;
          }

        case 'tencent_hunyuan':
          if (hasTencentHunyuanApiKeyForImages()) {
            console.log('🌈 使用腾讯混元生成图片...');
            const trackedHunyuanCall = trackApiCall('tencent_hunyuan', 'image', generateTencentHunyuanPhoto);
            const hunyuanResult = await trackedHunyuanCall(
              noTextPrompt, 
              filterStyle, 
              isRealistic, 
              uploadedImageBase64, 
              uploadedImageMimeType
            );
            
            return {
              imageBase64: hunyuanResult,
              apiProvider: 'tencent_hunyuan',
              promptUsed: noTextPrompt
            };
          }
          break;

        case 'jiemeng':
          if (hasJieMengApiKey()) {
            console.log('🔥 使用火山引擎即梦AI生成图片...');
            const trackedJiemengCall = trackApiCall('jiemeng', 'image', generateJieMengPhoto);
            const jiemengResult = await trackedJiemengCall(
              noTextPrompt, 
              filterStyle, 
              isRealistic, 
              uploadedImageBase64, 
              uploadedImageMimeType
            );
            
            return {
              imageBase64: jiemengResult,
              apiProvider: 'jiemeng',
              promptUsed: noTextPrompt
            };
          }
          break;

        case 'runninghub':
          if (hasRunningHubApiKey()) {
            console.log('🚀 使用RunningHub AI ComfyUI工作流生成图片...');
            const trackedRunningHubCall = trackApiCall('runninghub', 'image', generateRunningHubPhoto);
            const runninghubResult = await trackedRunningHubCall(
              noTextPrompt, 
              filterStyle, 
              isRealistic, 
              uploadedImageBase64, 
              uploadedImageMimeType
            );
            
            return {
              imageBase64: runninghubResult,
              apiProvider: 'runninghub',
              promptUsed: noTextPrompt
            };
          }
          break;

        case 'gemini':
          if (hasGeminiApiKeyForImages()) {
            console.log('🧠 使用Google Gemini生成图片...');
            const trackedGeminiCall = trackApiCall('gemini', 'image', generateVirtualPhoto);
            const geminiResult = await trackedGeminiCall(
              noTextPrompt, 
              filterStyle, 
              isRealistic, 
              uploadedImageBase64, 
              uploadedImageMimeType
            );
            
            return {
              imageBase64: geminiResult,
              apiProvider: 'gemini',
              promptUsed: noTextPrompt
            };
          }
          break;

        case 'builtin_free':
          console.log('🆓 使用内置免费服务生成占位图片...');
          // 🚫 生成无文字的占位图片
          const placeholderBase64 = `data:image/svg+xml;base64,${safeBtoa(`
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grad1)"/>
              <circle cx="400" cy="300" r="100" fill="#ffffff" opacity="0.3"/>
              <circle cx="300" cy="200" r="50" fill="#ffffff" opacity="0.2"/>
              <circle cx="500" cy="400" r="75" fill="#ffffff" opacity="0.25"/>
            </svg>
          `)}`;
          
          return {
            imageBase64: placeholderBase64,
            apiProvider: 'builtin_free',
            promptUsed: noTextPrompt
          };

        case 'openai_dalle':
          if (hasOpenAIDalleApiKey()) {
            console.log('🎨 使用OpenAI DALL-E生成图片...');
            const { generateImageWithDallE } = await import('./openaiDalleService');
            const dalleResult = await generateImageWithDallE(noTextPrompt, '', {
              size: '1024x1024',
              quality: 'standard',
              style: isRealistic ? 'natural' : 'vivid'
            });
            
            return {
              imageBase64: dalleResult,
              apiProvider: 'openai_dalle',
              promptUsed: noTextPrompt
            };
          }
          break;

        case 'stability':
          if (hasStabilityApiKey()) {
            console.log('🎭 使用Stability AI生成图片...');
            const { generateImageWithStability } = await import('./stabilityService');
            const stabilityResult = await generateImageWithStability(noTextPrompt, '', {
              width: 1024,
              height: 1024,
              steps: 30,
              cfg_scale: 7
            });
            
            return {
              imageBase64: stabilityResult,
              apiProvider: 'stability',
              promptUsed: noTextPrompt
            };
          }
          break;

        default:
          console.warn(`⚠️ 未知的图像生成服务类型: ${serviceType}`);
          continue;
      }
    } catch (error) {
      console.error(`❌ 服务 ${serviceType} 生成失败:`, error);
      continue;
    }
  }

  // 如果所有服务都失败，返回最终的兜底方案
  console.warn('⚠️ 所有图像生成服务都失败，使用最终兜底方案');
  const emergencyPlaceholder = `data:image/svg+xml;base64,${safeBtoa(`
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="emergency" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#emergency)"/>
      <circle cx="400" cy="300" r="80" fill="#ffffff" opacity="0.4"/>
      <text x="400" y="500" text-anchor="middle" fill="#ffffff" font-size="16" font-family="Arial">
        图像生成服务暂时不可用
      </text>
      <text x="400" y="520" text-anchor="middle" fill="#ffffff" font-size="12" font-family="Arial">
        请检查API配置或稍后重试
      </text>
    </svg>
  `)}`;

  return {
    imageBase64: emergencyPlaceholder,
    apiProvider: 'emergency_fallback',
    promptUsed: noTextPrompt
  };
}

/**
 * 获取当前活跃的图像生成服务信息
 */
export function getActiveImageGenerationService(): {
  provider: string;
  displayName: string;
  isPaid: boolean;
  status: string;
} {
  const priorityList = getImageGenerationPriority();
  const firstAvailable = priorityList[0];
  
  const serviceInfo = {
    hunyuan: { displayName: '腾讯混元图像生成', isPaid: true },
    openai_dalle: { displayName: 'OpenAI DALL-E', isPaid: true },
    stability: { displayName: 'Stability AI', isPaid: true },
    jiemeng: { displayName: '火山引擎即梦AI', isPaid: true },
    runninghub: { displayName: 'RunningHub AI', isPaid: true },
    gemini: { displayName: 'Google Gemini', isPaid: true },
    pollinations: { displayName: 'Pollinations.AI', isPaid: false },
    builtin_free: { displayName: '内置免费服务', isPaid: false }
  };
  
  const info = serviceInfo[firstAvailable as keyof typeof serviceInfo] || serviceInfo.builtin_free;
  
  return {
    provider: firstAvailable,
    displayName: info.displayName,
    isPaid: info.isPaid,
    status: '活跃'
  };
}

/**
 * 测试所有可用的图像生成服务
 */
export async function testAllImageGenerationServices(): Promise<{
  [key: string]: {
    success: boolean;
    message: string;
    responseTime?: number;
    details?: any;
  };
}> {
  const results: any = {};
  const priorityList = getImageGenerationPriority();
  
  for (const serviceType of priorityList) {
    const startTime = Date.now();
    
    try {
      switch (serviceType) {
        case 'hunyuan':
          if (hasTencentHunyuanApiKeyForImages()) {
            const { testTencentHunyuanImageConnection } = await import('./tencentHunyuanService');
            results[serviceType] = await testTencentHunyuanImageConnection();
          } else {
            results[serviceType] = {
              success: false,
              message: '腾讯混元图像生成API密钥未配置'
            };
          }
          break;
          
        case 'pollinations':
          const { testPollinationsConnection } = await import('./pollinationsService');
          results[serviceType] = await testPollinationsConnection();
          break;
          
        case 'jiemeng':
          if (hasJieMengApiKey()) {
            const { testJieMengApiConnection } = await import('./jiemengService');
            results[serviceType] = await testJieMengApiConnection();
          } else {
            results[serviceType] = {
              success: false,
              message: '即梦AI API密钥未配置'
            };
          }
          break;
          
        case 'runninghub':
          if (hasRunningHubApiKey()) {
            const { testRunningHubApiConnection } = await import('./runninghubService');
            results[serviceType] = await testRunningHubApiConnection();
          } else {
            results[serviceType] = {
              success: false,
              message: 'RunningHub AI API密钥未配置'
            };
          }
          break;
          
        case 'gemini':
          // 这里可以添加Gemini的测试
          results[serviceType] = {
            success: hasGeminiApiKeyForImages(),
            message: hasGeminiApiKeyForImages() ? 'Gemini API已配置' : 'Gemini API密钥未配置'
          };
          break;
          
        case 'openai_dalle':
          if (hasOpenAIDalleApiKey()) {
            const { testOpenAIDalleConnection } = await import('./openaiDalleService');
            results[serviceType] = await testOpenAIDalleConnection();
          } else {
            results[serviceType] = {
              success: false,
              message: 'OpenAI DALL-E API密钥未配置'
            };
          }
          break;
          
        case 'stability':
          if (hasStabilityApiKey()) {
            const { testStabilityConnection } = await import('./stabilityService');
            results[serviceType] = await testStabilityConnection();
          } else {
            results[serviceType] = {
              success: false,
              message: 'Stability AI API密钥未配置'
            };
          }
          break;
          
        case 'builtin_free':
          results[serviceType] = {
            success: true,
            message: '内置免费服务始终可用'
          };
          break;
      }
      
      if (results[serviceType].success) {
        results[serviceType].responseTime = Date.now() - startTime;
      }
      
    } catch (error: any) {
      results[serviceType] = {
        success: false,
        message: `测试失败: ${error.message}`
      };
    }
  }
  
  return results;
}

export default {
  generateIntelligentPhoto,
  getActiveImageGenerationService,
  testAllImageGenerationServices
}; 
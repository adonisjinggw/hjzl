/**
 * 统一文字生成服务
 * 根据用户的API配置自动选择最适合的文字生成服务
 * 支持多种AI服务商：OpenAI、Claude、DeepSeek、SiliconFlow、腾讯混元等
 */

import type { 
  ApiConfig, 
  UserInputs, 
  GeneratedScenario, 
  GeneratedSocialMediaCopy, 
  GeneratedVideoScript, 
  GeneratedRealisticItinerary,
  TextApiProvider
} from '../types';
import { 
  generateBuiltinFreeSocialMediaCopy, 
  generateBuiltinFreeVideoScript, 
  generateBuiltinFreeScenario,
  generateBuiltinFreeItinerary
} from './builtinFreeApiService';
import { 
  generateTravelScenario, 
  generateSocialMediaCopy, 
  generateVideoScript, 
  generateRealisticTravelItinerary 
} from './geminiService';
import { 
  generateTravelScenarioWithHunyuan,
  testTencentHunyuanConnection
} from './tencentHunyuanService';
// 引入增强的文本生成服务
import { 
  generateTextWithProvider,
  getProviderDisplayName,
  isProviderAvailable 
} from './enhancedTextService';
import { trackApiCall } from './apiCallTracker';

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
 * 检查文字生成API是否可用
 */
const hasTextGenerationApiKey = (): boolean => {
  try {
    const config = getCurrentApiConfig();
    if (config?.textGeneration?.enablePaid && 
        config?.textGeneration?.apiKey) {
      return true;
    }
    
    // 检查旧的存储方式
    const oldKey = localStorage.getItem('travel-generator-gemini-api-key');
    return oldKey !== null && oldKey.trim() !== '';
  } catch {
    return false;
  }
};

/**
 * 智能选择文字生成服务
 */
const selectTextGenerationService = (): {
  useAdvanced: boolean;
  provider: string;
  reason: string;
  apiKey?: string;
  config?: any;
} => {
  const config = getCurrentApiConfig();
  const textGenEnabled = config?.textGeneration?.enablePaid || false;
  const textGenProvider = config?.textGeneration?.provider || 'builtin_free';
  const hasApiKey = hasTextGenerationApiKey();
  
  console.log('📝 文字生成服务选择:', {
    文字生成已启用: textGenEnabled,
    文字生成提供商: textGenProvider,
    有API密钥: hasApiKey,
    API密钥: config?.textGeneration?.apiKey ? '***' + config.textGeneration.apiKey.slice(-4) : '无',
    全局偏好付费服务: config?.global?.preferPaidServices || false,
    失败时降级: config?.global?.fallbackToFree !== false
  });

  if (textGenEnabled && hasApiKey && config?.textGeneration?.apiKey) {
    return {
      useAdvanced: true,
      provider: textGenProvider,
      reason: `使用配置的付费文字生成服务: ${getProviderDisplayName(textGenProvider as TextApiProvider)}`,
      apiKey: config.textGeneration.apiKey,
      config: {
        customEndpoint: config.textGeneration.customEndpoint,
        model: config.textGeneration.model,
        ...config.textGeneration.options
      }
    };
  }

  return {
    useAdvanced: false,
    provider: 'builtin_free',
    reason: '使用内置免费文字生成服务（未配置或未启用付费服务）'
  };
};

/**
 * 使用增强文本服务生成旅行场景描述
 */
async function generateScenarioWithEnhancedTextService(
  provider: TextApiProvider,
  apiKey: string,
  inputs: UserInputs,
  config: any = {}
): Promise<GeneratedScenario> {
  const prompt = `请为我生成一个${inputs.travelMode === 'fictional' ? '虚拟幻想' : '真实'}的旅行场景。

参数：
- 主题：${inputs.theme}
- 时长：${inputs.duration}
- 人设：${inputs.persona}
- 自定义目的地：${inputs.customDestination || '随机选择'}

请以JSON格式回复，包含以下字段：
{
  "destinationName": "目的地名称",
  "coreScenes": [
    {
      "name": "场景名称",
      "description": "详细描述",
      "influencerAttribute": "人设特点",
      "interactiveEgg": "互动彩蛋",
      "visualPromptHint": "视觉提示"
    }
  ],
  "plotHook": "故事钩子",
  "fictionalCulture": "文化背景"
}

请确保内容创意新颖且符合${inputs.travelMode}模式特点。`;

  try {
    const trackedGenerateText = trackApiCall(provider, 'text', 
      (prov: TextApiProvider, pmt: string, key: string, cfg: any) => 
        generateTextWithProvider(prov, pmt, key, cfg)
    );
    
    const response = await trackedGenerateText(
      provider,
      prompt,
      apiKey,
      {
        customEndpoint: config.customEndpoint,
        model: config.model,
        temperature: 0.8,
        maxTokens: 4000
      }
    );

    // 尝试解析JSON响应
    try {
      const parsed = JSON.parse(response);
      return {
        destinationName: parsed.destinationName || '神秘之地',
        coreScenes: parsed.coreScenes || [{
          name: '探索开始',
          description: '这是一次充满惊喜的旅程开始',
          influencerAttribute: '探索精神',
          interactiveEgg: '隐藏的秘密等待发现',
          visualPromptHint: '清晨的阳光照耀着未知的道路'
        }],
        plotHook: parsed.plotHook || '一段未知的旅程即将开始...',
        fictionalCulture: parsed.fictionalCulture || '充满神秘色彩的文化背景'
      };
    } catch (parseError) {
      console.warn('JSON解析失败，使用智能文本解析模式:', parseError);
      
      // 智能解析文本内容，提取有用信息
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      
      // 尝试从文本中提取目的地名称
      let extractedDestination = inputs.customDestination || '神秘目的地';
      const destinationMatch = cleanedResponse.match(/destinationName["\s]*:["\s]*([^"]+)/i);
      if (destinationMatch) {
        extractedDestination = destinationMatch[1];
      }
      
      // 尝试提取场景信息
      const scenes = [];
      const sceneMatches = cleanedResponse.match(/name["\s]*:["\s]*([^"]+)[^}]*description["\s]*:["\s]*([^"]+)/gi);
      
      if (sceneMatches && sceneMatches.length > 0) {
        sceneMatches.slice(0, 3).forEach((match, index) => {
          const nameMatch = match.match(/name["\s]*:["\s]*([^"]+)/i);
          const descMatch = match.match(/description["\s]*:["\s]*([^"]+)/i);
          
          scenes.push({
            name: nameMatch ? nameMatch[1] : `精彩场景${index + 1}`,
            description: descMatch ? descMatch[1] : '充满魅力的旅行体验',
            influencerAttribute: `${inputs.persona}的完美拍摄点`,
            interactiveEgg: '等待您来探索的精彩内容',
            visualPromptHint: `${inputs.theme}风格的${nameMatch ? nameMatch[1] : '美丽场景'}`
          });
        });
      }
      
      // 如果没有提取到场景，创建默认场景
      if (scenes.length === 0) {
        scenes.push({
          name: '探索起点',
          description: '开启一段充满惊喜的旅程，每一步都有新的发现',
          influencerAttribute: `${inputs.persona}的理想体验`,
          interactiveEgg: '隐藏的精彩等待您的发现',
          visualPromptHint: `${inputs.theme}风格的旅行开始`
        });
      }
      
      // 尝试提取故事钩子
      let plotHook = '开启一段难忘的旅程';
      const plotMatch = cleanedResponse.match(/plotHook["\s]*:["\s]*([^"]+)/i);
      if (plotMatch) {
        plotHook = plotMatch[1];
      }
      
      // 尝试提取文化背景
      let fictionalCulture = '独特的文化体验';
      const cultureMatch = cleanedResponse.match(/fictionalCulture["\s]*:["\s]*([^"]+)/i);
      if (cultureMatch) {
        fictionalCulture = cultureMatch[1];
      }
      
      return {
        destinationName: extractedDestination,
        coreScenes: scenes,
        plotHook,
        fictionalCulture
      };
    }
  } catch (error) {
    console.error(`使用${getProviderDisplayName(provider)}生成场景失败:`, error);
    throw error;
  }
}

/**
 * 智能生成旅行场景（虚拟模式）
 */
export async function generateIntelligentScenario(inputs: UserInputs): Promise<GeneratedScenario> {
  const selection = selectTextGenerationService();
  console.log(`🎭 ${selection.reason}`);

  if (selection.useAdvanced && selection.apiKey) {
    try {
      const provider = selection.provider as TextApiProvider;
      
      // 检查服务商是否可用
      if (!isProviderAvailable(provider)) {
        throw new Error(`${getProviderDisplayName(provider)}服务暂未实现`);
      }

      // 使用增强的文本生成服务
      console.log(`🚀 调用${getProviderDisplayName(provider)}API生成场景...`);
      return await generateScenarioWithEnhancedTextService(
        provider,
        selection.apiKey,
        inputs,
        selection.config
      );
      
    } catch (error) {
      console.error(`❌ ${selection.provider}场景生成失败:`, error);
      
      const config = getCurrentApiConfig();
      // 只有在明确启用降级的情况下才降级
      if (config?.global?.fallbackToFree !== false) {
        console.log('🔄 降级到内置免费服务...');
        return await generateBuiltinFreeScenario(inputs);
      } else {
        // 如果禁用降级，抛出错误让用户知道
        throw new Error(`${getProviderDisplayName(selection.provider as TextApiProvider)}生成失败：${error.message}。请检查API配置或启用降级服务。`);
      }
    }
  }

  return await generateBuiltinFreeScenario(inputs);
}

/**
 * 智能生成旅行计划（真实模式）
 */
export async function generateIntelligentItinerary(inputs: UserInputs): Promise<GeneratedRealisticItinerary> {
  const selection = selectTextGenerationService();
  console.log(`🗺️ ${selection.reason}`);

  if (selection.useAdvanced && selection.apiKey) {
    try {
      const provider = selection.provider as TextApiProvider;
      
      // 检查服务商是否可用
      if (!isProviderAvailable(provider)) {
        throw new Error(`${getProviderDisplayName(provider)}服务暂未实现`);
      }

      // 使用增强的文本生成服务生成行程
      const prompt = `请为我生成一个详细的真实旅行行程计划。

参数：
- 目的地：${inputs.customDestination || '推荐目的地'}
- 主题：${inputs.theme}
- 时长：${inputs.duration}
- 旅行者类型：${inputs.persona}

请以JSON格式回复，包含以下字段：
{
  "destinationName": "目的地名称",
  "travelTheme": "旅行主题",
  "duration": "行程时长",
  "travelerPersona": "旅行者类型",
  "dailyPlans": [
    {
      "dayNumber": 1,
      "summary": "这一天的总结",
      "activities": [
        {
          "name": "活动名称",
          "description": "详细描述",
          "type": "观光",
          "estimatedDurationHours": 2,
          "addressOrArea": "具体地址或区域"
        }
      ]
    }
  ],
  "overallTravelTips": ["实用建议"],
  "suggestedBudgetLevel": "舒适型"
}

请确保信息真实可靠，包含具体的景点、餐厅、交通建议等。`;

      console.log(`🚀 调用${getProviderDisplayName(provider)}API生成行程...`);
      const response = await generateTextWithProvider(
        provider,
        prompt,
        selection.apiKey,
        {
          customEndpoint: selection.config?.customEndpoint,
          model: selection.config?.model,
          temperature: 0.7,
          maxTokens: 6000
        }
      );

      // 尝试解析JSON响应
      try {
        const parsed = JSON.parse(response);
        return {
          destinationName: parsed.destinationName || inputs.customDestination || '推荐目的地',
          travelTheme: parsed.travelTheme || inputs.theme,
          duration: parsed.duration || inputs.duration,
          travelerPersona: parsed.travelerPersona || inputs.persona,
          dailyPlans: parsed.dailyPlans || [{
            dayNumber: 1,
            summary: '精彩的一天',
            activities: [{
              name: '开始旅程',
              description: '开启美好的旅行体验',
              type: '观光' as const,
              estimatedDurationHours: 3,
              addressOrArea: '市中心'
            }]
          }],
          overallTravelTips: parsed.overallTravelTips || ['注意安全', '准备好相机'],
          suggestedBudgetLevel: parsed.suggestedBudgetLevel || '舒适型'
        };
      } catch (parseError) {
        console.warn('JSON解析失败，使用智能文本解析模式:', parseError);
        
        // 智能解析文本内容，提取有用信息
        const cleanedResponse = response.replace(/```json|```/g, '').trim();
        
        // 尝试从文本中提取目的地名称
        let extractedDestination = inputs.customDestination || '推荐目的地';
        const destinationMatch = cleanedResponse.match(/destinationName["\s]*:["\s]*([^"]+)/i);
        if (destinationMatch) {
          extractedDestination = destinationMatch[1];
        }
        
        // 尝试提取活动信息
        const activities = [];
        const activityMatches = cleanedResponse.match(/name["\s]*:["\s]*([^"]+)[^}]*description["\s]*:["\s]*([^"]+)/gi);
        
        if (activityMatches && activityMatches.length > 0) {
          activityMatches.slice(0, 3).forEach((match, index) => {
            const nameMatch = match.match(/name["\s]*:["\s]*([^"]+)/i);
            const descMatch = match.match(/description["\s]*:["\s]*([^"]+)/i);
            
            activities.push({
              name: nameMatch ? nameMatch[1] : `精彩活动${index + 1}`,
              description: descMatch ? descMatch[1] : '丰富的旅行体验',
              type: '观光' as const,
              estimatedDurationHours: 3,
              addressOrArea: '目的地核心区域',
              notes: '请根据实际情况调整时间安排'
            });
          });
        }
        
        // 如果没有提取到活动，创建默认活动
        if (activities.length === 0) {
          activities.push({
            name: '目的地探索',
            description: '深度体验当地文化和风景，发现独特的魅力',
            type: '观光' as const,
            estimatedDurationHours: 4,
            addressOrArea: '市中心区域',
            notes: '建议提前了解当地情况'
          });
        }
        
        // 尝试提取旅行建议
        const tips = [];
        const tipMatches = cleanedResponse.match(/["']([^"']*建议[^"']*)["']/gi);
        if (tipMatches && tipMatches.length > 0) {
          tipMatches.slice(0, 3).forEach(tip => {
            const cleanTip = tip.replace(/["']/g, '').trim();
            if (cleanTip.length > 5) {
              tips.push(cleanTip);
            }
          });
        }
        
        if (tips.length === 0) {
          tips.push('提前规划行程，预订住宿和交通');
          tips.push('关注当地天气，准备合适的衣物');
          tips.push('了解当地文化习俗，尊重当地传统');
        }
        
        return {
          destinationName: extractedDestination,
          travelTheme: inputs.theme,
          duration: inputs.duration,
          travelerPersona: inputs.persona,
          dailyPlans: [{
            dayNumber: 1,
            summary: `${extractedDestination}精彩一日游`,
            activities: activities
          }],
          overallTravelTips: tips,
          suggestedBudgetLevel: '舒适型' as const
        };
      }
      
    } catch (error) {
      console.error(`❌ ${selection.provider}行程生成失败:`, error);
      
      const config = getCurrentApiConfig();
      if (config?.global?.fallbackToFree !== false) {
        console.log('🔄 降级到内置免费服务...');
        return await generateBuiltinFreeItinerary(inputs);
      } else {
        throw new Error(`${getProviderDisplayName(selection.provider as TextApiProvider)}生成失败：${error.message}。请检查API配置或启用降级服务。`);
      }
    }
  }

  return await generateBuiltinFreeItinerary(inputs);
}

/**
 * 智能生成社交媒体文案
 */
export async function generateIntelligentSocialMediaCopy(
  scenario: GeneratedScenario | null,
  itinerary: GeneratedRealisticItinerary | null,
  userInputs: UserInputs
): Promise<GeneratedSocialMediaCopy> {
  const selection = selectTextGenerationService();
  console.log(`📱 ${selection.reason}`);

  if (selection.useAdvanced) {
    try {
      if (scenario) {
        // 虚拟模式：使用第一个核心场景
        const firstScene = scenario.coreScenes[0];
        return await generateSocialMediaCopy(
          scenario.destinationName,
          firstScene,
          scenario.plotHook,
          userInputs.duration
        );
      } else if (itinerary) {
        // 真实模式：需要使用不同的Gemini函数
        // 由于当前geminiService没有统一的真实模式社交媒体生成函数，
        // 暂时降级到免费服务
        console.log('🔄 真实模式暂时使用免费服务生成社交媒体文案');
        return await generateBuiltinFreeSocialMediaCopy(scenario, itinerary, userInputs);
      } else {
        throw new Error('缺少场景或行程数据');
      }
    } catch (error) {
      console.error(`❌ ${selection.provider}文案生成失败:`, error);
      
      const config = getCurrentApiConfig();
      if (config?.global?.fallbackToFree !== false) {
        console.log('🔄 降级到内置免费服务...');
        return await generateBuiltinFreeSocialMediaCopy(scenario, itinerary, userInputs);
      } else {
        throw error;
      }
    }
  }

  return await generateBuiltinFreeSocialMediaCopy(scenario, itinerary, userInputs);
}

/**
 * 智能生成视频脚本
 * @param scenario 虚拟场景
 * @param itinerary 真实行程
 * @param userInputs 用户输入
 * @param randomSeed 随机因子（可选）
 */
export async function generateIntelligentVideoScript(
  scenario: GeneratedScenario | null,
  itinerary: GeneratedRealisticItinerary | null,
  userInputs: UserInputs,
  randomSeed?: number
): Promise<GeneratedVideoScript> {
  const selection = selectTextGenerationService();
  console.log(`🎬 ${selection.reason}`);

  if (selection.useAdvanced) {
    try {
      if (scenario) {
        // 虚拟模式：使用第一个核心场景
        const firstScene = scenario.coreScenes[0];
        return await generateVideoScript(
          scenario.destinationName,
          firstScene,
          userInputs.duration,
          userInputs.theme,
          userInputs.uploadedImageBase64,
          userInputs.uploadedImageMimeType
        );
      } else {
        // 真实模式：暂时降级到免费服务，因为函数签名不同
        console.log('🔄 真实模式暂时使用免费服务生成视频脚本');
        return await generateBuiltinFreeVideoScript(scenario, itinerary, userInputs, randomSeed);
      }
    } catch (error) {
      console.error(`❌ ${selection.provider}脚本生成失败:`, error);
      const config = getCurrentApiConfig();
      if (config?.global?.fallbackToFree !== false) {
        console.log('🔄 降级到内置免费服务...');
        return await generateBuiltinFreeVideoScript(scenario, itinerary, userInputs, randomSeed);
      } else {
        throw error;
      }
    }
  }
  return await generateBuiltinFreeVideoScript(scenario, itinerary, userInputs, randomSeed);
}

/**
 * 获取当前可用的文字生成服务状态
 */
export function getTextGenerationServiceStatus(): {
  primary: string;
  available: string[];
  hasApiKey: boolean;
  config: {
    enablePaid: boolean;
    provider: string;
    fallbackEnabled: boolean;
  };
} {
  const config = getCurrentApiConfig();
  const hasApiKey = hasTextGenerationApiKey();
  
  const enablePaid = config?.textGeneration?.enablePaid || false;
  const provider = config?.textGeneration?.provider || 'builtin_free';
  
  const available = ['builtin_free']; // 内置服务总是可用
  let primary = 'builtin_free';
  
  if (hasApiKey) {
    available.push(provider);
    if (enablePaid) {
      primary = provider;
    }
  }
  
  return {
    primary,
    available,
    hasApiKey,
    config: {
      enablePaid,
      provider,
      fallbackEnabled: config?.global?.fallbackToFree !== false
    }
  };
}

/**
 * 测试文字生成服务连接
 */
export async function testTextGenerationService(): Promise<{
  success: boolean;
  service: string;
  message: string;
  details?: any;
}> {
  const selection = selectTextGenerationService();
  
  try {
    if (selection.useAdvanced) {
      // 根据不同的服务提供商选择对应的测试函数
      switch (selection.provider) {
        case 'hunyuan':
          return await testTencentHunyuanConnection();
        
        case 'gemini':
        default:
          // 测试Gemini服务
          const result = await generateTravelScenario(
            '测试主题',
            '3天',
            '探险者',
            '测试目的地'
          );
          
          return {
            success: true,
            service: selection.provider,
            message: `${selection.provider}服务连接成功`,
            details: result
          };
      }
    } else {
      return {
        success: true,
        service: 'builtin_free',
        message: '内置免费服务可用',
        details: { provider: 'builtin_free', status: 'active' }
      };
    }
  } catch (error: any) {
    return {
      success: false,
      service: selection.provider,
      message: `${selection.provider}服务测试失败: ${error.message}`
    };
  }
} 
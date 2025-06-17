/**
 * 腾讯混元大模型服务
 * 基于第三方腾讯混元API实现AI对话功能
 * 支持sk-开头的单一API密钥格式
 */

import type { 
  GeneratedScenario, 
  GeneratedSocialMediaCopy, 
  GeneratedVideoScript, 
  GeneratedRealisticItinerary,
  CoreScene 
} from '../types';

/**
 * 腾讯混元API配置接口
 */
interface TencentHunyuanConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

/**
 * 腾讯混元API请求接口
 */
interface HunyuanRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * 腾讯混元API响应接口
 */
interface HunyuanResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 腾讯混元图像生成API请求接口
 */
interface HunyuanImageRequest {
  model: string;
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_images?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
  image?: string; // 用于图生图的base64图片
  strength?: number; // 图生图强度
}

/**
 * 腾讯混元图像生成API响应接口
 */
interface HunyuanImageResponse {
  id: string;
  object: string;
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

/**
 * 从localStorage获取腾讯混元API配置（支持文本和图像生成）
 */
const getTencentHunyuanConfig = (): TencentHunyuanConfig | null => {
  try {
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
      
      // 优先使用图像生成配置
      if (config.imageGeneration?.provider === 'tencent_hunyuan' && 
          config.imageGeneration?.apiKey) {
        return {
          apiKey: config.imageGeneration.apiKey,
          model: config.imageGeneration?.model || 'hunyuan-vision',
          baseUrl: config.imageGeneration?.customEndpoint || 'https://hunyuan.tencentcloudapi.com'
        };
      }
      
      // 如果没有图像生成配置，使用文本生成配置
      if (config.textGeneration?.provider === 'hunyuan' && 
          config.textGeneration?.apiKey) {
        return {
          apiKey: config.textGeneration.apiKey,
          model: config.textGeneration?.model || 'hunyuan-turbo',
          baseUrl: config.textGeneration?.customEndpoint || 'https://hunyuan.tencentcloudapi.com'
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取腾讯混元API配置失败:', error);
    return null;
  }
};

/**
 * 获取腾讯混元图像生成专用配置
 */
const getTencentHunyuanImageConfig = (): TencentHunyuanConfig | null => {
  try {
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
      
      // 优先使用图像生成配置
      if (config.imageGeneration?.provider === 'tencent_hunyuan' && 
          config.imageGeneration?.apiKey) {
        return {
          apiKey: config.imageGeneration.apiKey,
          model: config.imageGeneration?.model || 'hunyuan-vision',
          baseUrl: config.imageGeneration?.customEndpoint || 'https://hunyuan.tencentcloudapi.com'
        };
      }
      
      // 如果没有专门的图像生成配置，使用文本生成配置作为后备
      if (config.textGeneration?.provider === 'hunyuan' && 
          config.textGeneration?.apiKey) {
        return {
          apiKey: config.textGeneration.apiKey,
          model: 'hunyuan-vision', // 强制使用图像模型
          baseUrl: config.textGeneration?.customEndpoint || 'https://hunyuan.tencentcloudapi.com'
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取腾讯混元图像API配置失败:', error);
    return null;
  }
};

/**
 * 调用腾讯混元API
 */
export const callTencentHunyuanAPI = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string = 'hunyuan-turbo'
): Promise<string> => {
  const config = getTencentHunyuanConfig();
  if (!config) {
    throw new Error('腾讯混元API配置未找到，请先配置API密钥');
  }

  if (!config.apiKey) {
    throw new Error('腾讯混元API密钥不能为空');
  }

  const requestBody: HunyuanRequest = {
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 4000,
    stream: false
  };

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'User-Agent': 'travel-generator/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('腾讯混元API响应错误:', response.status, errorText);
      throw new Error(`腾讯混元API调用失败 (${response.status}): ${errorText}`);
    }

    const result: HunyuanResponse = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('腾讯混元API响应格式错误：没有返回选择结果');
    }

    const content = result.choices[0].message.content;
    if (!content) {
      throw new Error('腾讯混元API响应内容为空');
    }

    return content.trim();
  } catch (error) {
    console.error('腾讯混元API调用失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('腾讯混元API调用过程中发生未知错误');
  }
};

/**
 * 生成旅行场景（虚拟模式）
 */
export async function generateTravelScenarioWithHunyuan(
  theme: string,
  duration: string,
  persona: string,
  customDestination?: string
): Promise<GeneratedScenario> {
  const messages = [
    {
      role: 'system' as const,
      content: `你是一位专业的幻想旅行策划师，擅长创造神奇而引人入胜的虚拟旅行体验。请根据用户的需求生成一个虚拟的旅行场景，包含富有想象力的目的地和体验。

请严格按照以下JSON格式返回，不要添加任何额外的文字说明：

{
  "destinationName": "虚拟目的地名称",
  "coreScenes": [
    {
      "name": "场景名称",
      "description": "详细的场景描述",
      "influencerAttribute": "适合的网红特质",
      "interactiveEgg": "互动彩蛋内容",
      "visualPromptHint": "视觉提示词"
    }
  ],
  "plotHook": "引人入胜的故事钩子",
  "fictionalCulture": "虚构文化背景描述",
  "worldviewHint": "世界观提示"
}`
    },
    {
      role: 'user' as const,
      content: `请为我生成一个${duration}的${theme}主题虚拟旅行场景。
旅行者画像：${persona}
${customDestination ? `希望包含元素：${customDestination}` : ''}

要求：
1. 创造一个完全虚构但引人入胜的目的地
2. 设计3-5个核心场景，每个场景都要有独特的体验
3. 融入幻想元素，但要保持一定的真实感
4. 考虑到旅行者的个性特点来设计体验
5. 所有内容必须是中文`
    }
  ];

  try {
    const config = getTencentHunyuanConfig();
    const model = config?.model || 'hunyuan-turbo';
    
    const response = await callTencentHunyuanAPI(messages, model);
    
    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('腾讯混元返回格式不正确，无法解析JSON');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // 验证响应格式
    if (!parsedResponse.destinationName || !parsedResponse.coreScenes) {
      throw new Error('腾讯混元返回数据结构不完整');
    }

    return {
      destinationName: parsedResponse.destinationName,
      coreScenes: parsedResponse.coreScenes,
      plotHook: parsedResponse.plotHook || '',
      fictionalCulture: parsedResponse.fictionalCulture || '',
      worldviewHint: parsedResponse.worldviewHint || ''
    };

  } catch (error) {
    console.error('腾讯混元场景生成失败:', error);
    throw new Error(`腾讯混元场景生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 生成社交媒体文案
 */
export async function generateSocialMediaCopyWithHunyuan(
  destinationName: string,
  coreScene: CoreScene,
  plotHook: string,
  duration: string
): Promise<GeneratedSocialMediaCopy> {
  const messages = [
    {
      role: 'system' as const,
      content: `你是一位专业的社交媒体文案创作者，擅长创作吸引人的旅行分享内容。请根据提供的旅行信息生成一段精彩的社交媒体文案。

文案要求：
- 150-300字
- 语言生动有趣，富有感染力
- 包含适当的情感表达
- 适合在微博、小红书等平台分享
- 加入一些相关的emoji表情

请直接返回文案内容，不需要JSON格式。`
    },
    {
      role: 'user' as const,
      content: `请为我的${duration}${destinationName}旅行生成社交媒体文案。

核心场景：${coreScene.name}
场景描述：${coreScene.description}
故事亮点：${plotHook}
网红特质：${coreScene.influencerAttribute}

请创作一段适合分享的精彩文案。`
    }
  ];

  try {
    const config = getTencentHunyuanConfig();
    const model = config?.model || 'hunyuan-turbo';
    
    const response = await callTencentHunyuanAPI(messages, model);
    
    return {
      text: response.trim()
    };

  } catch (error) {
    console.error('腾讯混元文案生成失败:', error);
    throw new Error(`腾讯混元文案生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 生成视频脚本
 */
export async function generateVideoScriptWithHunyuan(
  destinationName: string,
  coreScene: CoreScene,
  duration: string,
  theme: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<GeneratedVideoScript> {
  const messages = [
    {
      role: 'system' as const,
      content: `你是一位专业的短视频脚本创作者，擅长创作引人入胜的旅行vlog脚本。请根据提供的旅行场景生成一个完整的视频脚本。

请严格按照以下JSON格式返回：

{
  "titleSuggestion": "视频标题建议",
  "scenes": [
    {
      "shot": "镜头描述",
      "duration_seconds": 时长秒数,
      "audio_visual_notes": "音视觉备注"
    }
  ],
  "dynamicTags": ["标签1", "标签2", "标签3"],
  "fakeBulletComments": [
    {
      "time_cue": "时间点",
      "comment": "弹幕内容"
    }
  ],
  "fakeDataMetrics": "数据指标描述"
}`
    },
    {
      role: 'user' as const,
      content: `请为我的${destinationName}旅行生成一个${duration}的${theme}主题视频脚本。

核心场景：${coreScene.name}
场景描述：${coreScene.description}
视觉提示：${coreScene.visualPromptHint}
互动元素：${coreScene.interactiveEgg}

要求：
1. 总时长控制在60-90秒
2. 包含5-8个镜头切换
3. 适合竖屏观看
4. 有吸引人的开头和结尾
5. 所有内容必须是中文`
    }
  ];

  try {
    const config = getTencentHunyuanConfig();
    const model = config?.model || 'hunyuan-turbo';
    
    const response = await callTencentHunyuanAPI(messages, model);
    
    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('腾讯混元返回格式不正确，无法解析JSON');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    return {
      titleSuggestion: parsedResponse.titleSuggestion || '',
      scenes: parsedResponse.scenes || [],
      dynamicTags: parsedResponse.dynamicTags || [],
      fakeBulletComments: parsedResponse.fakeBulletComments || [],
      fakeDataMetrics: parsedResponse.fakeDataMetrics || ''
    };

  } catch (error) {
    console.error('腾讯混元视频脚本生成失败:', error);
    throw new Error(`腾讯混元视频脚本生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 生成真实旅行计划
 */
export async function generateRealisticTravelItineraryWithHunyuan(
  theme: string,
  duration: string,
  persona: string,
  customDestination?: string
): Promise<GeneratedRealisticItinerary> {
  const messages = [
    {
      role: 'user' as const,
      content: `请为我制定一个${duration}的${theme}主题真实旅行计划。
旅行者画像：${persona}
${customDestination ? `目的地偏好：${customDestination}` : ''}

要求：
1. 推荐真实存在的目的地
2. 制定详细的每日行程
3. 包含交通、住宿、餐饮建议
4. 考虑预算和实用性
5. 所有内容必须是中文`
    }
  ];

  try {
    const config = getTencentHunyuanConfig();
    const model = config?.model || 'hunyuan-turbo';
    
    const response = await callTencentHunyuanAPI(messages, model);
    
    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('腾讯混元返回格式不正确，无法解析JSON');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    return {
      destinationName: parsedResponse.destinationName || '',
      travelTheme: parsedResponse.travelTheme || theme,
      duration: parsedResponse.duration || duration,
      travelerPersona: parsedResponse.travelerPersona || persona,
      dailyPlans: parsedResponse.dailyPlans || [],
      overallTravelTips: parsedResponse.overallTravelTips || [],
      suggestedBudgetLevel: parsedResponse.suggestedBudgetLevel || '舒适型'
    };

  } catch (error) {
    console.error('腾讯混元行程生成失败:', error);
    throw new Error(`腾讯混元行程生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 测试腾讯混元API连接
 */
export async function testTencentHunyuanConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const config = getTencentHunyuanConfig();
    if (!config) {
      return {
        success: false,
        message: '腾讯混元API配置未找到，请先配置API密钥'
      };
    }

    if (!config.apiKey) {
      return {
        success: false,
        message: 'API密钥不能为空'
      };
    }

    // 发送测试请求
    const testMessages = [
      {
        role: 'user' as const,
        content: '你好，请回复"连接测试成功"来确认API工作正常。'
      }
    ];

    const response = await callTencentHunyuanAPI(testMessages, config.model);
    
    return {
      success: true,
      message: `腾讯混元API连接成功 (${config.model})`,
      details: {
        model: config.model,
        baseUrl: config.baseUrl,
        responseLength: response.length
      }
    };

  } catch (error) {
    console.error('腾讯混元API测试失败:', error);
    return {
      success: false,
      message: `腾讯混元API连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: { error: error instanceof Error ? error.message : '未知错误' }
    };
  }
}

/**
 * 调用腾讯混元图像生成API
 */
export const callTencentHunyuanImageAPI = async (
  prompt: string,
  options: {
    width?: number;
    height?: number;
    model?: string;
    negativePrompt?: string;
    guidanceScale?: number;
    steps?: number;
    seed?: number;
    inputImage?: string;
    strength?: number;
  } = {}
): Promise<string> => {
  const config = getTencentHunyuanImageConfig();
  if (!config) {
    throw new Error('腾讯混元图像生成API配置未找到，请先配置API密钥');
  }

  if (!config.apiKey) {
    throw new Error('腾讯混元API密钥不能为空');
  }

  // 使用OpenAI兼容的图像生成API格式
  const requestBody = {
    model: options.model || config.model || 'hunyuan-vision',
    prompt: prompt,
    n: 1,
    size: `${options.width || 1024}x${options.height || 1024}`,
    response_format: 'b64_json'
  };

  try {
    // 使用OpenAI兼容的图像生成端点
    const endpoint = '/images/generations';
    
    // 确保baseUrl正确处理
    let baseUrl = config.baseUrl || 'https://api.hunyuan.cloud.tencent.com/v1';
    if (!baseUrl.startsWith('http')) {
      baseUrl = 'https://' + baseUrl;
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    if (!baseUrl.includes('/v1')) {
      baseUrl = baseUrl + '/v1';
    }
    
    const apiUrl = `${baseUrl}${endpoint}`;
    
    console.log('🌈 调用腾讯混元图像API:', apiUrl);
    console.log('🔧 请求参数:', requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'User-Agent': 'travel-generator/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('腾讯混元图像API响应错误:', response.status, errorText);
      
      // 如果是认证错误，提供更友好的错误信息
      if (response.status === 401) {
        throw new Error('API密钥无效，请检查腾讯混元API密钥是否正确');
      } else if (response.status === 403) {
        throw new Error('API访问被拒绝，请检查API密钥权限或账户余额');
      } else if (response.status === 429) {
        throw new Error('API调用频率超限，请稍后再试');
      } else if (response.status === 404) {
        throw new Error('API端点不存在，腾讯混元可能不支持图像生成功能');
      } else {
        throw new Error(`腾讯混元图像API调用失败 (${response.status}): ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('✅ API响应成功:', result);
    
    if (!result.data || result.data.length === 0) {
      throw new Error('腾讯混元图像API响应格式错误：没有返回图片数据');
    }

    const imageData = result.data[0];
    if (imageData.url) {
      // 如果返回URL，需要下载并转换为base64
      const imageResponse = await fetch(imageData.url);
      const imageBlob = await imageResponse.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imageBlob);
      });
      return base64;
    } else if (imageData.b64_json) {
      // 如果直接返回base64
      return `data:image/png;base64,${imageData.b64_json}`;
    } else {
      throw new Error('腾讯混元图像API响应中没有找到图片数据');
    }

  } catch (error) {
    console.error('腾讯混元图像API调用失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('腾讯混元图像API调用过程中发生未知错误');
  }
};

/**
 * 生成腾讯混元图片 - 主要导出接口
 */
export async function generateTencentHunyuanPhoto(
  prompt: string,
  filterStyle: string = '自然色彩',
  isRealistic: boolean = false,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<string> {
  console.log('🌈 开始腾讯混元AI图片生成...');
  
  // 构建增强提示词
  let enhancedPrompt = prompt;
  
  if (filterStyle && filterStyle !== "无滤镜 (真实色彩)") {
    enhancedPrompt += `, ${filterStyle}风格`;
  }
  
  if (isRealistic) {
    enhancedPrompt += ", photorealistic, high quality photography, detailed, professional";
  } else {
    enhancedPrompt += ", artistic style, creative composition, fantasy art";
  }

  // 添加无文字限制
  enhancedPrompt += ", no text, no words, no letters, no captions, clean image";

  const options = {
    width: 1024,
    height: 1024,
    guidanceScale: 7.5,
    steps: 20,
    negativePrompt: 'low quality, blurry, text, watermark, logo, signature, letters, words'
  };

  // 如果有上传的图片，使用图生图模式
  if (uploadedImageBase64) {
    console.log('🖼️ 使用腾讯混元图生图模式');
    // 提取base64数据部分
    const base64Data = uploadedImageBase64.includes(',') 
      ? uploadedImageBase64.split(',')[1] 
      : uploadedImageBase64;
    
    return await callTencentHunyuanImageAPI(enhancedPrompt, {
      ...options,
      inputImage: base64Data,
      strength: 0.75
    });
  } else {
    console.log('🎨 使用腾讯混元文生图模式');
    return await callTencentHunyuanImageAPI(enhancedPrompt, options);
  }
}

/**
 * 测试腾讯混元图像生成API连接
 */
export async function testTencentHunyuanImageConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const config = getTencentHunyuanImageConfig();
    if (!config) {
      return {
        success: false,
        message: '腾讯混元图像生成API配置未找到，请在图像生成选项卡中配置API密钥'
      };
    }

    if (!config.apiKey) {
      return {
        success: false,
        message: 'API密钥不能为空'
      };
    }

    console.log('🧪 测试腾讯混元图像生成API连接...');
    console.log('🔧 配置信息:', {
      baseUrl: config.baseUrl,
      model: config.model,
      hasApiKey: !!config.apiKey
    });
    
    // 使用OpenAI兼容的图像生成API格式进行测试
    const testPrompt = 'a simple test image';
    const endpoint = '/images/generations';
    
    // 确保baseUrl正确处理
    let baseUrl = config.baseUrl || 'https://api.hunyuan.cloud.tencent.com/v1';
    
    // 检查是否是示例端点
    if (baseUrl.includes('api.example.com')) {
      return {
        success: false,
        message: '请配置正确的API端点，当前为示例地址',
        details: {
          suggestion: '根据官方文档，腾讯混元使用腾讯云标准API格式，建议使用其他图像生成服务'
        }
      };
    }

    // 检查是否使用了腾讯云标准API域名（文生文和文生图分离）
    if (baseUrl.includes('hunyuan.tencentcloudapi.com')) {
      return {
        success: false,
        message: '检测到腾讯云原生API域名，请确认您使用的是正确的API类型',
        details: {
          suggestion: '文生图请使用：https://api.hunyuan.cloud.tencent.com/v1；文生文请使用对应的专用端点'
        }
      };
    }
    
    if (!baseUrl.startsWith('http')) {
      baseUrl = 'https://' + baseUrl;
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    if (!baseUrl.includes('/v1')) {
      baseUrl = baseUrl + '/v1';
    }
    
    const apiUrl = `${baseUrl}${endpoint}`;
    
    const testRequestBody = {
      model: config.model || 'hunyuan-vision',
      prompt: testPrompt,
      n: 1,
      size: '512x512',
      response_format: 'b64_json'
    };

    console.log('🌐 测试API端点:', apiUrl);
    console.log('📝 测试请求体:', testRequestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'User-Agent': 'travel-generator/1.0'
      },
      body: JSON.stringify(testRequestBody)
    });

    console.log('📡 API响应状态:', response.status);

    if (response.ok) {
      // API调用成功
      return {
        success: true,
        message: `腾讯混元图像生成API连接成功 (${config.model})`,
        details: {
          status: response.status,
          endpoint: apiUrl,
          model: config.model
        }
      };
    } else {
      const errorText = await response.text();
      console.error('❌ API测试失败:', response.status, errorText);
      
      let errorMessage = '';
      let suggestion = '';
      
      if (response.status === 401) {
        errorMessage = '腾讯混元API密钥无效';
        suggestion = '请检查API密钥格式（通常以sk-开头）和有效性';
      } else if (response.status === 403) {
        errorMessage = '腾讯混元API访问被拒绝';
        suggestion = '请检查API密钥权限、账户余额或服务开通状态';
      } else if (response.status === 404) {
        errorMessage = '腾讯混元API端点不存在';
        suggestion = '请确认使用正确的端点: https://api.hunyuan.cloud.tencent.com/v1';
      } else if (response.status === 429) {
        errorMessage = '腾讯混元API调用频率超限';
        suggestion = '请稍后再试，或检查API配额设置';
      } else if (response.status === 400) {
        errorMessage = '腾讯混元API请求参数错误';
        suggestion = '可能该服务商不支持图像生成或模型配置有误';
      } else if (response.status >= 500) {
        errorMessage = '腾讯混元服务器错误';
        suggestion = '服务商服务暂时不可用，请稍后重试';
      } else {
        errorMessage = `腾讯混元API连接失败 (${response.status})`;
        suggestion = '请检查网络连接和API配置';
      }
      
      return {
        success: false,
        message: errorMessage,
        details: {
          status: response.status,
          error: errorText,
          endpoint: apiUrl,
          suggestion: suggestion
        }
      };
    }

  } catch (error) {
    console.error('❌ 腾讯混元图像API测试失败:', error);
    
    let errorMessage = '';
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = '网络连接失败，请检查网络或API端点配置';
    } else if (error instanceof Error) {
      errorMessage = `连接测试失败: ${error.message}`;
    } else {
      errorMessage = '连接测试失败: 未知错误';
    }
    
    return {
      success: false,
      message: errorMessage,
      details: error
    };
  }
}

/**
 * 检查是否配置了腾讯混元图像生成API
 */
export function hasTencentHunyuanImageApiKey(): boolean {
  const config = getTencentHunyuanImageConfig();
  return !!(config && config.apiKey);
} 
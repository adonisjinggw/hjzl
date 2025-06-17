/**
 * Stability AI Service
 * Stability AI 图像生成服务集成
 * 官方文档: https://platform.stability.ai/docs/api-reference
 */

/**
 * Stability AI 图像生成服务
 * 支持 Stable Diffusion 系列模型
 */

/**
 * Stability AI配置接口
 */
interface StabilityConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

/**
 * 从localStorage获取Stability AI配置
 */
const getStabilityConfig = (): StabilityConfig | null => {
  try {
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config = JSON.parse(configJson);
      
      if (config.imageGeneration?.provider === 'stability' && 
          config.imageGeneration?.apiKey) {
        return {
          apiKey: config.imageGeneration.apiKey,
          model: config.imageGeneration?.model || 'stable-diffusion-xl-1024-v1-0',
          baseUrl: config.imageGeneration?.customEndpoint || 'https://api.stability.ai'
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取Stability AI配置失败:', error);
    return null;
  }
};

interface StabilityTextToImageRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  cfg_scale?: number;
  sampler?: string;
  style_preset?: string;
  output_format?: 'png' | 'jpeg' | 'webp';
}

interface StabilityImageResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finish_reason: string;
  }>;
}

/**
 * Stability AI 图像生成服务类
 */
export class StabilityService {
  private config: StabilityConfig;
  private baseURL: string;

  constructor(config: StabilityConfig) {
    this.config = config;
    this.baseURL = config.baseUrl || 'https://api.stability.ai';
  }

  /**
   * 文本转图像生成
   */
  async textToImage(
    prompt: string,
    options: Partial<StabilityTextToImageRequest> = {}
  ): Promise<string> {
    try {
      console.log('🎨 Stability AI图像生成开始:', {
        model: this.config.model || 'stable-diffusion-v1-6',
        prompt: prompt.substring(0, 100) + '...'
      });

      // 构建请求体
      const requestBody: StabilityTextToImageRequest = {
        prompt,
        negative_prompt: options.negative_prompt || 'blurry, bad quality, distorted, deformed',
        width: options.width || 1024,
        height: options.height || 1024,
        steps: options.steps || 30,
        cfg_scale: options.cfg_scale || 7,
        sampler: options.sampler || 'K_DPM_2_ANCESTRAL',
        style_preset: options.style_preset,
        output_format: options.output_format || 'png',
        ...options
      };

      const model = this.config.model || 'stable-diffusion-v1-6';
      const response = await fetch(`${this.baseURL}/v1/generation/${model}/text-to-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stability AI API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: StabilityImageResponse = await response.json();
      
      if (!data.artifacts || data.artifacts.length === 0) {
        throw new Error('Stability AI API返回数据格式错误');
      }

      const imageBase64 = data.artifacts[0].base64;
      console.log('✅ Stability AI图像生成成功:', {
        seed: data.artifacts[0].seed,
        finish_reason: data.artifacts[0].finish_reason,
        imageSize: Math.round(imageBase64.length / 1024) + 'KB'
      });

      return `data:image/${requestBody.output_format};base64,${imageBase64}`;

    } catch (error: any) {
      console.error('❌ Stability AI图像生成失败:', error);
      throw new Error(`Stability AI图像生成失败: ${error.message}`);
    }
  }

  /**
   * 生成旅行场景图片
   */
  async generateTravelImage(
    prompt: string,
    style: string = '自然色彩'
  ): Promise<string> {
    // 根据风格调整提示词和样式预设
    let enhancedPrompt = prompt;
    let stylePreset: string | undefined;
    let negativePrompt = 'blurry, bad quality, distorted, deformed, ugly, watermark, text, words, signature';

    switch (style) {
      case '鲜艳色彩':
        enhancedPrompt += ', vibrant colors, saturated, high contrast';
        stylePreset = 'enhance';
        break;
      case '柔和色彩':
        enhancedPrompt += ', soft colors, gentle lighting, pastel tones';
        stylePreset = 'photographic';
        break;
      case '黑白经典':
        enhancedPrompt += ', black and white, monochrome, classic photography';
        stylePreset = 'analog-film';
        break;
      case '复古胶片':
        enhancedPrompt += ', vintage film, retro style, film grain';
        stylePreset = 'analog-film';
        break;
      case '艺术风格':
        enhancedPrompt += ', artistic style, creative composition, aesthetic';
        stylePreset = 'digital-art';
        break;
      default:
        enhancedPrompt += ', natural colors, realistic lighting, high quality';
        stylePreset = 'photographic';
    }

    // 添加高质量关键词
    enhancedPrompt += ', ultra detailed, 8k resolution, professional photography, beautiful composition';

    return await this.textToImage(enhancedPrompt, {
      negative_prompt: negativePrompt,
      style_preset: stylePreset,
      width: 1024,
      height: 1024,
      steps: 30,
      cfg_scale: 7
    });
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: string }> {
    try {
      const testImage = await this.textToImage('a beautiful sunset landscape', {
        width: 512,
        height: 512,
        steps: 20
      });

      return {
        success: true,
        message: 'Stability AI API连接成功',
        details: `生成了测试图片 (${Math.round(testImage.length / 1024)}KB)`
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Stability AI API连接失败',
        details: error.message
      };
    }
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[] {
    return [
      'sd3.5-large',
      'sd3.5-medium',
      'stable-diffusion-xl-1024-v1-0',
      'stable-diffusion-v1-6'
    ];
  }

  /**
   * 获取可用样式预设
   */
  getAvailableStylePresets(): string[] {
    return [
      'enhance',
      'anime',
      'photographic', 
      'digital-art',
      'comic-book',
      'fantasy-art',
      'line-art',
      'analog-film',
      'neon-punk',
      'isometric',
      'low-poly',
      'origami',
      'modeling-compound',
      'cinematic',
      'pixel-art'
    ];
  }
}

/**
 * 全局Stability服务实例
 */
let stabilityService: StabilityService | null = null;

/**
 * 获取Stability服务实例
 */
export function getStabilityService(): StabilityService | null {
  return stabilityService;
}

/**
 * 初始化Stability服务
 */
export function initializeStabilityService(config: StabilityConfig): StabilityService {
  stabilityService = new StabilityService(config);
  return stabilityService;
}

/**
 * 使用Stability AI生成图片（统一接口）
 */
export async function generateImageWithStability(
  prompt: string,
  apiKey: string,
  options: {
    baseURL?: string;
    model?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg_scale?: number;
    style_preset?: string;
    samples?: number;
  } = {}
): Promise<string> {
  const engineId = options.model || 'stable-diffusion-xl-1024-v1-0';
  
  const requestBody = {
    text_prompts: [
      {
        text: prompt,
        weight: 1
      }
    ],
    cfg_scale: options.cfg_scale || 7,
    height: options.height || 1024,
    width: options.width || 1024,
    samples: options.samples || 1,
    steps: options.steps || 30,
    style_preset: options.style_preset
  };

  try {
    const response = await fetch(`${options.baseURL || 'https://api.stability.ai'}/v1/generation/${engineId}/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'User-Agent': 'travel-generator/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability AI API调用失败 (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.artifacts || result.artifacts.length === 0) {
      throw new Error('Stability AI API响应格式错误');
    }

    // 返回base64格式的图像数据
    return `data:image/png;base64,${result.artifacts[0].base64}`;
  } catch (error) {
    console.error('Stability AI API调用失败:', error);
    throw error;
  }
}

/**
 * 测试Stability AI连接
 */
export async function testStabilityConnection(
  apiKey?: string,
  options: {
    customEndpoint?: string;
  } = {}
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const testApiKey = apiKey || getStabilityConfig()?.apiKey;
    if (!testApiKey) {
      return {
        success: false,
        message: 'Stability AI API密钥未配置',
        details: '请先配置有效的Stability AI API密钥'
      };
    }

    // 测试API连接（获取账户信息）
    const response = await fetch(`${options.customEndpoint || 'https://api.stability.ai'}/v1/user/account`, {
      headers: {
        'Authorization': `Bearer ${testApiKey}`,
        'Accept': 'application/json',
        'User-Agent': 'travel-generator/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Stability AI API连接失败 (${response.status})`,
        details: errorText
      };
    }

    const accountInfo = await response.json();
    
    return {
      success: true,
      message: 'Stability AI API连接成功',
      details: {
        credits: accountInfo.credits || 0,
        id: accountInfo.id || 'unknown'
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Stability AI API连接失败',
      details: error.message
    };
  }
}

/**
 * 检查是否有Stability AI API密钥
 */
export function hasStabilityApiKey(): boolean {
  return !!getStabilityConfig()?.apiKey;
}
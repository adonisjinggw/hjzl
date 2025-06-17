/**
 * Stability AI Service
 * Stability AI 图像生成服务集成
 * 官方文档: https://platform.stability.ai/docs/api-reference
 */

interface StabilityConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

/**
 * 使用Stability AI生成图片（统一接口）
 */
export async function generateImageWithStability(
  prompt: string, 
  apiKey: string,
  options: {
    model?: string;
    style?: string;
    width?: number;
    height?: number;
  } = {}
): Promise<string> {
  try {
    console.log('🎨 Stability AI图像生成开始:', {
      prompt: prompt.substring(0, 100) + '...'
    });

    // 增强提示词
    let enhancedPrompt = prompt;
    const style = options.style || '自然色彩';
    
    switch (style) {
      case '鲜艳色彩':
        enhancedPrompt += ', vibrant colors, saturated, high contrast';
        break;
      case '柔和色彩':
        enhancedPrompt += ', soft colors, gentle lighting, pastel tones';
        break;
      case '艺术风格':
        enhancedPrompt += ', artistic style, creative composition, aesthetic';
        break;
      default:
        enhancedPrompt += ', natural colors, realistic lighting, high quality';
    }

    enhancedPrompt += ', ultra detailed, 8k resolution, professional photography';

    // 暂时返回模拟数据，实际使用时需要真实API
    console.log('⚠️ Stability AI当前为模拟模式，返回模拟图片');
    
    // 生成SVG格式的模拟图片
    const svgContent = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="50%" y="45%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">
          Stability AI
        </text>
        <text x="50%" y="55%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" opacity="0.8">
          ${prompt.substring(0, 30)}...
        </text>
        <text x="50%" y="65%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" opacity="0.6">
          模拟图片 - 请配置真实API
        </text>
      </svg>
    `;
    
    const base64Svg = btoa(unescape(encodeURIComponent(svgContent)));
    return `data:image/svg+xml;base64,${base64Svg}`;

  } catch (error: any) {
    console.error('❌ Stability AI图像生成失败:', error);
    throw new Error(`Stability AI图像生成失败: ${error.message}`);
  }
}

/**
 * 测试Stability AI API连接
 */
export async function testStabilityConnection(
  apiKey: string
): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    // 模拟测试
    if (!apiKey) {
      return {
        success: false,
        message: 'API密钥未设置',
        details: '请设置有效的Stability AI API密钥'
      };
    }

    return {
      success: true,
      message: 'Stability AI配置正常（模拟模式）',
      details: '当前为模拟模式，请联系开发者配置真实API'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Stability AI连接失败',
      details: error.message
    };
  }
} 
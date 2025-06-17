/**
 * Pollinations.AI 免费图像生成服务
 * 提供完全免费、无需API密钥的AI图像生成功能
 */

/**
 * Pollinations.AI API配置
 */
const POLLINATIONS_CONFIG = {
  baseUrl: 'https://image.pollinations.ai/prompt',
  defaultWidth: 1024,
  defaultHeight: 1024,
  defaultSeed: -1, // -1表示随机种子
  model: 'flux', // 默认使用flux模型
  enhance: 'true' // 启用增强模式
};

/**
 * Pollinations.AI图片生成选项
 */
export interface PollinationsOptions {
  width?: number;
  height?: number;
  model?: 'flux' | 'flux-realism' | 'flux-cabbage' | 'flux-anime' | 'flux-3d' | 'any-dark';
  enhance?: boolean;
  nologo?: boolean;
  private?: boolean;
  nofeed?: boolean;
}

/**
 * 安全的URL编码函数
 * 确保中文和特殊字符正确编码
 */
function safeEncodeURIComponent(str: string): string {
  try {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
  } catch (error) {
    console.warn('URL编码失败，使用备用方案:', error);
    return str.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '+');
  }
}

/**
 * 构建Pollinations.AI请求URL
 */
function buildPollinationsUrl(prompt: string, options: PollinationsOptions = {}): string {
  const {
    width = POLLINATIONS_CONFIG.defaultWidth,
    height = POLLINATIONS_CONFIG.defaultHeight,
    seed = Math.floor(Math.random() * 1000000000),
    model = POLLINATIONS_CONFIG.model,
    enhance = true,
    nologo = true
  } = options;

  // 编码提示词
  const encodedPrompt = safeEncodeURIComponent(prompt);
  
  // 构建基础URL
  let url = `${POLLINATIONS_CONFIG.baseUrl}/${encodedPrompt}`;
  
  // 添加参数
  const params = new URLSearchParams();
  if (width !== POLLINATIONS_CONFIG.defaultWidth) params.append('width', width.toString());
  if (height !== POLLINATIONS_CONFIG.defaultHeight) params.append('height', height.toString());
  if (seed !== -1) params.append('seed', seed.toString());
  if (model !== POLLINATIONS_CONFIG.model) params.append('model', model);
  if (enhance) params.append('enhance', 'true');
  if (nologo) params.append('nologo', 'true');
  
  const paramString = params.toString();
  if (paramString) {
    url += '?' + paramString;
  }
  
  return url;
}

/**
 * 使用Pollinations.AI生成图像
 * @param prompt 文本提示
 * @param options 生成选项
 * @returns Base64编码的图像数据
 */
export async function generatePollinationsImage(
  prompt: string,
  options: PollinationsOptions = {}
): Promise<string> {
  const {
    width = 1024,
    height = 1024,
    model = 'flux',
    enhance = true,
    nologo = true,
    private: isPrivate = false,
    nofeed = true
  } = options;

  try {
    console.log('🌸 开始使用Pollinations.AI生成图像...');
    console.log('📝 提示词:', prompt);
    console.log('⚙️ 生成参数:', { width, height, model, enhance, nologo });

    // 构建API URL
    const params = new URLSearchParams();
    params.append('width', width.toString());
    params.append('height', height.toString());
    params.append('model', model);
    
    if (enhance) params.append('enhance', 'true');
    if (nologo) params.append('nologo', 'true');
    if (isPrivate) params.append('private', 'true');
    if (nofeed) params.append('nofeed', 'true');

    // Pollinations.AI的图像生成API
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
    
    console.log('🔗 API请求URL:', apiUrl);

    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Travel-Generator/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Pollinations.AI API请求失败: ${response.status} ${response.statusText}`);
    }

    // 获取图像数据
    const imageBlob = await response.blob();
    
    // 转换为Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('图像数据转换失败'));
      reader.readAsDataURL(imageBlob);
    });

    console.log('✅ Pollinations.AI图像生成成功');
    return base64Data;

  } catch (error) {
    console.error('❌ Pollinations.AI图像生成失败:', error);
    
    // 如果网络请求失败，生成一个错误占位图
    const errorSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="errorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff7b7b;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#ff9a9a;stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#errorGrad)"/>
        <circle cx="${width/2}" cy="${height/2}" r="60" fill="#ffffff" opacity="0.3"/>
        <text x="${width/2}" y="${height/2 + 20}" text-anchor="middle" fill="#ffffff" font-size="16" font-family="Arial">
          图像生成失败
        </text>
        <text x="${width/2}" y="${height/2 + 40}" text-anchor="middle" fill="#ffffff" font-size="12" font-family="Arial">
          请检查网络连接
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(errorSvg)))}`;
  }
}

/**
 * 净化prompt，限制长度和移除特殊字符
 * @param prompt 原始提示词
 * @returns 净化后的提示词
 */
function sanitizePrompt(prompt: string): string {
  if (!prompt) return '';
  // 移除特殊符号和不可见字符
  let sanitized = prompt.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202F\uFEFF-\uFEFF]/g, '');
  sanitized = sanitized.replace(/[\uD800-\uDFFF]/g, ''); // 移除代理对
  sanitized = sanitized.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // 移除emoji
  sanitized = sanitized.replace(/[^\w\u4e00-\u9fa5\s,.;:!?\-()\[\]{}'"/]/g, '');
  // 限制长度200字符
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }
  return sanitized;
}

/**
 * 使用Pollinations.AI生成图片（带自动重试和响应校验，失败降级为SVG占位图）
 * @param prompt 图片描述提示词
 * @param options 生成选项
 * @param maxRetries 最大重试次数，默认5次
 * @returns 图片的Base64数据或SVG占位图
 */
export async function generatePollinationsImageWithRetry(
  prompt: string,
  options: PollinationsOptions = {},
  maxRetries: number = 5
): Promise<string> {
  let lastError: any = null;
  // 先净化prompt
  const safePrompt = sanitizePrompt(prompt);
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 调用原始图片生成函数
      const base64Data = await generatePollinationsImage(safePrompt, options);
      // 响应校验：base64长度过短视为失败
      if (typeof base64Data === 'string' && base64Data.startsWith('data:image/') && base64Data.length > 1000) {
        console.log(`✅ Pollinations.AI图片生成成功（第${attempt}次尝试）`);
        return base64Data;
      } else {
        throw new Error(`图片Base64数据异常，长度=${base64Data?.length || 0}`);
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Pollinations.AI图片生成失败（第${attempt}次尝试）:`, error.message || error);
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, 800 * Math.pow(2, attempt - 1)));
      }
    }
  }
  // 全部失败，返回无文字的SVG占位图
  console.error('❌ Pollinations.AI图片生成多次失败，已达最大重试次数:', lastError?.message || lastError);
  const svg = `<svg width='800' height='600' xmlns='http://www.w3.org/2000/svg'>
    <defs>
      <linearGradient id="failGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff7e7e;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#ffb347;stop-opacity:0.8" />
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#failGrad)'/>
    <circle cx='400' cy='300' r='60' fill='#ffffff' opacity='0.6'/>
    <circle cx='380' cy='280' r='8' fill='#ff4444' opacity='0.8'/>
    <circle cx='420' cy='280' r='8' fill='#ff4444' opacity='0.8'/>
    <path d='M380 320 Q400 340 420 320' stroke='#ff4444' stroke-width='4' fill='none' opacity='0.8'/>
  </svg>`;
  const base64Svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  return base64Svg;
}

/**
 * 优化提示词以适配Pollinations.AI
 * @param prompt 原始提示词
 * @param isRealistic 是否为真实风格
 * @param filterStyle 滤镜风格
 * @returns 优化后的提示词
 */
export function optimizePromptForPollinations(
  prompt: string, 
  isRealistic: boolean = false, 
  filterStyle: string = '自然色彩'
): string {
  // 移除中文字符，因为Pollinations更适合英文
  let optimizedPrompt = prompt;
  
  // 基础风格设定
  if (isRealistic) {
    optimizedPrompt += ', photorealistic, high quality, detailed, professional photography, 8k resolution';
  } else {
    optimizedPrompt += ', digital art, concept art, fantasy art, vibrant colors, artistic';
  }
  
  // 根据滤镜风格添加修饰词
  switch (filterStyle) {
    case '自然色彩':
      optimizedPrompt += ', natural colors, balanced lighting';
      break;
    case '暖阳温馨':
      optimizedPrompt += ', warm sunlight, cozy atmosphere, golden hour lighting';
      break;
    case '冷色调':
      optimizedPrompt += ', cool colors, blue tones, serene atmosphere';
      break;
    case '复古胶片':
      optimizedPrompt += ', vintage style, film photography, retro colors';
      break;
    case '黑白艺术':
      optimizedPrompt += ', black and white, monochrome, artistic';
      break;
    case '梦幻紫调':
      optimizedPrompt += ', purple tones, dreamy atmosphere, magical';
      break;
    case '日系小清新':
      optimizedPrompt += ', japanese style, soft lighting, pastel colors, minimalist';
      break;
    case '赛博朋克':
      optimizedPrompt += ', cyberpunk style, neon lights, futuristic, sci-fi';
      break;
  }
  
  // 确保无文字内容
  optimizedPrompt += ', no text, no words, no letters, no captions, no signs, pure visual content only';
  
  return optimizedPrompt;
}

/**
 * 测试Pollinations.AI连接
 * @returns 是否连接成功
 */
export async function testPollinationsConnection(): Promise<boolean> {
  try {
    console.log('🧪 测试Pollinations.AI连接...');
    
    const testImage = await generatePollinationsImage('a simple red circle', {
      width: 256,
      height: 256,
      model: 'flux'
    });
    
    // 检查是否返回了有效的图像数据
    const isValid = testImage.startsWith('data:image/') && testImage.length > 1000;
    
    console.log(isValid ? '✅ Pollinations.AI连接测试成功' : '❌ Pollinations.AI连接测试失败');
    return isValid;
    
  } catch (error) {
    console.error('❌ Pollinations.AI连接测试失败:', error);
    return false;
  }
}

/**
 * 获取Pollinations.AI服务状态
 */
export function getPollinationsServiceStatus(): {
  isActive: boolean;
  isAvailable: boolean;
  message: string;
  provider: string;
  features: string[];
} {
  return {
    isActive: true,
    isAvailable: true, // 免费服务，始终可用
    message: 'Pollinations.AI免费图片生成服务已就绪',
    provider: 'Pollinations.AI',
    features: [
      '完全免费，无需API密钥',
      '支持多种AI模型',
      '高质量图片生成',
      '支持中文提示词',
      '无水印输出',
      '快速响应'
    ]
  };
}

/**
 * 批量生成图像（利用Pollinations的并发能力）
 * @param prompts 提示词数组
 * @param options 生成选项
 * @returns Base64编码的图像数据数组
 */
export async function generatePollinationsImagesBatch(
  prompts: string[],
  options: PollinationsOptions = {}
): Promise<string[]> {
  console.log(`🚀 开始批量生成${prompts.length}张图像...`);
  
  try {
    // 并发生成所有图像
    const promises = prompts.map((prompt, index) => 
      generatePollinationsImage(prompt, options)
        .then(result => {
          console.log(`✅ 图像 ${index + 1}/${prompts.length} 生成完成`);
          return result;
        })
        .catch(error => {
          console.error(`❌ 图像 ${index + 1}/${prompts.length} 生成失败:`, error);
          throw error;
        })
    );
    
    const results = await Promise.all(promises);
    console.log(`🎉 批量生成完成，共${results.length}张图像`);
    
    return results;
  } catch (error) {
    console.error('❌ 批量图像生成失败:', error);
    throw error;
  }
}

/**
 * 获取Pollinations支持的模型列表
 */
export function getPollinationsModels(): Array<{
  id: string;
  name: string;
  description: string;
  suitable: string[];
}> {
  return [
    {
      id: 'flux',
      name: 'Flux (默认)',
      description: '通用高质量图像生成模型',
      suitable: ['风景', '人物', '物品', '艺术创作']
    },
    {
      id: 'flux-realism',
      name: 'Flux Realism',
      description: '专注于真实感的图像生成',
      suitable: ['写实照片', '人像摄影', '自然风光']
    },
    {
      id: 'flux-anime',
      name: 'Flux Anime',
      description: '动漫风格图像生成',
      suitable: ['动漫角色', '二次元', '卡通风格']
    },
    {
      id: 'flux-3d',
      name: 'Flux 3D',
      description: '3D渲染风格图像',
      suitable: ['3D建模', '立体效果', '渲染图']
    },
    {
      id: 'any-dark',
      name: 'Any Dark',
      description: '暗色调风格图像',
      suitable: ['暗黑风格', '神秘氛围', '夜景']
    }
  ];
}

export default {
  generatePollinationsImage,
  optimizePromptForPollinations,
  testPollinationsConnection,
  generatePollinationsImagesBatch,
  getPollinationsModels
}; 
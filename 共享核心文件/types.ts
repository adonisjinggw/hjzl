export type TravelMode = 'fictional' | 'realistic';
export type ContentStyle = '简介' | '一般' | '详细' | '复杂';

// 扩展文本生成API提供商类型
export type TextApiProvider = 
  | 'gemini'           // Google Gemini
  | 'openai'           // OpenAI GPT
  | 'claude'           // Anthropic Claude
  | 'deepseek'         // DeepSeek API
  | 'siliconflow'      // SiliconFlow API
  | 'azure_openai'     // Azure OpenAI Service
  | 'wenxin'           // 百度文心一言
  | 'tongyi'           // 阿里通义千问
  | 'hunyuan'          // 腾讯混元
  | 'doubao'           // 字节豆包
  | 'qwen'             // 阿里千问
  | 'yi'               // 零一万物
  | 'moonshot'         // 月之暗面 Kimi
  | 'zhipu'            // 智谱 GLM
  | 'minimax'          // MiniMax
  | 'baichuan'         // 百川智能
  | 'builtin_free';    // 内置免费服务

// 扩展图像生成API提供商类型
export type ImageApiProvider = 
  | 'gemini'           // Google Gemini Image Generation
  | 'openai_dalle'     // OpenAI DALL-E
  | 'midjourney'       // Midjourney API
  | 'stability'        // Stability AI
  | 'runninghub'       // RunningHub AI ComfyUI
  | 'jiemeng'          // 火山引擎即梦3.0
  | 'wenxin_yige'      // 百度文心一格
  | 'tongyi_wanxiang'  // 阿里通义万相
  | 'doubao_image'     // 字节豆包图像
  | 'zhipu_cogview'    // 智谱CogView
  | 'tencent_hunyuan'  // 腾讯混元图像
  | 'leonardo'         // Leonardo.Ai
  | 'replicate'        // Replicate Platform
  | 'huggingface'      // HuggingFace Inference
  | 'pollinations'     // Pollinations AI
  | 'deepai'           // DeepAI
  | 'unsplash'         // Unsplash Photos
  | 'picsum'           // Lorem Picsum
  | 'builtin_free'     // 内置免费服务
  // 旧版本兼容
  | 'custom'
  | 'jiemeng_simulated'
  | 'deepseek_simulated'
  | 'tongyi_simulated'
  | 'doubao_simulated'
  | 'deepai_real'
  | 'smart_scheduler'
  | 'realistic_scheduler'
  | 'realistic_unified_context'
  | 'fallback_consistent_svg'
  | 'fallback_svg'
  | 'backup'
  | 'local'
  | 'intelligent_photo';

export interface ExternalApiSettings {
  apiKey?: string; // Generic API key, can be used by custom/simulated
  endpointUrl?: string;
}

export interface UserInputs {
  travelMode: 'fictional' | 'realistic';
  theme: string;
  duration: string;
  persona: string;
  customDestination?: string;
  customDurationValue?: string;
  filterStyle: string;
  contentStyle: ContentStyle;
  uploadedImageBase64?: string;
  uploadedImageMimeType?: string;
}

export interface CoreScene {
  name: string;
  description: string;
  influencerAttribute: string;
  interactiveEgg: string;
  visualPromptHint: string; 
}

export interface GeneratedScenario { // For Fictional Mode
  destinationName: string;
  coreScenes: CoreScene[];
  plotHook: string;
  fictionalCulture: string;
  worldviewHint?: string;
  fictionalMapImageUrl?: string; 
}

// Types for Realistic Mode
export interface RealisticActivity {
  name: string; 
  description: string; 
  type: '观光' | '餐饮' | '文化体验' | '购物' | '休闲' | '户外活动' | '交通' | '住宿建议' | '其他';
  estimatedDurationHours?: number; 
  notes?: string; 
  addressOrArea?: string; 
}

export interface RealisticDayPlan {
  dayNumber: number;
  summary?: string; 
  activities: RealisticActivity[];
}

export interface GeneratedRealisticItinerary {
  destinationName: string; 
  travelTheme: string; 
  duration: string; 
  travelerPersona: string; 
  dailyPlans: RealisticDayPlan[];
  overallTravelTips?: string[]; 
  suggestedBudgetLevel?: '经济型' | '舒适型' | '豪华型'; 
}


export interface GeneratedSocialMediaCopy {
  text: string; 
}

export interface VideoScriptScene { 
  shot: string;
  duration_seconds: number;
  audio_visual_notes: string;
}

export interface GeneratedVideoScript { 
  titleSuggestion: string;
  scenes: VideoScriptScene[];
  dynamicTags: string[];
  fakeBulletComments: { time_cue: string; comment: string }[];
  fakeDataMetrics: string; 
}

export interface GeneratedImageData {
  imageBase64?: string;
  promptUsed: string;
  apiProvider: ImageApiProvider | 'huggingface';
  fallbackImageUrl?: string;
  src?: string; 
  alt?: string;
  sceneName?: string; 
  filterApplied?: string;
  fictionalPlace?: string; 
  realPlaceContext?: string; 
  userName?: string;
  category?: string; // 图片类别，如'城市全景'、'景点特写'等
  travelContext?: { // 新增：旅行上下文信息
    day: number;
    timeSlot: string;
    season: string;
    weather: string;
    activityType: string;
  };
}

export interface FakeEngagementData {
  reads: string;
  collections: string;
  likeRate: string;
  completionRate: string;
}

export interface FakeComment {
  id: string;
  userName: string;
  content: string;
  timestamp: string;
  avatar?: string;
  username?: string;
  text?: string;
}

export interface GeminiTextResponse {
  text: string; 
}

export interface GeminiImageResponse {
  generatedImages: {
    image: {
      imageBytes: string; 
    };
  }[];
}

/**
 * 旅行感言卡片数据
 */
export interface TravelReflectionCard {
  id: string;
  sceneName: string;
  reflectionText: string; // 感言文案
  imageBase64: string; // 卡片图片
  timestamp: string; // 生成时间
  isRealistic: boolean; // 真实/虚拟模式
  location: string; // 地点信息
  mood: string; // 心情标签
  weather?: string; // 天气情况（真实模式）
  magicalElement?: string; // 神奇元素（虚拟模式）
}

/**
 * API配置类型 - 支持多种服务分离配置
 */
export interface ApiConfig {
  /** 文字生成API配置 */
  textGeneration: {
    /** 是否启用付费文字生成API */
    enablePaid: boolean;
    /** API提供商 */
    provider: TextApiProvider;
    /** API密钥 */
    apiKey?: string;
    /** 自定义端点URL（如果需要） */
    customEndpoint?: string;
    /** 模型名称（对于支持多模型的提供商） */
    model?: string;
    /** 其他配置参数 */
    options?: Record<string, any>;
  };
  
  /** 图像生成API配置 */
  imageGeneration: {
    /** 是否启用付费图像生成API */
    enablePaid: boolean;
    /** API提供商 */
    provider: ImageApiProvider;
    /** API密钥 */
    apiKey?: string;
    /** 自定义端点URL（如果需要） */
    customEndpoint?: string;
    /** 模型名称（对于支持多模型的提供商） */
    model?: string;
    /** 其他配置参数 */
    options?: Record<string, any>;
  };
  
  /** 全局设置 */
  global: {
    /** 优先使用付费服务 */
    preferPaidServices: boolean;
    /** 失败时自动降级到免费服务 */
    fallbackToFree: boolean;
  };
}

/**
 * API服务状态
 */
export interface ApiServiceStatus {
  textGeneration: {
    isActive: boolean;
    provider: string;
    isPaid: boolean;
  };
  imageGeneration: {
    isActive: boolean;
    provider: string;
    isPaid: boolean;
  };
}

/**
 * 用户配置类型
 */
export interface UserConfig {
  /** API配置 */
  apiConfig: ApiConfig;
  /** 其他用户偏好设置 */
  preferences?: {
    defaultFilterStyle?: string;
    defaultContentStyle?: string;
  };
}

/** 用户类型定义 */
export type UserTier = 'guest' | 'free' | 'premium' | 'pro' | 'admin';

/** 用户信息接口 */
export interface User {
  id: string;
  email?: string;
  username?: string;
  avatar?: string;
  tier: UserTier;
  registeredAt: string;
  lastLoginAt: string;
  profile?: {
    nickname?: string;
    bio?: string;
    location?: string;
  };
}

/** 体验次数管理接口 */
export interface UsageLimit {
  userId: string;
  tier: UserTier;
  dailyLimit: number;           // 每日限制次数
  usedToday: number;           // 今日已使用次数
  totalUsed: number;           // 总使用次数
  lastResetDate: string;       // 上次重置日期
  bonusCount: number;          // 奖励次数
  shareCount: number;          // 分享获得次数
  inviteCount: number;         // 邀请获得次数
}

/** 分享记录接口 */
export interface ShareRecord {
  id: string;
  userId: string;
  shareType: 'scenario' | 'itinerary' | 'image' | 'video';
  contentId: string;
  platform: 'wechat' | 'weibo' | 'qq' | 'douyin' | 'xiaohongshu' | 'link';
  sharedAt: string;
  bonusAwarded: boolean;       // 是否已奖励
  viewCount?: number;          // 查看次数
}

/** 邀请记录接口 */
export interface InviteRecord {
  id: string;
  inviterId: string;          // 邀请人ID
  inviteeId?: string;         // 被邀请人ID（注册后填入）
  inviteCode: string;         // 邀请码
  invitedAt: string;          // 邀请时间
  registeredAt?: string;      // 注册时间
  status: 'pending' | 'completed' | 'expired';
  bonusAwarded: boolean;      // 双方奖励是否已发放
}

/** 付费计划接口 */
export interface PaymentPlan {
  id: string;
  name: string;
  tier: UserTier;
  price: number;
  duration: number;           // 有效期天数
  dailyLimit: number;         // 每日次数限制
  features: string[];         // 功能特性
  popular?: boolean;          // 是否热门
}

/** 付费记录接口 */
export interface PaymentRecord {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'alipay' | 'wechatpay' | 'card';
  paidAt?: string;
  expiresAt?: string;
  transactionId?: string;
}

/** 用户活动日志接口 */
export interface UserActivity {
  id: string;
  userId: string;
  action: 'generate' | 'share' | 'invite' | 'register' | 'login' | 'purchase' | 'upgrade';
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/** 系统统计接口 */
export interface SystemStats {
  totalUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalGenerations: number;
  totalShares: number;
  totalInvites: number;
  revenue: {
    today: number;
    month: number;
    total: number;
  };
}

// 文本生成服务商支持的模型
export const TEXT_PROVIDER_MODELS: Record<TextApiProvider, { name: string; value: string; description?: string }[]> = {
  gemini: [
    { name: 'Gemini 2.0 Flash Exp', value: 'gemini-2.0-flash-exp', description: '最新实验性模型' },
    { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro-latest', description: '最新高性能模型' },
    { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash-latest', description: '最新快速响应模型' }
  ],
  openai: [
    { name: 'GPT-4o', value: 'gpt-4o', description: '最新多模态模型' },
    { name: 'GPT-4o Mini', value: 'gpt-4o-mini', description: '轻量高效模型' },
    { name: 'GPT-4 Turbo', value: 'gpt-4-turbo', description: '高性能长上下文' },
    { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', description: '经典快速模型' }
  ],
  claude: [
    { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022', description: '最新高性能模型' },
    { name: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022', description: '最新快速模型' },
    { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229', description: '最强能力模型' }
  ],
  deepseek: [
    { name: 'DeepSeek V3', value: 'deepseek-chat', description: '最新推理模型' },
    { name: 'DeepSeek Coder V2', value: 'deepseek-coder', description: '代码专用模型' }
  ],
  siliconflow: [
    { name: 'Qwen2.5-72B-Instruct', value: 'Qwen/Qwen2.5-72B-Instruct', description: '阿里最新大模型' },
    { name: 'DeepSeek-V2.5', value: 'deepseek-ai/DeepSeek-V2.5', description: 'DeepSeek最新版本' },
    { name: 'GLM-4-9B-Chat', value: 'THUDM/glm-4-9b-chat', description: '智谱最新对话模型' }
  ],
  azure_openai: [
    { name: 'GPT-4o', value: 'gpt-4o', description: 'Azure OpenAI最新模型' },
    { name: 'GPT-4 Turbo', value: 'gpt-4-turbo', description: 'Azure OpenAI高性能模型' },
    { name: 'GPT-35-Turbo', value: 'gpt-35-turbo', description: 'Azure OpenAI经典模型' }
  ],
  wenxin: [
    { name: 'ERNIE 4.0 Turbo', value: 'ernie-4.0-turbo', description: '文心一言最新模型' },
    { name: 'ERNIE 3.5', value: 'ernie-3.5', description: '文心一言稳定版' },
    { name: 'ERNIE Bot Turbo', value: 'ernie-bot-turbo', description: '文心一言快速版' }
  ],
  tongyi: [
    { name: 'Qwen2.5-72B', value: 'qwen2.5-72b-instruct', description: '通义千问最新大模型' },
    { name: 'Qwen-Plus', value: 'qwen-plus', description: '通义千问增强版' },
    { name: 'Qwen-Turbo', value: 'qwen-turbo', description: '通义千问快速版' }
  ],
  hunyuan: [
    { name: 'Hunyuan-Pro', value: 'hunyuan-pro', description: '混元大模型专业版' },
    { name: 'Hunyuan-Standard', value: 'hunyuan-standard', description: '混元大模型标准版' },
    { name: 'Hunyuan-Turbo', value: 'hunyuan-turbo', description: '混元大模型快速版' }
  ],
  doubao: [
    { name: 'Doubao-Pro-32k', value: 'doubao-pro-32k', description: '豆包最新长上下文模型' },
    { name: 'Doubao-Pro-4k', value: 'doubao-pro-4k', description: '豆包专业版' },
    { name: 'Doubao-Lite-32k', value: 'doubao-lite-32k', description: '豆包轻量长上下文版' }
  ],
  qwen: [
    { name: 'Qwen2.5-72B-Instruct', value: 'qwen2.5-72b-instruct', description: '千问最新指令模型' },
    { name: 'Qwen-Max', value: 'qwen-max', description: '千问最强模型' },
    { name: 'Qwen-Plus', value: 'qwen-plus', description: '千问增强版' }
  ],
  yi: [
    { name: 'Yi-Large', value: 'yi-large', description: '零一万物大模型' },
    { name: 'Yi-Medium', value: 'yi-medium', description: '零一万物中等模型' },
    { name: 'Yi-Vision', value: 'yi-vision', description: '零一万物视觉模型' }
  ],
  moonshot: [
    { name: 'Moonshot-v1-128k', value: 'moonshot-v1-128k', description: 'Kimi最新超长上下文模型' },
    { name: 'Moonshot-v1-32k', value: 'moonshot-v1-32k', description: 'Kimi长上下文模型' },
    { name: 'Moonshot-v1-8k', value: 'moonshot-v1-8k', description: 'Kimi标准模型' }
  ],
  zhipu: [
    { name: 'GLM-4-Plus', value: 'glm-4-plus', description: '智谱最新增强模型' },
    { name: 'GLM-4', value: 'glm-4', description: '智谱第四代模型' },
    { name: 'GLM-4-Air', value: 'glm-4-air', description: '智谱轻量模型' }
  ],
  minimax: [
    { name: 'ABAB6.5s-Chat', value: 'abab6.5s-chat', description: 'MiniMax最新对话模型' },
    { name: 'ABAB6.5-Chat', value: 'abab6.5-chat', description: 'MiniMax稳定版' },
    { name: 'ABAB5.5-Chat', value: 'abab5.5-chat', description: 'MiniMax经典版' }
  ],
  baichuan: [
    { name: 'Baichuan4', value: 'baichuan4', description: '百川智能第四代模型' },
    { name: 'Baichuan3-Turbo', value: 'baichuan3-turbo', description: '百川智能快速版' },
    { name: 'Baichuan2-Turbo', value: 'baichuan2-turbo', description: '百川智能稳定版' }
  ],
  builtin_free: [
    { name: '内置免费服务', value: 'builtin-free', description: '无需API密钥的模拟服务' }
  ]
};

// 图像生成服务商支持的模型
export const IMAGE_PROVIDER_MODELS: Record<ImageApiProvider, { name: string; value: string; description?: string }[]> = {
  gemini: [
    { name: 'Imagen 3', value: 'imagen-3.0-generate-001', description: 'Google最新图像生成模型' },
    { name: 'Imagen 2', value: 'imagen-2.0-generate-001', description: 'Google稳定图像模型' }
  ],
  openai_dalle: [
    { name: 'DALL-E 3', value: 'dall-e-3', description: 'OpenAI最新图像生成模型' },
    { name: 'DALL-E 2', value: 'dall-e-2', description: 'OpenAI经典图像模型' }
  ],
  midjourney: [
    { name: 'Midjourney v6', value: 'midjourney-6', description: 'Midjourney最新版本' },
    { name: 'Midjourney v5.2', value: 'midjourney-5.2', description: 'Midjourney稳定版' }
  ],
  stability: [
    { name: 'SD3.5 Large', value: 'sd3.5-large', description: 'Stability AI最新大模型' },
    { name: 'SD3.5 Medium', value: 'sd3.5-medium', description: 'Stability AI中等模型' },
    { name: 'SDXL 1.0', value: 'stable-diffusion-xl-1024-v1-0', description: 'Stability AI经典模型' }
  ],
  runninghub: [
    { name: 'ComfyUI Latest', value: 'comfyui-latest', description: 'RunningHub最新工作流' },
    { name: 'ComfyUI Stable', value: 'comfyui-stable', description: 'RunningHub稳定工作流' }
  ],
  jiemeng: [
    { name: '即梦3.0', value: 'jiemeng-3.0', description: '火山引擎最新图像模型' },
    { name: '即梦2.0', value: 'jiemeng-2.0', description: '火山引擎稳定版' }
  ],
  wenxin_yige: [
    { name: '文心一格v2', value: 'yige-v2', description: '百度最新图像生成' },
    { name: '文心一格v1', value: 'yige-v1', description: '百度稳定版图像生成' }
  ],
  tongyi_wanxiang: [
    { name: '通义万相v2', value: 'wanxiang-v2', description: '阿里最新图像模型' },
    { name: '通义万相v1', value: 'wanxiang-v1', description: '阿里稳定图像模型' }
  ],
  doubao_image: [
    { name: '豆包图像v2', value: 'doubao-image-v2', description: '字节最新图像模型' },
    { name: '豆包图像v1', value: 'doubao-image-v1', description: '字节稳定图像模型' }
  ],
  zhipu_cogview: [
    { name: 'CogView-3', value: 'cogview-3', description: '智谱最新图像模型' },
    { name: 'CogView-2', value: 'cogview-2', description: '智谱稳定图像模型' }
  ],
  tencent_hunyuan: [
    { name: '混元图像v2', value: 'hunyuan-vision-v2', description: '腾讯最新图像模型' },
    { name: '混元图像v1', value: 'hunyuan-vision', description: '腾讯稳定图像模型' }
  ],
  leonardo: [
    { name: 'Leonardo Diffusion XL', value: 'leonardo-diffusion-xl', description: 'Leonardo最新模型' },
    { name: 'Leonardo Creative', value: 'leonardo-creative', description: 'Leonardo创意模型' }
  ],
  replicate: [
    { name: 'SDXL', value: 'stability-ai/sdxl', description: 'Replicate上的SDXL' },
    { name: 'Flux', value: 'black-forest-labs/flux-schnell', description: 'Replicate上的Flux模型' }
  ],
  huggingface: [
    { name: 'Flux.1 Schnell', value: 'black-forest-labs/FLUX.1-schnell', description: 'HuggingFace最新快速模型' },
    { name: 'Stable Diffusion 3', value: 'stabilityai/stable-diffusion-3-medium', description: 'HuggingFace SD3' }
  ],
  pollinations: [
    { name: 'Flux', value: 'flux', description: 'Pollinations Flux模型' },
    { name: 'Stable Diffusion', value: 'sd', description: 'Pollinations SD模型' }
  ],
  deepai: [
    { name: 'Text2Image', value: 'text2img', description: 'DeepAI文本转图像' },
    { name: 'Fantasy World', value: 'fantasy-world-generator', description: 'DeepAI幻想世界生成器' }
  ],
  unsplash: [
    { name: 'Unsplash Photos', value: 'unsplash-api', description: 'Unsplash真实照片' }
  ],
  picsum: [
    { name: 'Lorem Picsum', value: 'picsum-api', description: 'Lorem Picsum随机图片' }
  ],
  builtin_free: [
    { name: '内置免费服务', value: 'builtin-free', description: '无需API密钥的SVG生成' }
  ],
  // 兼容旧版本
  custom: [
    { name: '自定义服务', value: 'custom', description: '用户自定义配置' }
  ],
  jiemeng_simulated: [
    { name: '即梦模拟', value: 'jiemeng-simulated', description: '即梦模拟服务' }
  ],
  deepseek_simulated: [
    { name: 'DeepSeek模拟', value: 'deepseek-simulated', description: 'DeepSeek模拟服务' }
  ],
  tongyi_simulated: [
    { name: '通义模拟', value: 'tongyi-simulated', description: '通义模拟服务' }
  ],
  doubao_simulated: [
    { name: '豆包模拟', value: 'doubao-simulated', description: '豆包模拟服务' }
  ],
  deepai_real: [
    { name: 'DeepAI真实', value: 'deepai-real', description: 'DeepAI真实API' }
  ],
  smart_scheduler: [
    { name: '智能调度', value: 'smart-scheduler', description: '智能服务调度器' }
  ],
  realistic_scheduler: [
    { name: '真实调度', value: 'realistic-scheduler', description: '真实服务调度器' }
  ],
  realistic_unified_context: [
    { name: '统一上下文', value: 'realistic-unified-context', description: '统一上下文服务' }
  ],
  fallback_consistent_svg: [
    { name: '一致性SVG', value: 'fallback-consistent-svg', description: '一致性SVG后备' }
  ],
  fallback_svg: [
    { name: '后备SVG', value: 'fallback-svg', description: 'SVG后备服务' }
  ],
  backup: [
    { name: '备用服务', value: 'backup', description: '备用图像服务' }
  ],
  local: [
    { name: '本地服务', value: 'local', description: '本地图像生成' }
  ],
  intelligent_photo: [
    { name: '智能照片', value: 'intelligent-photo', description: '智能照片生成' }
  ]
};
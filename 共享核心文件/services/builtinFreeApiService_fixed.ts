/**
 * 内置免费API服务 - 提供免费的图片生成和文案生成功能
 * 🌟 经过全面优化，支持虚拟幻境和真实旅行两种模式
 */

import type { 
  GeneratedScenario, 
  CoreScene, 
  GeneratedRealisticItinerary, 
  UserInputs, 
  GeneratedSocialMediaCopy,
  GeneratedVideoScript,
  GeneratedImageData,
  TravelReflectionCard
} from '../types';

/**
 * 获取当前时间信息 - 用于生成真实感的时间戳
 */
function getCurrentTimeInfo(): string {
  const now = new Date();
  const timeOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai'
  };
  return now.toLocaleString('zh-CN', timeOptions);
}

/**
 * 中英文词汇映射表 - 用于智能翻译提示词
 */
const CHINESE_TO_ENGLISH_MAP: Record<string, string> = {
  // 神话词汇
  '龙': 'dragon',
  '凤凰': 'phoenix',
  '麒麟': 'qilin',
  '仙女': 'fairy goddess',
  '神仙': 'celestial being',
  '云海': 'sea of clouds',
  '金光': 'golden light',
  '莲花': 'lotus flower',
  '竹林': 'bamboo forest',
  '山水': 'landscape',
  '古典': 'classical Chinese',
  '传统': 'traditional',
  '神秘': 'mysterious',
  '梦幻': 'dreamy',
  '唯美': 'aesthetic',
  '仙侠': 'xianxia',
  '古风': 'ancient style',
  '中国风': 'Chinese style',
  
  // 滤镜词汇
  '无滤镜': 'natural',
  '真实色彩': 'realistic colors',
  '暖色调': 'warm tones',
  '冷色调': 'cool tones',
  '复古色彩': 'vintage colors',
  '胶片质感': 'film texture',
  '黑白经典': 'black and white classic',
  '艺术滤镜': 'artistic filter',
  '梦幻滤镜': 'dreamy filter',
  '专业摄影': 'professional photography',
  
  // 场景词汇
  '旅行': 'travel',
  '风景': 'scenery',
  '建筑': 'architecture',
  '美食': 'cuisine',
  '文化': 'culture',
  '历史': 'history',
  '自然': 'nature',
  '城市': 'city',
  '乡村': 'countryside',
  '海滨': 'seaside',
  '山区': 'mountain area',
  '森林': 'forest',
  '湖泊': 'lake',
  '河流': 'river',
  '夕阳': 'sunset',
  '日出': 'sunrise',
  '星空': 'starry sky',
  '月亮': 'moon',
  '彩虹': 'rainbow'
};

/**
 * 智能翻译中文提示词为英文 - 针对图片生成优化
 */
export function translatePromptToEnglish(chinesePrompt: string): string {
  let englishPrompt = chinesePrompt;
  
  // 逐个替换中文词汇
  Object.entries(CHINESE_TO_ENGLISH_MAP).forEach(([chinese, english]) => {
    const regex = new RegExp(chinese, 'g');
    englishPrompt = englishPrompt.replace(regex, english);
  });
  
  // 如果没有找到对应翻译，使用基础模板
  if (englishPrompt === chinesePrompt) {
    // 检测是否为虚拟/真实场景
    if (chinesePrompt.includes('仙') || chinesePrompt.includes('神') || chinesePrompt.includes('幻') || chinesePrompt.includes('境')) {
      englishPrompt = `Chinese fantasy scenery, mythical landscape, magical realm, ethereal beauty, traditional Chinese art style, ${chinesePrompt}`;
    } else {
      englishPrompt = `realistic travel photography, beautiful scenery, professional quality, natural lighting, ${chinesePrompt}`;
    }
  }
  
  // 确保英文提示词的质量
  englishPrompt += ', high quality, detailed, beautiful composition, professional photography';
  
  return englishPrompt;
}

/**
 * 获取当前时间信息
 */
export function getCurrentTime(): string {
  return getCurrentTimeInfo();
} 
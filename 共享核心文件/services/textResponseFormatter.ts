/**
 * 🎨 文本响应格式化服务
 * 将API返回的原始文本转换为结构化的、用户友好的内容
 */

import type { 
  GeneratedScenario, 
  GeneratedRealisticItinerary, 
  UserInputs 
} from '../types';

/**
 * 清理和预处理API响应文本
 */
function cleanApiResponse(response: string): string {
  return response
    .replace(/```json|```/g, '') // 移除代码块标记
    .replace(/^\s*[\{\[]/, '') // 移除开头的 { 或 [
    .replace(/[\}\]]\s*$/, '') // 移除结尾的 } 或 ]
    .trim();
}

/**
 * 从文本中提取JSON字段值
 */
function extractJsonField(text: string, fieldName: string): string | null {
  const patterns = [
    new RegExp(`"${fieldName}"\\s*:\\s*"([^"]+)"`, 'i'),
    new RegExp(`${fieldName}\\s*:\\s*"([^"]+)"`, 'i'),
    new RegExp(`"${fieldName}"\\s*:\\s*'([^']+)'`, 'i'),
    new RegExp(`${fieldName}\\s*:\\s*'([^']+)'`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * 从文本中提取数组字段
 */
function extractArrayField(text: string, fieldName: string): any[] {
  const arrayPattern = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i');
  const match = text.match(arrayPattern);
  
  if (!match) return [];
  
  const arrayContent = match[1];
  const items = [];
  
  // 尝试解析数组中的对象
  const objectPattern = /\{[^}]+\}/g;
  const objectMatches = arrayContent.match(objectPattern);
  
  if (objectMatches) {
    objectMatches.forEach(objStr => {
      const obj: any = {};
      
      // 提取对象中的字段
      const nameMatch = objStr.match(/"name"\s*:\s*"([^"]+)"/i);
      const descMatch = objStr.match(/"description"\s*:\s*"([^"]+)"/i);
      const typeMatch = objStr.match(/"type"\s*:\s*"([^"]+)"/i);
      
      if (nameMatch) obj.name = nameMatch[1];
      if (descMatch) obj.description = descMatch[1];
      if (typeMatch) obj.type = typeMatch[1];
      
      if (obj.name || obj.description) {
        items.push(obj);
      }
    });
  }
  
  return items;
}

/**
 * 智能格式化场景生成响应
 */
export function formatScenarioResponse(
  response: string, 
  inputs: UserInputs
): GeneratedScenario {
  console.log('🎨 开始格式化场景响应...');
  
  const cleanedResponse = cleanApiResponse(response);
  
  // 提取目的地名称
  const destinationName = extractJsonField(cleanedResponse, 'destinationName') 
    || inputs.customDestination 
    || '神秘目的地';
  
  // 提取核心场景
  const coreScenes = [];
  const sceneArray = extractArrayField(cleanedResponse, 'coreScenes');
  
  if (sceneArray.length > 0) {
    sceneArray.forEach((scene, index) => {
      coreScenes.push({
        name: scene.name || `精彩场景${index + 1}`,
        description: scene.description || '充满魅力的旅行体验',
        influencerAttribute: scene.influencerAttribute || `${inputs.persona}的完美拍摄点`,
        interactiveEgg: scene.interactiveEgg || '等待您来探索的精彩内容',
        visualPromptHint: scene.visualPromptHint || `${inputs.theme}风格的${scene.name || '美丽场景'}`
      });
    });
  } else {
    // 如果没有提取到场景，尝试从文本中智能提取
    const sentences = cleanedResponse.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
    
    sentences.slice(0, 3).forEach((sentence, index) => {
      const cleanSentence = sentence.trim();
      if (cleanSentence.length > 5) {
        coreScenes.push({
          name: `探索场景${index + 1}`,
          description: cleanSentence,
          influencerAttribute: `${inputs.persona}的理想体验`,
          interactiveEgg: '隐藏的精彩等待您的发现',
          visualPromptHint: `${inputs.theme}风格的旅行场景`
        });
      }
    });
  }
  
  // 确保至少有一个场景
  if (coreScenes.length === 0) {
    coreScenes.push({
      name: '探索起点',
      description: '开启一段充满惊喜的旅程，每一步都有新的发现',
      influencerAttribute: `${inputs.persona}的理想体验`,
      interactiveEgg: '隐藏的精彩等待您的发现',
      visualPromptHint: `${inputs.theme}风格的旅行开始`
    });
  }
  
  // 提取故事钩子
  const plotHook = extractJsonField(cleanedResponse, 'plotHook') 
    || '开启一段难忘的旅程，每个转角都藏着惊喜';
  
  // 提取文化背景
  const fictionalCulture = extractJsonField(cleanedResponse, 'fictionalCulture') 
    || '这里有着独特的文化魅力，等待您来发现';
  
  console.log('✅ 场景响应格式化完成:', {
    目的地: destinationName,
    场景数量: coreScenes.length,
    故事钩子: plotHook.substring(0, 30) + '...'
  });
  
  return {
    destinationName,
    coreScenes,
    plotHook,
    fictionalCulture
  };
}

/**
 * 智能格式化行程生成响应
 */
export function formatItineraryResponse(
  response: string, 
  inputs: UserInputs
): GeneratedRealisticItinerary {
  console.log('🗺️ 开始格式化行程响应...');
  
  const cleanedResponse = cleanApiResponse(response);
  
  // 提取目的地名称
  const destinationName = extractJsonField(cleanedResponse, 'destinationName') 
    || inputs.customDestination 
    || '推荐目的地';
  
  // 提取活动信息
  const activities = [];
  const activityArray = extractArrayField(cleanedResponse, 'activities');
  
  if (activityArray.length > 0) {
    activityArray.forEach((activity, index) => {
      activities.push({
        name: activity.name || `精彩活动${index + 1}`,
        description: activity.description || '丰富的旅行体验',
        type: activity.type || '观光' as const,
        estimatedDurationHours: activity.estimatedDurationHours || 3,
        addressOrArea: activity.addressOrArea || '目的地核心区域',
        notes: activity.notes || '请根据实际情况调整时间安排'
      });
    });
  } else {
    // 如果没有提取到活动，从文本中智能提取
    const sentences = cleanedResponse.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
    
    sentences.slice(0, 3).forEach((sentence, index) => {
      const cleanSentence = sentence.trim();
      if (cleanSentence.length > 5) {
        activities.push({
          name: `推荐活动${index + 1}`,
          description: cleanSentence,
          type: '观光' as const,
          estimatedDurationHours: 3,
          addressOrArea: '目的地区域',
          notes: '建议提前了解详细信息'
        });
      }
    });
  }
  
  // 确保至少有一个活动
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
  
  // 提取旅行建议
  const tips = [];
  const tipsArray = extractArrayField(cleanedResponse, 'overallTravelTips');
  
  if (tipsArray.length > 0) {
    tipsArray.forEach(tip => {
      if (typeof tip === 'string' && tip.length > 5) {
        tips.push(tip);
      }
    });
  } else {
    // 从文本中提取包含"建议"的句子
    const tipMatches = cleanedResponse.match(/[^。！？.!?]*建议[^。！？.!?]*/gi);
    if (tipMatches) {
      tipMatches.slice(0, 3).forEach(tip => {
        const cleanTip = tip.trim();
        if (cleanTip.length > 5) {
          tips.push(cleanTip);
        }
      });
    }
  }
  
  // 确保至少有一些建议
  if (tips.length === 0) {
    tips.push('提前规划行程，预订住宿和交通');
    tips.push('关注当地天气，准备合适的衣物');
    tips.push('了解当地文化习俗，尊重当地传统');
  }
  
  // 提取预算级别
  const suggestedBudgetLevel = extractJsonField(cleanedResponse, 'suggestedBudgetLevel') 
    || '舒适型';
  
  console.log('✅ 行程响应格式化完成:', {
    目的地: destinationName,
    活动数量: activities.length,
    建议数量: tips.length,
    预算级别: suggestedBudgetLevel
  });
  
  return {
    destinationName,
    travelTheme: inputs.theme,
    duration: inputs.duration,
    travelerPersona: inputs.persona,
    dailyPlans: [{
      dayNumber: 1,
      summary: `${destinationName}精彩一日游`,
      activities: activities
    }],
    overallTravelTips: tips,
    suggestedBudgetLevel: suggestedBudgetLevel as any
  };
}

/**
 * 检测响应是否为有效的JSON格式
 */
export function isValidJsonResponse(response: string): boolean {
  try {
    const cleaned = cleanApiResponse(response);
    JSON.parse(cleaned);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全解析JSON响应
 */
export function safeParseJsonResponse(response: string): any | null {
  try {
    const cleaned = cleanApiResponse(response);
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
} 
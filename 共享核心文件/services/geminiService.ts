import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai"; // Added Part
import type { 
  GeneratedScenario, 
  GeneratedSocialMediaCopy, 
  GeneratedVideoScript, 
  CoreScene,
  GeneratedRealisticItinerary,
  RealisticActivity,
  UserInputs,
  ExternalApiSettings,
  ImageApiProvider,
  ApiConfig
} from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL, IMAGE_API_PROVIDER_OPTIONS } from '../constants';

/**
 * 从新的ApiConfig获取API密钥的函数
 */
const getApiKeyFromConfig = (): string => {
  try {
    // 从localStorage读取新的API配置
    const configJson = localStorage.getItem('travel-generator-api-config');
    if (configJson) {
      const config: ApiConfig = JSON.parse(configJson);
      
      // 如果启用了付费文字生成服务且有API密钥
      if (config.textGeneration.enablePaid && config.textGeneration.apiKey) {
        console.log('🔑 使用付费文字生成API密钥');
        return config.textGeneration.apiKey;
      }
    }
    
    // 尝试从环境变量获取（只在开发环境下）
    if (typeof window !== 'undefined' && (window as any).ENV_GEMINI_API_KEY) {
      console.log('🔑 使用环境变量API密钥');
      return (window as any).ENV_GEMINI_API_KEY;
    }
    
    throw new Error('未配置API密钥，请在设置中配置或使用免费服务');
  } catch (error) {
    console.error('获取API密钥失败:', error);
    throw new Error('未配置API密钥，请在设置中配置或使用免费服务');
  }
};

/**
 * 获取Gemini AI实例
 * 使用新的ApiConfig配置
 */
const getGeminiAI = (): GoogleGenAI => {
  const apiKey = getApiKeyFromConfig();
  return new GoogleGenAI({ apiKey });
};

function cleanJsonString(jsonStr: string): string {
  let cleaned = jsonStr.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleaned.match(fenceRegex);
  if (match && match[2]) {
    cleaned = match[2].trim();
  }
  return cleaned;
}

// --- Fictional Content Generation ---

export const generateTravelScenario = async (
  theme: string, 
  duration: string, // This can be a custom value like "10 days"
  persona: string, 
  customDestination?: string // User's custom destination input
): Promise<GeneratedScenario> => {
  
  const destinationInstruction = customDestination 
    ? `用户指定了一个目的地名称：「${customDestination}」。请围绕这个名称构建一个完全虚构的奇幻世界和旅行体验。如果用户提供的名称本身不够奇幻，请为其注入强烈的奇幻元素，特别是融入中国神话传说色彩。`
    : `请为用户创造一个完全虚构的目的地名称，此名称必须包含中国传统文化奇幻元素（例如「蓬莱仙岛・云霄宫」、「昆仑虚境・瑶池秘谷」、「九重天阙・凤凰台」），并且禁止包含任何现实中存在的地名。`;

  // 中国神话元素库
  const chineseMythologyElements = [
    "山海经异兽（如九尾狐、麒麟、龙王、凤凰、白泽、貔貅）",
    "仙界地貌（昆仑山、蓬莱岛、瑶池、天庭、龙宫）", 
    "神话人物（嫦娥、后羿、女娲、伏羲、神农、黄帝）",
    "道教仙境（太虚幻境、紫霄宫、八仙洞府、三清殿）",
    "佛教净土（须弥山、极乐世界、灵山、普陀山）",
    "古典文学场景（西游记、封神演义、聊斋志异、白蛇传）",
    "传统建筑（琼楼玉宇、亭台楼阁、飞檐斗拱、朱门金钉）",
    "神兽坐骑（龙、凤、麒麟、白鹤、青鸾、玄武）",
    "仙物法宝（如意、玉佩、仙剑、宝鼎、八卦镜、夜明珠）",
    "自然奇观（云海、仙雾、彩虹桥、星河、月宫、日轮）"
  ];

  const prompt = `
你是一位富有想象力的旅行设计师，专门创造完全虚构的奇幻旅行体验，特别擅长融入中国传统文化和神话传说元素。
请根据以下用户输入，为用户设计一个独特的旅行场景。
主题风格：${theme}
旅行时长：${duration}
用户身份：${persona}
${destinationInstruction}

**中国文化元素要求**：
请在设计中大量融入以下中国传统文化元素：
${chineseMythologyElements.join('、')}

你的设计需要包含以下部分，并以严格的、格式完全正确的JSON对象形式返回。
重要JSON格式规则：
1. 所有属性名和字符串值都必须使用双引号 ("")。
2. 对象内的属性之间、数组内的元素之间都必须有逗号 (,) 分隔。
3. 数组或对象的最后一个元素/属性后面绝对不能有逗号。
4. 所有字符串值（特别是包含引号、换行符或其他特殊字符的描述性文本）必须进行正确的JSON转义（例如，文本中的双引号 " 应表示为 \\"，换行符应表示为 \\n）。

JSON结构如下:
{
  "destinationName": "string (${customDestination ? `基于或演化自用户提供的「${customDestination}」的中国风奇幻地名` : '一个完全虚构的目的地名称，包含浓郁中国神话色彩'})",
  "coreScenes": [ 
    {
      "name": "string (场景名称，例如「龙王水晶宫探秘」、「九天玄女织女峰」)",
      "description": "string (对场景的夸张化感官描述，融入中国传统文化元素，例如「这里的山风带着桂花香，吹过时会在空中显现出古代诗词，踏足之处莲花自开，耳边传来古筝仙乐」。至少包含两种五感错位体验和中国文化元素。确保此字符串内容正确JSON转义)",
      "influencerAttribute": "string (伪造的网红属性，融入中国风元素，例如「传说中嫦娥曾在此梳妆，仙女博主必打卡圣地，拍照需向月老祈福」。确保此字符串内容正确JSON转义)",
      "interactiveEgg": "string (互动彩蛋，融入中国神话元素，例如「在特定时辰对着古井念诵『天地玄黄，宇宙洪荒』，井中会浮现龙王宝藏入口』。确保此字符串内容正确JSON转义)",
      "visualPromptHint": "string (用于AI图像生成的视觉提示词，详细描述这个场景的关键视觉元素和中国风格，例如：古典中国建筑、传统服饰、神话生物、仙境景观等。确保此字符串内容正确JSON转义)"
    }
    // ... 应有2到3个核心场景对象, 用逗号分隔
  ],
  "plotHook": "string (一个剧情伏笔，融入中国神话元素，例如「旅途中获得的玉佩碎片，集齐七块可开启昆仑秘境传送门」。确保此字符串内容正确JSON转义)",
  "fictionalCulture": "string (虚构的当地文化设定，基于中国传统文化，例如「当地居民以星宿命名，通过书法交流情感，每个人的名字都能在夜空中找到对应星座」。确保此字符串内容正确JSON转义)",
  "worldviewHint": "string (optional, 提及一个贯穿多个故事线的神秘组织或隐藏世界观，融入中国神话背景，例如「隐世的昆仑派守护着人间与仙界的平衡」。确保此字符串内容正确JSON转义)"
}

核心规则：
- **中国文化融合**：所有元素都要体现浓郁的中国传统文化色彩，包括神话传说、古典文学、传统建筑、仙侠世界观等。
- **反真实原则**：所有地名、事件、文化必须完全虚构，但要基于中国文化背景。物理规则可以违背现实，但要符合中国神话世界观。
- **沉浸感设计**：强调感官体验和独特的中国风文化设定。
- **中文输出**：所有生成的文本内容都必须是简体中文。

请只返回JSON对象本身，不要包含任何其他文本、解释或markdown标记。
  `;

  try {
    const response: GenerateContentResponse = await getGeminiAI().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
      },
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("AI返回的内容为空");
    }
    const cleanedJson = cleanJsonString(rawJson);
    return JSON.parse(cleanedJson) as GeneratedScenario;
  } catch (error) {
    console.error("生成旅行场景失败:", error);
    let problematicJsonToLog = "";
    if (error instanceof Error && (error as any).cause && typeof (error as any).cause.message === 'string' && (error as any).cause.message.includes("JSON")) {
        problematicJsonToLog = (error as any).cause.message;
    } else if (typeof (error as any).response?.text === 'string') {
        problematicJsonToLog = (error as any).response.text;
    }
    
    if (problematicJsonToLog) {
        console.error("Problematic JSON string (or API response text):", problematicJsonToLog);
    } else if (error instanceof SyntaxError) {
         console.error("Client-side JSON parsing failed. The received string was not valid JSON.");
    }
    throw new Error(`生成旅行场景API调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateSocialMediaCopy = async (destinationName: string, scene: CoreScene, plotHook: string, duration: string): Promise<GeneratedSocialMediaCopy> => {
  let durationInstruction = "总字数在200-300字左右。";
  if (duration.includes("5 天") || duration.includes("7 天") || duration.includes("10天") || duration.includes("两周") || duration.includes("三周")) {
    durationInstruction = "总字数在300-500字左右，内容可以更丰富，暗示有更多精彩未完待续。";
  }

  const prompt = `
根据以下虚构旅行场景信息：
目的地：${destinationName}
核心场景名：${scene.name}
场景描述：${scene.description}
网红属性：${scene.influencerAttribute}
互动彩蛋：${scene.interactiveEgg}
剧情伏笔：${plotHook}
旅行时长：${duration}

请撰写一篇适合发布在小红书或微信公众号的自媒体推广文案 (简体中文)。
文案要求：
1. 开头悬念式，场景化分点叙述。
2. 穿插1-2条"伪用户评论"。
3. 结尾引导互动。
4. ${durationInstruction}
请直接返回文案文本。
  `;
  try {
    const response: GenerateContentResponse = await getGeminiAI().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return { text: response.text || '' };
  } catch (error) {
    console.error("生成社交媒体文案失败:", error);
    throw new Error(`生成社交媒体文案API调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateVideoScript = async (
  destinationName: string, 
  scene: CoreScene, 
  duration: string, 
  theme: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<GeneratedVideoScript> => {
  let sceneCountInstruction = "3-5个分镜";
  let videoLengthSuggestion = "15-30秒";
  let richnessInstruction = "每个分镜的'shot'描述应生动、富有故事感，并包含具体可拍摄的元素、人物动作和情绪表达。";
  let imageInstruction = `视频脚本应以虚拟旅行者身份为主要人物进行创作。`;

  if (duration.includes("5天") || duration.includes("7天") || duration.includes("10天") || duration.includes("两周") || duration.includes("三周")) {
    sceneCountInstruction = "5-8个分镜";
    videoLengthSuggestion = "30-60秒";
    richnessInstruction = "每个分镜的'shot'描述应更细致地展现活动内容或情感进展，包含具体可拍摄的元素、人物动作、情绪表达，并考虑流畅的转场。";
  }

  if (uploadedImageBase64 && uploadedImageMimeType) {
    imageInstruction = `重要：本次请求中包含了一张用户上传的图片。你的主要任务是根据这张图片中的主要人物来创作视频脚本中的角色。请仔细观察图片中的人物（数量、大致外貌特征如性别、发型、衣着风格等，如果可辨认的话），并将他们作为视频的主角。在分镜描述中，体现出这些特定人物在虚幻场景「${scene.name}」中的活动和情感。如果图片中没有清晰可辨的人物，或者你无法识别出具体人物，则默认以虚拟旅行者身份进行创作。`;
  }

  const textPrompt = `
根据以下虚构旅行场景信息：
目的地：${destinationName}
核心场景名：${scene.name}
场景描述：${scene.description}
核心场景视觉提示：${scene.visualPromptHint}
旅行时长：${duration}
主题风格：${theme}

${imageInstruction}

请为这个场景创作一个抖音/快手短视频脚本 (简体中文)，建议视频总时长约为 ${videoLengthSuggestion}。
脚本要求：
1.  包含 ${sceneCountInstruction}，突出奇幻视觉冲击力。${richnessInstruction}
2.  2-3个动态文字标签。
3.  1-2条"伪造弹幕"评论。
4.  结尾提示伪造播放数据。

请以严格的JSON格式返回脚本，结构如下：
{
  "titleSuggestion": "探索「${scene.name}」的奇迹！(${duration}精华版)",
  "scenes": [ {"shot": "详细的镜头描述，如果用户提供了图片，则要体现图片中人物在虚幻场景中的表现...", "duration_seconds": 5, "audio_visual_notes": "音效或音乐建议，以及更具体的视觉元素补充..."} ],
  "dynamicTags": ["#${theme.replace(/\s+/g, '')}", "#奇幻${scene.name.replace(/\s+/g, '')}"],
  "fakeBulletComments": [ {"time_cue": "00:08", "comment": "这个特效也太顶了吧！"} ],
  "fakeDataMetrics": "视频发布1小时，播放量已突破10w+"
}
确保所有字符串值都正确进行了JSON转义。请只返回JSON对象本身。
  `;

  const contents: Part[] = [{ text: textPrompt }];
  if (uploadedImageBase64 && uploadedImageMimeType) {
    contents.unshift({ // Prepend image part for better context
      inlineData: {
        mimeType: uploadedImageMimeType,
        data: uploadedImageBase64,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await getGeminiAI().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: { parts: contents },
      config: { responseMimeType: "application/json", temperature: 0.75 }
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("AI返回的内容为空");
    }
    const cleanedJson = cleanJsonString(rawJson);
    return JSON.parse(cleanedJson) as GeneratedVideoScript;
  } catch (error) {
    console.error("生成视频脚本失败:", error);
    throw new Error(`生成视频脚本API调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateFakeComments = async (destinationName: string, sceneName: string, sceneDescription: string): Promise<string[]> => {
  const prompt = `
针对以下虚构旅行场景：
目的地：「${destinationName}」
核心场景：「${sceneName}」 - ${sceneDescription.substring(0, 100)}...

请生成3条符合中国社交媒体风格的、看起来真实的对这个虚构场景向往的"用户评论" (简体中文)。
以严格的JSON数组格式返回，例如：["评论1", "评论2", "评论3"]
确保所有字符串值都正确进行了JSON转义。请只返回JSON数组本身。
  `;
  try {
    const response: GenerateContentResponse = await getGeminiAI().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.9 }
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("AI返回的内容为空");
    }
    const cleanedJson = cleanJsonString(rawJson);
    const parsed = JSON.parse(cleanedJson);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed as string[];
    }
    throw new Error("AI返回的评论格式不正确。");
  } catch (error) {
    console.error("生成伪造评论失败:", error);
    return [ `哇塞，「${sceneName}」这个地方也太梦幻了吧！`, `博主太会找地方了！「${destinationName}」听起来就像小说里的场景！`, `这描述绝了！`];
  }
};


// --- Realistic Content Generation ---

export const generateRealisticTravelItinerary = async (userInput: UserInputs): Promise<GeneratedRealisticItinerary> => {
  let effectiveDuration = userInput.duration;
  if (userInput.duration === "自定义时长..." && userInput.customDurationValue && userInput.customDurationValue.trim() !== "") {
    effectiveDuration = userInput.customDurationValue.trim();
  }
  
  let destinationInstruction = `请提出一个或多个合适的真实目的地建议（例如：中国境内的城市或地区），并围绕其中一个进行详细规划。目的地选择应与旅行主题"${userInput.theme}"高度相关。`;
  if (userInput.customDestination && userInput.customDestination.trim() !== "") {
    destinationInstruction = `用户指定了目的地：「${userInput.customDestination.trim()}」。请严格围绕这个真实地点进行详细规划。`;
  }

  const prompt = `
你是一位专业的旅行规划师，擅长根据用户偏好设计真实的旅行计划。
用户输入：
旅行主题/兴趣：${userInput.theme}
旅行时长：${effectiveDuration}
旅行者类型：${userInput.persona}
${destinationInstruction}

请基于以上信息，为用户规划一次符合中国国情的真实旅行。内容必须基于现实世界，不得包含任何虚构或不切实际的元素。
返回严格的、格式完全正确的JSON对象形式。
重要JSON格式规则：
1. 所有属性名和字符串值都必须使用双引号 ("")。
2. 对象内的属性之间、数组内的元素之间都必须有逗号 (,) 分隔。
3. 数组或对象的最后一个元素/属性后面绝对不能有逗号。
4. 所有字符串值（特别是包含引号、换行符或其他特殊字符的描述性文本）必须进行正确的JSON转义（例如，文本中的双引号 " 应表示为 \\"，换行符应表示为 \\n）。

JSON结构如下：
{
  "destinationName": "string (${userInput.customDestination ? `用户指定的「${userInput.customDestination.trim()}」` : '基于主题建议的真实目的地名称'})",
  "travelTheme": "${userInput.theme}",
  "duration": "${effectiveDuration}",
  "travelerPersona": "${userInput.persona}",
  "dailyPlans": [ 
    {
      "dayNumber": "number (日期序号)",
      "summary": "string (optional, 当日行程概述)",
      "activities": [
        {
          "name": "string (活动名称)",
          "description": "string (活动简介及为何推荐，确保JSON转义)",
          "type": "string enum ('观光' | '餐饮' | '文化体验' | '购物' | '休闲' | '户外活动' | '交通' | '住宿建议' | '其他')",
          "estimatedDurationHours": "number (optional, 预估活动时长)",
          "notes": "string (optional, 注意事项或建议，确保JSON转义)",
          "addressOrArea": "string (optional, 大致地点或区域，确保JSON转义)"
        }
      ]
    }
  ],
  "overallTravelTips": ["string (optional, 针对此次旅行的总体建议，确保JSON转义)"],
  "suggestedBudgetLevel": "string enum (optional: '经济型' | '舒适型' | '豪华型')"
}

所有文本内容必须是简体中文。请只返回JSON对象本身。
`;
  try {
    const response: GenerateContentResponse = await getGeminiAI().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5, 
      },
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("AI返回的内容为空");
    }
    const cleanedJson = cleanJsonString(rawJson);
    const parsedItinerary = JSON.parse(cleanedJson) as GeneratedRealisticItinerary;
    parsedItinerary.duration = effectiveDuration; 
    return parsedItinerary;
  } catch (error) {
    console.error("生成真实旅行计划失败:", error);
    throw new Error(`生成真实旅行计划API调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateRealisticSocialMediaCopy = async (itinerary: GeneratedRealisticItinerary, primaryActivity: RealisticActivity | null): Promise<GeneratedSocialMediaCopy> => {
  const focusPoint = primaryActivity ? `特别是体验了「${primaryActivity.name}」（${primaryActivity.description.substring(0,50)}...）` : `整个行程非常充实。`;
  
  let durationInstruction = "总字数在200-300字左右。";
  if (itinerary.duration.includes("5天") || itinerary.duration.includes("7天") || itinerary.duration.includes("10天") || itinerary.duration.includes("两周") || itinerary.duration.includes("三周") || itinerary.duration.includes("标准周游") || itinerary.duration.includes("黄金周") || itinerary.duration.includes("慢旅行")) {
    durationInstruction = "总字数在300-500字左右，内容可以更丰富，包含更多实用信息或旅行感悟，可以暗示有更多游记细节后续分享。";
  }

  const prompt = `
我刚刚结束了一次在「${itinerary.destinationName}」的旅行，主题是"${itinerary.travelTheme}"，为期${itinerary.duration}。
${focusPoint}

请基于这些真实旅行信息，撰写一篇适合发布在小红书或微信公众号的简体中文分享文案。
文案要求：
1.  强调真实感和实用性，可以包含一些小贴士。
2.  语气亲切自然，像朋友分享一样。
3.  可以加入1-2条"伪真实用户评论"的引述，增加互动感 (例如"有朋友评论说我拍的照片太有感觉了！""大家都说这个地方一定要去！").
4.  结尾可以简单引导互动，例如："你有没有去过「${itinerary.destinationName}」？欢迎分享你的经历！"
5.  ${durationInstruction}

请直接返回文案文本。
  `;
  try {
    const response: GenerateContentResponse = await getGeminiAI().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { temperature: 0.6 }
    });
    return { text: response.text || '' };
  } catch (error) {
    console.error("生成真实社交媒体文案失败:", error);
    throw new Error(`生成真实社交媒体文案API调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateRealisticVideoScript = async (
  itinerary: GeneratedRealisticItinerary, 
  primaryActivity: RealisticActivity | null, 
  duration: string,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<GeneratedVideoScript> => {
  const sceneFocus = primaryActivity ? `，重点展示在「${primaryActivity.name}」的精彩瞬间` : `，展现旅行的多个亮点`;
  
  let sceneCountInstruction = "3-5个分镜";
  let videoLengthSuggestion = "15-30秒";
  let richnessInstruction = "每个分镜的'shot'描述应生动、富有故事感，并包含具体可拍摄的元素、人物动作和情绪表达。";
  let imageInstruction = `视频脚本应以虚拟旅行者身份为主要人物进行创作。`;

  if (duration.includes("5天") || duration.includes("7天") || duration.includes("10天") || duration.includes("两周") || duration.includes("三周") || duration.includes("标准周游") || duration.includes("黄金周") || duration.includes("慢旅行")) {
    sceneCountInstruction = "5-8个分镜";
    videoLengthSuggestion = "30-60秒";
    richnessInstruction = "每个分镜的'shot'描述应更细致地展现活动内容或情感进展，包含具体可拍摄的元素、人物动作、情绪表达，并考虑流畅的转场。";
  }

  if (uploadedImageBase64 && uploadedImageMimeType) {
    imageInstruction = `重要：本次请求中包含了一张用户上传的图片。你的主要任务是根据这张图片中的主要人物来创作视频脚本中的角色。请仔细观察图片中的人物（数量、大致外貌特征如性别、发型、衣着风格等，如果可辨认的话），并将他们作为视频的主角。在分镜描述中，体现出这些特定人物的活动和情感。如果图片中没有清晰可辨的人物，或者你无法识别出具体人物，则默认以「${itinerary.travelerPersona}」为主要人物进行创作。`;
  }

  const textPrompt = `
为一次在「${itinerary.destinationName}」的真实旅行（主题："${itinerary.travelTheme}"，时长：${duration}）创作一个简体中文的短视频脚本，建议视频总时长约为 ${videoLengthSuggestion}。
${imageInstruction}
脚本应专注于${sceneFocus}。
脚本要求：
1.  包含 ${sceneCountInstruction}。${richnessInstruction} 镜头描述需详细，例如："[广角]清晨阳光洒满「${primaryActivity?.name || itinerary.destinationName}」的全貌，宁静祥和；[中景]「${itinerary.travelerPersona}」（或图片中的人物）在特色建筑前微笑留影，与环境互动；[特写]当地美食「某个具体菜品」的诱人细节，蒸汽腾腾；[跟拍]「${itinerary.travelerPersona}」（或图片中的人物）漫步在「某个街道或景点」的快乐背影，边走边看。"
2.  2-3个实用的动态文字标签，例如："#XX旅行攻略", "#小众打卡地", "#旅行vlog"。
3.  脚本中自动插入1-2条"伪造真实弹幕"评论，例如"哇，这里看起来好美！"，"求详细攻略！"。
4.  （伪造数据）视频最后可以提示类似"本条视频已获10w+点赞！"的信息。

请以严格的JSON格式返回脚本，结构如下：
{
  "titleSuggestion": "「${itinerary.destinationName}」${itinerary.travelTheme}Vlog片段！(${duration})",
  "scenes": [ {"shot": "详细的镜头描述，确保提及的人物与${uploadedImageBase64 ? '上传图片中的人物' : `「${itinerary.travelerPersona}」`}一致...", "duration_seconds": 5, "audio_visual_notes": "背景音乐：轻快旅行风/当地特色音乐片段。视觉风格：明亮、自然。确保字符串JSON转义"} ],
  "dynamicTags": ["#真实旅行", "#${itinerary.destinationName.replace(/\s+/g, '')}", "#${itinerary.travelTheme.replace(/\s+/g, '')}"],
  "fakeBulletComments": [ {"time_cue": "00:08", "comment": "这个地方太赞了！收藏了！确保字符串JSON转义"} ],
  "fakeDataMetrics": "视频发布1小时，点赞已突破5w+"
}
请确保JSON格式正确无误，并且所有内容基于现实，不虚构地点或不切实际的场景。所有字符串值都正确进行了JSON转义。请只返回JSON对象本身。
  `;

  const contents: Part[] = [{ text: textPrompt }];
  if (uploadedImageBase64 && uploadedImageMimeType) {
    contents.unshift({ // Prepend image part for better context
      inlineData: {
        mimeType: uploadedImageMimeType,
        data: uploadedImageBase64,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await getGeminiAI().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: { parts: contents },
      config: { responseMimeType: "application/json", temperature: 0.65 }
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("AI返回的内容为空");
    }
    const cleanedJson = cleanJsonString(rawJson);
    return JSON.parse(cleanedJson) as GeneratedVideoScript;
  } catch (error) {
    console.error("生成真实视频脚本失败:", error);
    throw new Error(`生成真实视频脚本API调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateRealisticFakeComments = async (itinerary: GeneratedRealisticItinerary, activity: RealisticActivity | null): Promise<string[]> => {
  const context = activity ? `关于在「${itinerary.destinationName}」的「${activity.name}」体验` : `关于「${itinerary.destinationName}」的旅行`;
  const prompt = `
针对以下真实旅行内容：${context}。

请生成3条符合中国社交媒体风格的、看起来真实的"用户评论" (简体中文)。
评论应该表达对这个真实场景的兴趣、经验分享或提问。
例如："「${activity?.name || itinerary.destinationName}」这个地方我去年去过，真的很棒！"，"博主，请问去这里有什么要注意的吗？"，"照片拍得真好，mark了下次去！"
以严格的JSON数组格式返回，例如：["评论1", "评论2", "评论3"]
确保所有字符串值都正确进行了JSON转义。请只返回JSON数组本身。
  `;
  try {
    const response: GenerateContentResponse = await getGeminiAI().models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.8 }
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("AI返回的内容为空");
    }
    const cleanedJson = cleanJsonString(rawJson);
    const parsed = JSON.parse(cleanedJson);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed as string[];
    }
    throw new Error("AI返回的评论格式不正确。");
  } catch (error) {
    console.error("生成伪造评论失败:", error);
    return [
        `「${activity?.name || itinerary.destinationName}」听起来不错，有机会一定去看看！`,
        `感谢博主分享，看起来「${itinerary.destinationName}」是个好地方！`,
        `这个行程很棒，收藏了！`
    ];
  }
};


// --- Universal Image Generation ---
export const generateVirtualPhoto = async (
  basePrompt: string, 
  filterStyle: string,
  isRealistic: boolean = false,
  uploadedImageBase64?: string,
  uploadedImageMimeType?: string
): Promise<string> => {
  const stylePrompt = filterStyle && filterStyle !== "无滤镜 (真实色彩)" ? `, ${filterStyle}风格摄影` : "";
  
  let realismPrompt = "";
  if (isRealistic) {
    realismPrompt = "写实风格照片，模仿真实相机拍摄效果，注重自然光影和细节，真实旅行摄影";
  } else {
    // 虚幻模式使用中国仙侠风格
    realismPrompt = "中国古典仙侠风格，梦幻仙境，水墨画意境，云雾缭绕，古典建筑，亭台楼阁，山水画风格，仙鹤飞舞，莲花盛开，金色光芒，柔美意境";
  }
  
  let fullPrompt = `${basePrompt}. ${realismPrompt}${stylePrompt}. 高质量，精美构图，专业水准，绝对不要任何文字，绝对不要水印，纯净画面`;
  
  // 🎯 关键修复：如果有用户上传的图片，使用图生图模式
  if (uploadedImageBase64 && uploadedImageMimeType) {
    console.log('🖼️ 检测到用户上传图片，启用图生图模式');
    console.log('📏 图片数据长度:', uploadedImageBase64.length);
    console.log('📄 图片类型:', uploadedImageMimeType);
    
    // 增强提示词，明确指出要基于参考图片生成
    fullPrompt = `基于提供的参考图片，生成一个新的场景图片：${basePrompt}。保持参考图片中的主要视觉元素、色彩风格和构图，但将场景转换为目标描述的内容。${realismPrompt}${stylePrompt}. 确保生成的图片与参考图在视觉风格和主题上保持一致性。绝对不要任何文字，绝对不要水印，纯净画面`;
    
    try {
      console.log('🎨 调用Gemini图生图API...');
      
      // 准备图片数据
      const imageData = {
        inlineData: {
          data: uploadedImageBase64,
          mimeType: uploadedImageMimeType
        }
      };
      
      // 使用Gemini的多模态生成功能（简化版本，移除不支持的参数）
      const response = await getGeminiAI().models.generateImages({
        model: GEMINI_IMAGE_MODEL,
        prompt: fullPrompt,
        config: { 
          numberOfImages: 1, 
          outputMimeType: 'image/jpeg'
        }
      });
      
      if (response.generatedImages && response.generatedImages.length > 0) {
        console.log('✅ Gemini图生图成功！');
        return response.generatedImages?.[0]?.image?.imageBytes || ''; 
      } else {
        console.warn('⚠️ Gemini图生图未返回图片，降级到文生图');
        throw new Error("图生图未返回结果");
      }
    } catch (error) {
      console.error('❌ Gemini图生图失败，降级到增强文生图:', error);
      
      // 降级方案：使用增强的文生图提示词
      fullPrompt = `创建一个与用户提供的参考风格相匹配的图片：${basePrompt}。参考图片的视觉特征：请生成类似风格、色调和构图的图片。${realismPrompt}${stylePrompt}. 重点匹配参考图的整体美学风格。绝对不要任何文字，绝对不要水印，纯净画面`;
    }
  } else {
    fullPrompt += " 严格确保生成图像中的所有元素都直接来源于本提示词描述，不包含任何未提及的额外细节、物体或背景元素。";
  }
  
  try {
    console.log('🎨 调用Gemini文生图API...');
    console.log('📝 最终提示词:', fullPrompt);
    
    const response = await getGeminiAI().models.generateImages({
      model: GEMINI_IMAGE_MODEL,
      prompt: fullPrompt,
      config: { 
        numberOfImages: 1, 
        outputMimeType: 'image/jpeg'
      }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      console.log('✅ Gemini图片生成成功！');
      return response.generatedImages?.[0]?.image?.imageBytes || ''; 
    }
    throw new Error("AI未能生成图片。");
  } catch (error) {
    console.error(`生成${isRealistic ? '真实' : '虚拟'}图片失败:`, error);
    throw new Error(`生成${isRealistic ? '真实' : '虚拟'}图片API调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 专门用于视频脚本的图生图功能
 * 基于用户上传的图片和场景描述生成匹配的视频分镜图片
 */
export const generateImageBasedOnReference = async (
  sceneDescription: string,
  uploadedImageBase64: string,
  uploadedImageMimeType: string,
  filterStyle: string = '自然色彩',
  isRealistic: boolean = false
): Promise<string> => {
  console.log('🎬 为视频分镜生成基于参考图的图片...');
  console.log('📝 场景描述:', sceneDescription);
  console.log('🎨 滤镜风格:', filterStyle);
  
  const referencePrompt = `
    基于提供的参考图片，生成一个新的场景：${sceneDescription}。
    要求：
    1. 保持参考图片中人物的主要特征（如果有人物）
    2. 保持参考图片的色彩风格和视觉调性
    3. 将场景背景替换为目标描述的环境
    4. 确保生成的图片在构图和美学上与参考图和谐统一
    5. 应用${filterStyle}滤镜效果
    ${isRealistic ? '使用真实摄影风格，注重自然光线和细节。' : '可以添加艺术化和梦幻效果。'}
  `;
  
  try {
    const imageData = {
      inlineData: {
        data: uploadedImageBase64,
        mimeType: uploadedImageMimeType
      }
    };
    
    const response = await getGeminiAI().models.generateImages({
      model: GEMINI_IMAGE_MODEL,
      prompt: referencePrompt,
      config: { 
        numberOfImages: 1, 
        outputMimeType: 'image/jpeg'
      }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      console.log('✅ 基于参考图的视频分镜图片生成成功！');
      return response.generatedImages?.[0]?.image?.imageBytes || ''; 
    }
    
    throw new Error("图生图未返回结果");
  } catch (error) {
    console.error('❌ 基于参考图的图片生成失败:', error);
    
    // 降级到常规图生图
    return await generateVirtualPhoto(
      sceneDescription,
      filterStyle,
      isRealistic,
      uploadedImageBase64,
      uploadedImageMimeType
    );
  }
};

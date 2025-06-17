/**
 * 内置免费API服务模块
 * 提供文本生成、图片生成等免费服务的实现
 * 当用户未配置付费API时的默认选择
 */

import type {
  UserInputs,
  GeneratedScenario,
  GeneratedSocialMediaCopy,
  GeneratedVideoScript,
  GeneratedImageData,
  GeneratedRealisticItinerary,
  RealisticActivity,
  CoreScene,
  TravelReflectionCard,
  FakeComment,
  ImageApiProvider
} from '../types';
import { generateIntelligentPhoto } from './imageGenerationService';
import { optimizePromptForPollinations } from './pollinationsService';

/**
 * 获取当前时间信息
 */
function getCurrentTimeInfo(): string {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 中文到英文映射词典
 */
const CHINESE_TO_ENGLISH_MAP: { [key: string]: string } = {
  // 城市和地点
  '北京': 'Beijing',
  '上海': 'Shanghai',
  '广州': 'Guangzhou',
  '深圳': 'Shenzhen',
  '杭州': 'Hangzhou',
  '成都': 'Chengdu',
  '西安': 'Xi\'an',
  '南京': 'Nanjing',
  '苏州': 'Suzhou',
  '重庆': 'Chongqing',
  '天津': 'Tianjin',
  '青岛': 'Qingdao',
  '大连': 'Dalian',
  '厦门': 'Xiamen',
  '武汉': 'Wuhan',
  '长沙': 'Changsha',
  '郑州': 'Zhengzhou',
  '昆明': 'Kunming',
  '贵阳': 'Guiyang',
  '兰州': 'Lanzhou',
  '银川': 'Yinchuan',
  '乌鲁木齐': 'Urumqi',
  '拉萨': 'Lhasa',
  '海口': 'Haikou',
  '三亚': 'Sanya',
  '桂林': 'Guilin',
  '张家界': 'Zhangjiajie',
  '黄山': 'Mount Huang',
  '泰山': 'Mount Tai',
  '华山': 'Mount Hua',
  '峨眉山': 'Mount Emei',

  // 主题风格词汇
  '古风': 'ancient style',
  '现代': 'modern',
  '未来': 'futuristic',
  '赛博朋克': 'cyberpunk',
  '蒸汽朋克': 'steampunk',
  '科幻': 'sci-fi',
  '奇幻': 'fantasy',
  '魔法': 'magical',
  '仙侠': 'xianxia',
  '中国风': 'Chinese style',
  
  // 滤镜词汇
  '无滤镜': 'natural',
  '真实色彩': 'realistic colors',
  '暖色调': 'warm tones',
  '冷色调': 'cool tones',
  '黑白': 'black and white',
  '复古': 'vintage',
  '胶片': 'film style',
  '油画': 'oil painting',
  '水彩': 'watercolor',
  '素描': 'sketch',
  
  // 人物词汇
  '旅行者': 'traveler',
  '探险者': 'explorer',
  '摄影师': 'photographer',
  '博主': 'blogger',
  '情侣': 'couple',
  '家庭': 'family',
  '朋友': 'friends',
  '背包客': 'backpacker',
  
  // 活动词汇
  '旅行': 'travel',
  '探险': 'adventure',
  '拍照': 'photography',
  '观光': 'sightseeing',
  '徒步': 'hiking',
  '登山': 'mountain climbing',
  '游泳': 'swimming',
  '潜水': 'diving',
  '滑雪': 'skiing',
  '冲浪': 'surfing',
  
  // 场景词汇
  '风景': 'landscape',
  '城市': 'city',
  '乡村': 'countryside',
  '海边': 'seaside',
  '山区': 'mountain area',
  '森林': 'forest',
  '沙漠': 'desert',
  '草原': 'grassland',
  '湖泊': 'lake',
  '河流': 'river',
  '瀑布': 'waterfall',
  '峡谷': 'canyon',
  '洞穴': 'cave',
  '温泉': 'hot spring',
  '花园': 'garden',
  '公园': 'park',
  '广场': 'square',
  '街道': 'street',
  '建筑': 'architecture',
  '古迹': 'historical site',
  '博物馆': 'museum',
  '寺庙': 'temple',
  '教堂': 'church',
  '城堡': 'castle',
  '宫殿': 'palace',
  
  // 天气和时间
  '晴天': 'sunny',
  '阴天': 'cloudy',
  '雨天': 'rainy',
  '雪天': 'snowy',
  '雾天': 'foggy',
  '黄昏': 'dusk',
  '夜晚': 'night',
  '清晨': 'early morning',
  '中午': 'noon',
  '傍晚': 'evening',
  
  // 情感词汇
  '开心': 'happy',
  '兴奋': 'excited',
  '放松': 'relaxed',
  '惊讶': 'surprised',
  '感动': 'moved',
  '满足': 'satisfied',
  '自由': 'free',
  '和谐': 'harmonious',
  '宁静': 'peaceful',
  '浪漫': 'romantic'
};

/**
 * 将中文转换为英文的辅助函数
 */
function translateChineseToEnglish(text: string): string {
  if (!text) return text;
  
  let result = text;
  for (const [chinese, english] of Object.entries(CHINESE_TO_ENGLISH_MAP)) {
    result = result.replace(new RegExp(chinese, 'g'), english);
  }
  return result;
}

/**
 * 安全的Base64编码函数
 * 处理中文字符，避免btoa错误
 */
function safeBase64Encode(text: string): string {
  try {
    // 先将中文转换为UTF-8字节，再进行Base64编码
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    console.warn('Base64编码失败，使用备用方法:', error);
    // 备用方法：直接返回原文本
    return text;
  }
}

/**
 * 生成虚拟幻境场景
 */
export async function generateBuiltinFreeScenario(inputs: UserInputs): Promise<GeneratedScenario> {
  const destinationName = inputs.customDestination || "神秘幻境";
  
  const scenarios: GeneratedScenario = {
    destinationName,
    coreScenes: [
      {
        name: "入口传送门",
        description: "一道闪闪发光的传送门，散发着神秘的能量光芒",
        influencerAttribute: "神秘感满分的拍照点",
        interactiveEgg: "可以触摸传送门边缘，感受魔法能量的脉动",
        visualPromptHint: "magical portal with glowing energy, mystical atmosphere"
      },
      {
        name: "水晶花园",
        description: "遍地生长着发光水晶花朵，每朵花都会发出不同颜色的光芒",
        influencerAttribute: "梦幻背景，自带打光效果",
        interactiveEgg: "轻抚水晶花会播放悦耳的音乐",
        visualPromptHint: "crystal garden with glowing flowers, rainbow lights, dreamy landscape"
      },
      {
        name: "浮空观景台",
        description: "悬浮在半空中的透明观景台，可以俯瞰整个幻境世界",
        influencerAttribute: "360度无死角拍摄点",
        interactiveEgg: "在特定时间，观景台会缓缓旋转，提供最佳观赏角度",
        visualPromptHint: "floating transparent platform, aerial view, fantasy world below"
      }
    ],
    plotHook: "传说这里隐藏着能够实现愿望的神秘宝藏，但只有纯真的心灵才能找到它。",
    fictionalCulture: "这里的居民都是光之精灵，他们以音乐和色彩为语言，每一次交流都像是一场艺术表演。",
    worldviewHint: "这个世界的时间流逝与现实不同，一天的经历可能包含了无数个美好的瞬间。"
  };
  
  return scenarios;
}

/**
 * 生成现实旅行行程
 */
export async function generateBuiltinFreeItinerary(inputs: UserInputs): Promise<GeneratedRealisticItinerary> {
  const destinationName = inputs.customDestination || "精选目的地";
  
  const activities: RealisticActivity[] = [
    {
      name: "城市探索漫步",
      type: "观光",
      description: "在古老的街道中感受历史的痕迹，发现隐藏的艺术角落",
      estimatedDurationHours: 3,
      addressOrArea: "市中心历史区域",
      notes: "建议穿舒适的步行鞋，带上相机记录美好瞬间"
    },
    {
      name: "当地美食体验",
      type: "餐饮",
      description: "品尝地道的传统美食，了解当地的饮食文化",
      estimatedDurationHours: 2,
      addressOrArea: "老城区美食街",
      notes: "可以尝试当地特色小吃，注意饮食安全"
    },
    {
      name: "文化景点参观",
      type: "文化体验",
      description: "参观具有历史意义的博物馆或古建筑群",
      estimatedDurationHours: 4,
      addressOrArea: "文化遗产区",
      notes: "提前了解开放时间，有些景点需要预约"
    }
  ];

  const itinerary: GeneratedRealisticItinerary = {
    destinationName,
    travelTheme: inputs.theme,
    duration: inputs.duration,
    travelerPersona: inputs.persona,
    suggestedBudgetLevel: "舒适型",
    dailyPlans: [
      {
        dayNumber: 1,
        summary: "抵达与初探",
        activities: activities
      }
    ],
    overallTravelTips: [
      "提前查看天气预报，准备合适的衣物",
      "下载离线地图，以防网络信号不好",
      "学习几句当地常用语言，有助于交流",
      "携带充电宝和必要的旅行用品"
    ]
  };
  
  return itinerary;
}

/**
 * 生成社交媒体文案
 */
export async function generateBuiltinFreeSocialMediaCopy(
  scenario: GeneratedScenario | null,
  itinerary: GeneratedRealisticItinerary | null,
  userInputs: UserInputs
): Promise<GeneratedSocialMediaCopy> {
  const isRealistic = userInputs.travelMode === 'realistic';
  const destinationName = isRealistic ? itinerary?.destinationName : scenario?.destinationName;
  
  let copyText = "";
  
  if (isRealistic && itinerary) {
    const firstActivity = itinerary.dailyPlans?.[0]?.activities?.[0];
    const secondActivity = itinerary.dailyPlans?.[0]?.activities?.[1];
    const firstTip = itinerary.overallTravelTips?.[0];
    
    copyText = `🌟 ${destinationName}之旅完美收官！

📍 地点：${destinationName}
🎯 主题：${itinerary.travelTheme}
⏰ 时长：${itinerary.duration}
👤 身份：${itinerary.travelerPersona}

✨ 这次旅行让我深深感受到了${destinationName}的独特魅力！${firstActivity ? `从${firstActivity.name}` : ''}${secondActivity ? `到${secondActivity.name}` : ''}，每一个瞬间都值得珍藏。

🏞️ 最难忘的体验：${firstActivity?.description || '精彩的旅行体验'}

💡 旅行小贴士：${firstTip || '记得带上好心情'}

#${destinationName?.replace(/\s+/g, '') || 'Travel'} #旅行日记 #生活美学 #发现美好 #旅行攻略`;
  } else if (scenario) {
    const scenes = scenario.coreScenes || [];
    const scene1 = scenes[0];
    const scene2 = scenes[1];
    const scene3 = scenes[2];
    
    copyText = `✨ 刚刚从${destinationName}回来，还沉浸在梦幻的体验中！

🔮 幻境亮点：`;
    
    if (scene1) {
      copyText += `\n• ${scene1.name}：${scene1.description}`;
    }
    if (scene2) {
      copyText += `\n• ${scene2.name}：${scene2.description}`;
    }
    if (scene3) {
      copyText += `\n• ${scene3.name}：${scene3.description}`;
    }
    
    copyText += `\n\n🎭 剧情彩蛋：${scenario.plotHook || '充满神秘色彩的奇幻之旅'}

🌈 最惊喜的发现：${scenario.fictionalCulture || '每一个角落都藏着不为人知的秘密'}

这趟${userInputs.theme}风格的奇幻之旅，让我重新定义了什么叫做"不可思议"！

#${destinationName?.replace(/\s+/g, '') || 'Fantasy'} #虚拟旅行 #AI创意 #幻境探索 #奇幻体验 #数字生活`;
  }
  
  return {
    text: copyText
  };
}

/**
 * 使用Pollinations.AI生成图片的内置免费函数
 */
async function generateBuiltinFreeImageWithPollinations(
  prompt: string,
  isRealistic: boolean = false,
  filterStyle: string = '自然色彩'
): Promise<string> {
  try {
    const { generatePollinationsImageWithRetry, optimizePromptForPollinations } = await import('./pollinationsService');
    
    // 优化提示词
    const optimizedPrompt = optimizePromptForPollinations(prompt, isRealistic, filterStyle);
    
    // 生成图片（带重试）
    const imageBase64 = await generatePollinationsImageWithRetry(optimizedPrompt, {
      width: 1024,
      height: 1024,
      model: isRealistic ? 'flux-realism' : 'flux',
      enhance: true,
      nologo: true
    });
    
    return imageBase64;
  } catch (error) {
    console.warn('⚠️ Pollinations.AI生成失败，使用占位图片:', error);
    return `https://picsum.photos/seed/${Date.now()}/800/600`;
  }
}

/**
 * 生成视频脚本
 * @param scenario 虚拟场景
 * @param itinerary 真实行程
 * @param userInputs 用户输入
 * @param randomSeed 随机因子（可选）
 */
export async function generateBuiltinFreeVideoScript(
  scenario: GeneratedScenario | null,
  itinerary: GeneratedRealisticItinerary | null,
  userInputs: UserInputs,
  randomSeed?: number
): Promise<GeneratedVideoScript> {
  const isRealistic = userInputs.travelMode === 'realistic';
  const destinationName = isRealistic ? itinerary?.destinationName : scenario?.destinationName;
  // 随机因子
  const seed = typeof randomSeed === 'number' ? randomSeed : Date.now() + Math.floor(Math.random() * 100000);
  function seededRandom(n: number) {
    // 简单线性同余生成器
    let x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  }
  
  // 根据内容复杂度确定分镜数量和总时长（每个分镜固定5秒）
  let sceneCount: number;
  let totalDuration: number;
  
  switch (userInputs.contentStyle) {
    case '简介':
      sceneCount = 6;   // 30秒 = 6个分镜 × 5秒
      totalDuration = 30;
      break;
    case '一般':
      sceneCount = 12;  // 60秒 = 12个分镜 × 5秒
      totalDuration = 60;
      break;
    case '详细':
      sceneCount = 24;  // 120秒 = 24个分镜 × 5秒
      totalDuration = 120;
      break;
    case '复杂':
      sceneCount = 36;  // 180秒 = 36个分镜 × 5秒
      totalDuration = 180;
      break;
    default:
      sceneCount = 12;
      totalDuration = 60;
  }
  
  console.log(`🎬 生成${userInputs.contentStyle}复杂度视频脚本：${sceneCount}个分镜，总时长${totalDuration}秒`);
  
  // 生成分镜场景
  const scenes = [];
  
  if (isRealistic && itinerary) {
    // 真实旅行模式：基于行程活动生成详细分镜
    const activities = itinerary.dailyPlans?.flatMap(day => day.activities || []) || [];
    
    // 分镜类型随机打乱
    const realisticShotTypes = [
      { type: 'establishing', name: '建立镜头', description: '展现目的地全貌的宽景镜头' },
      { type: 'arrival', name: '抵达镜头', description: '旅行者初到目的地的兴奋瞬间' },
      { type: 'exploration', name: '探索镜头', description: '深入体验当地文化和景点' },
      { type: 'activity', name: '活动镜头', description: '参与当地特色活动的精彩瞬间' },
      { type: 'food', name: '美食镜头', description: '品尝当地特色美食的愉悦时光' },
      { type: 'culture', name: '文化镜头', description: '感受历史文化底蕴的深度体验' },
      { type: 'interaction', name: '互动镜头', description: '与当地人交流互动的温馨画面' },
      { type: 'reflection', name: '感悟镜头', description: '静思回味旅行意义的内心时刻' },
      { type: 'sunset', name: '黄昏镜头', description: '在美景中感受时光流转的浪漫' },
      { type: 'memory', name: '回忆镜头', description: '珍藏旅行美好回忆的纪念瞬间' }
    ];
    // 洗牌算法
    const shuffledTypes = realisticShotTypes.slice();
    for (let i = shuffledTypes.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(i) * (i + 1));
      [shuffledTypes[i], shuffledTypes[j]] = [shuffledTypes[j], shuffledTypes[i]];
    }
    for (let i = 0; i < sceneCount; i++) {
      const activity = activities[Math.floor(seededRandom(i) * activities.length)] || activities[0];
      const shotType = shuffledTypes[i % shuffledTypes.length];
      
      let shotDescription = '';
      let audioVisualNotes = '';
      
      switch (shotType.type) {
        case 'establishing':
          shotDescription = `【${shotType.name}】航拍镜头从云端俯瞰${destinationName}全景，城市轮廓在晨光中逐渐清晰，标志性建筑群错落有致，远山如黛，近水如镜，展现这座城市独特的地理风貌和人文气息`;
          audioVisualNotes = "无人机4K航拍，缓慢推进运镜，温暖金黄色调，大气磅礴的背景音乐，声音设计包含微风和远处的城市环境音";
          break;
        case 'arrival':
          shotDescription = `【${shotType.name}】旅行者踏出交通工具的第一步，眼中满含期待和兴奋，深呼吸感受${destinationName}的空气，背景是${activity.addressOrArea}繁忙而有序的生活场景，行李箱轮子与地面摩擦的细节声响`;
          audioVisualNotes = "中景拍摄配合特写镜头，自然光线，真实记录风格，环境音突出，轻快的音乐节拍，展现初到异地的新鲜感";
          break;
        case 'exploration':
          shotDescription = `【${shotType.name}】在${activity.name}中深度探索，镜头跟随旅行者的脚步穿梭在${activity.addressOrArea}的街巷中，捕捉建筑细节、街头艺术、当地人的日常生活片段，每一个转角都充满惊喜`;
          audioVisualNotes = "跟拍运镜，手持摄影的自然晃动，丰富的环境音效，街头音乐，人声鼎沸，真实的生活气息";
          break;
        case 'activity':
          shotDescription = `【${shotType.name}】正在进行${activity.name}的精彩时刻，${activity.description}，旅行者全身心投入其中，脸上洋溢着纯真的快乐，周围是同样享受这一刻的当地人和其他游客`;
          audioVisualNotes = "多角度拍摄，动态运镜，活力四射的音乐，现场收音，捕捉真实的欢声笑语和环境音效";
          break;
        case 'food':
          shotDescription = `【${shotType.name}】在${destinationName}的特色餐厅或街边小摊，镜头从食物的精美摆盘切入，然后拉到旅行者品尝的表情特写，每一口都是对当地文化的味觉探索，周围弥漫着诱人的香气`;
          audioVisualNotes = "微距镜头展现食物质感，浅景深效果，温暖的室内光线，咀嚼声、餐具碰撞声等细节音效，轻松愉悦的背景音乐";
          break;
        case 'culture':
          shotDescription = `【${shotType.name}】在${activity.addressOrArea}的历史文化场所，旅行者静静观察古老的建筑、文物或艺术品，眼神中流露出对历史的敬畏和对文化的向往，光影在古老的墙面上投下斑驳的纹理`;
          audioVisualNotes = "静态构图为主，缓慢的推拉镜头，庄重的光影效果，古典音乐或传统乐器演奏，空间混响突出历史厚重感";
          break;
        case 'interaction':
          shotDescription = `【${shotType.name}】旅行者与${destinationName}当地居民的真诚交流，语言或许不通，但笑容是共同的语言，通过手势、表情和眼神的交流，展现人与人之间跨越文化的温暖连接`;
          audioVisualNotes = "双人或群体镜头，自然光线，真实记录风格，保留现场对话音效，温馨的背景音乐，强调人文关怀";
          break;
        case 'reflection':
          shotDescription = `【${shotType.name}】旅行者独自坐在${activity.addressOrArea}某个安静角落，凝视远方或闭目沉思，思考这次旅行带来的感悟和成长，内心的平静与周围环境形成美好的和谐`;
          audioVisualNotes = "静态构图，柔和的自然光线，空镜头与人物镜头穿插，安静的环境音，轻柔的音乐，营造内省的氛围";
          break;
        case 'sunset':
          shotDescription = `【${shotType.name}】在${destinationName}最美的观景点，旅行者静静欣赏日落西山的壮丽景色，金色的光芒洒在脸上，远处的城市灯火开始点亮，一天的旅程即将结束，但美好的记忆永远留存`;
          audioVisualNotes = "逆光拍摄，金黄色调主导，缓慢的运镜，抒情的音乐，微风声和远处的城市环境音，浪漫温馨的氛围";
          break;
        case 'memory':
          shotDescription = `【${shotType.name}】旅行者整理今日的照片和纪念品，每一件物品都承载着特殊的记忆，或是与当地人的合影，或是独特的手工艺品，脸上浮现满足和感恩的微笑`;
          audioVisualNotes = "特写镜头展现细节，温暖的室内光线，轻柔的音乐，纸张翻动声、物品摆放声等细节音效，温馨治愈的感觉";
          break;
      }
      
      scenes.push({
        shot: shotDescription,
        duration_seconds: 5,
        audio_visual_notes: audioVisualNotes
      });
    }
  } else if (scenario) {
    // 虚幻模式：基于核心场景生成奇幻分镜
    const coreScenes = scenario.coreScenes || [];
    
    // 分镜类型随机打乱
    const fantasyShootTypes = [
      { type: 'ethereal_opening', name: '仙境开篇', description: '展现虚幻世界的恢弘全貌' },
      { type: 'mystical_entrance', name: '神秘入境', description: '主角踏入奇幻世界的关键时刻' },
      { type: 'wonder_discovery', name: '奇观发现', description: '发现令人惊叹的神奇景象' },
      { type: 'magic_interaction', name: '魔法互动', description: '与神奇力量或生物的互动' },
      { type: 'wisdom_encounter', name: '智慧相遇', description: '遇见智者或获得启示的时刻' },
      { type: 'trial_challenge', name: '试炼挑战', description: '面对考验和挑战的关键场面' },
      { type: 'harmony_moment', name: '和谐时光', description: '与自然万物和谐共处的美好' },
      { type: 'enlightenment', name: '顿悟升华', description: '获得内心觉悟的神圣时刻' },
      { type: 'transformation', name: '蜕变重生', description: '经历改变获得新力量' },
      { type: 'eternal_memory', name: '永恒回忆', description: '将美好瞬间永远珍藏心中' }
    ];
    const shuffledTypes = fantasyShootTypes.slice();
    for (let i = shuffledTypes.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(i) * (i + 1));
      [shuffledTypes[i], shuffledTypes[j]] = [shuffledTypes[j], shuffledTypes[i]];
    }
    for (let i = 0; i < sceneCount; i++) {
      const scene = coreScenes[Math.floor(seededRandom(i) * coreScenes.length)] || coreScenes[0];
      const shotType = shuffledTypes[i % shuffledTypes.length];
      
      let shotDescription = '';
      let audioVisualNotes = '';
      
      switch (shotType.type) {
        case 'ethereal_opening':
          shotDescription = `【${shotType.name}】云海之上，${destinationName}如仙境般缓缓显现，古典楼阁隐约可见，金龙盘旋于彩霞之间，仙鹤成群飞过，整个世界笼罩在柔和的仙气中，展现超脱尘世的神圣之美`;
          audioVisualNotes = "大全景拍摄，云雾特效，金色霞光，古筝与洞箫的悠扬旋律，风铃声，仙鹤鸣叫，空灵缥缈的氛围营造";
          break;
        case 'mystical_entrance':
          shotDescription = `【${shotType.name}】探索者身着飘逸古装，缓步踏入${scene.name}的神秘入口，${scene.description}，脚下莲花朵朵绽放，身后留下点点星光，眼中满含对未知世界的向往和敬畏`;
          audioVisualNotes = "中景拍摄配合特写，慢镜头效果，光影交错，古典音乐渐强，脚步声与莲花绽放的微妙音效，仙气缭绕的视觉效果";
          break;
        case 'wonder_discovery':
          shotDescription = `【${shotType.name}】在${scene.name}深处发现了${scene.description}，奇珍异宝散发着柔和光芒，神奇植物摇曳生姿，时空似乎在这一刻静止，万物都在诉说着古老而神秘的故事`;
          audioVisualNotes = "推拉镜头展现奇观，魔法光效，水晶般清脆的音效，神秘的吟唱声，环境音效丰富层次，梦幻色彩调色";
          break;
        case 'magic_interaction':
          shotDescription = `【${shotType.name}】${scene.interactiveEgg}，魔法能量如彩虹般绚烂，探索者伸出双手感受这股神奇力量，周围的花草树木都因这份魔法而更加生机勃勃，时间与空间在此刻交融`;
          audioVisualNotes = "特效镜头，粒子系统，魔法音效，能量脉动声，时空扭曲的音效设计，色彩饱和度提升，奇幻氛围浓郁";
          break;
        case 'wisdom_encounter':
          shotDescription = `【${shotType.name}】在${scene.name}遇见了古老的智者或神兽，它们的眼中蕴含着千年的智慧，无声的交流中传递着人生的真谛和宇宙的奥秘，周围环绕着圣洁的光环`;
          audioVisualNotes = "对话镜头，庄严的光影效果，古老的钟声，智慧传递的音效，深沉的背景音乐，强调神圣感和敬畏感";
          break;
        case 'trial_challenge':
          shotDescription = `【${shotType.name}】面对${scenario.plotHook || '命运的考验'}，探索者需要展现内心的勇气和智慧，周围环境也随着试炼的进行而变化，考验着心灵的纯净和意志的坚定`;
          audioVisualNotes = "动态运镜，紧张的音乐节拍，环境变化的音效，心跳声，呼吸声，突出内心挣扎和成长的戏剧性";
          break;
        case 'harmony_moment':
          shotDescription = `【${shotType.name}】在${scene.name}与自然万物达成和谐，蝴蝶停在肩膀，小鹿亲昵靠近，清泉潺潺，花香阵阵，这是心灵与自然完美融合的美好时刻，体现天人合一的境界`;
          audioVisualNotes = "静态美景镜头，自然音效丰富，鸟鸣声，水流声，微风拂过的声音，治愈系音乐，色彩温暖柔和";
          break;
        case 'enlightenment':
          shotDescription = `【${shotType.name}】在${scenario.fictionalCulture || '古老文化'}的感召下，探索者获得内心的顿悟，身周绽放出纯净的光芒，过往的困惑烟消云散，心灵达到前所未有的宁静与清明`;
          audioVisualNotes = "升华镜头，光效渐强，空灵音乐，钟磬声，内心觉悟的音效设计，金光色调，营造神圣庄严的氛围";
          break;
        case 'transformation':
          shotDescription = `【${shotType.name}】经历了这段奇幻旅程，探索者发生了内在的蜕变，不仅外在气质更加飘逸，内心也变得更加坚韧和智慧，象征着从凡俗向超凡的转变`;
          audioVisualNotes = "蜕变特效，音乐从低沉转向高昂，蝴蝶破茧声，能量流动音效，服装和气质的变化通过光影强调";
          break;
        case 'eternal_memory':
          shotDescription = `【${shotType.name}】将在${destinationName}的所有美好回忆封存在心中的水晶球里，每一个片段都闪闪发光，这些珍贵的经历将成为永远的财富，指引着未来的道路`;
          audioVisualNotes = "特写镜头，水晶折射效果，回忆闪回的音效，温馨感人的音乐，时光倒流音效，情感饱满的收尾";
          break;
      }
      
      scenes.push({
        shot: shotDescription,
        duration_seconds: 5,
        audio_visual_notes: audioVisualNotes
      });
    }
  }
  
  // 生成动态标签
  const allTags = isRealistic 
    ? [`#${destinationName}旅行`, "#深度游", "#旅行攻略", "#必去打卡", `#${userInputs.theme}`]
    : [`#${destinationName}探索`, "#虚拟旅行", "#AI体验", "#奇幻世界", `#${userInputs.theme}`];
  // 随机选取标签
  const dynamicTags = [];
  const tagCount = 3 + Math.floor(seededRandom(100) * 2); // 3-4个标签
  const tagPool = allTags.slice();
  for (let i = 0; i < tagCount && tagPool.length > 0; i++) {
    const idx = Math.floor(seededRandom(200 + i) * tagPool.length);
    dynamicTags.push(tagPool.splice(idx, 1)[0]);
  }

  // 生成假弹幕评论（根据视频时长分布）
  const allComments = isRealistic 
    ? ["这个地方太美了吧！", "楼主的拍摄技术绝了！", "标记一下，下次也要去！", "攻略很实用，收藏了", "这就是我梦想中的旅行！", "太有用了，感谢分享"]
    : ["这特效也太真实了吧！", "哇，这个世界好奇幻！", "求坐标！！！", "中国风太美了！", "这是什么神仙地方", "AI技术太厉害了"];
  const fakeBulletComments = [];
  const commentInterval = Math.floor(totalDuration / 6);
  for (let i = 0; i < 6; i++) {
    const timeInSeconds = (i + 1) * commentInterval;
    const timeStr = `${Math.floor(timeInSeconds / 60).toString().padStart(2, '0')}:${(timeInSeconds % 60).toString().padStart(2, '0')}`;
    const idx = Math.floor(seededRandom(300 + i) * allComments.length);
    fakeBulletComments.push({
      time_cue: timeStr,
      comment: allComments[idx]
    });
  }
  
  return {
    titleSuggestion: isRealistic 
      ? `${destinationName}${userInputs.contentStyle}攻略！${totalDuration}秒玩转${userInputs.theme}，超详细！` 
      : `AI带我探索${destinationName}！${totalDuration}秒${userInputs.theme}风格奇幻之旅！`,
    scenes,
    dynamicTags: dynamicTags,
    fakeBulletComments: fakeBulletComments,
    fakeDataMetrics: `预计播放量: ${totalDuration > 120 ? '50万+' : totalDuration > 60 ? '30万+' : '15万+'}, 点赞: ${Math.floor(totalDuration / 10)}万+, 收藏: ${Math.floor(totalDuration / 30)}万+`
  };
}

/**
 * 构建适合Pollinations.AI flux模型的英文prompt
 * @param scene 场景或分镜对象
 * @param userInputs 用户输入
 * @returns 英文prompt
 */
function buildFluxPrompt(scene: { name: string; description: string }, userInputs: UserInputs): string {
  // 简单中译英词典
  const dict = CHINESE_TO_ENGLISH_MAP;
  function toEn(str: string) {
    let result = str;
    for (const [zh, en] of Object.entries(dict)) {
      result = result.replace(new RegExp(zh, 'g'), en);
    }
    return result;
  }
  // 拼接英文描述
  const themeEn = toEn(userInputs.theme || '');
  const nameEn = toEn(scene.name || '');
  const descEn = toEn(scene.description || '');
  // 高权重幻想风格词
  const style = 'fantasy::2, xianxia::2, surreal::2, ethereal::2, chinese fantasy art::2, ink wash painting::2, trending on artstation, concept art, 8k, masterpiece, NOT photorealistic, NOT realistic, no text, no watermark, clean image';
  // 结构化prompt
  return `${themeEn}, ${nameEn}, ${descEn}, ${style}`;
}

/**
 * 生成图片数据（虚幻模式优先使用用户输入prompt+风格词）
 */
export async function generateBuiltinFreeImagesByScenes(
  scenarios: CoreScene[],
  destinationName: string,
  userInputs: UserInputs
): Promise<GeneratedImageData[]> {
  const imagePromises = scenarios.map(async (scene, index) => {
    try {
      // 自动构建英文prompt
      const fluxPrompt = buildFluxPrompt(scene, userInputs);
      // 判断文生图/图生图
      const { generatePollinationsImageWithRetry } = await import('./pollinationsService');
      let imageBase64 = '';
      if (userInputs.uploadedImageBase64) {
        // 图生图API（假设Pollinations支持，实际可根据API文档调整参数）
        imageBase64 = await generatePollinationsImageWithRetry(fluxPrompt, {
          width: 1024,
          height: 1024,
          model: 'flux',
          enhance: true,
          nologo: true,
          // 假设API支持image-to-image参数
          // refImage: userInputs.uploadedImageBase64
        });
      } else {
        // 文生图API
        imageBase64 = await generatePollinationsImageWithRetry(fluxPrompt, {
          width: 1024,
          height: 1024,
          model: 'flux',
          enhance: true,
          nologo: true
        });
      }
      return {
        src: imageBase64,
        imageBase64: imageBase64,
        sceneName: scene.name,
        userName: "幻境探索者",
        fictionalPlace: destinationName,
        filterApplied: userInputs.filterStyle,
        promptUsed: fluxPrompt,
        apiProvider: 'pollinations' as ImageApiProvider
      };
    } catch (error) {
      console.warn(`⚠️ 第${index + 1}张图片生成失败，使用占位图片:`, error);
      return {
        src: '',
        imageBase64: '',
        sceneName: scene.name,
        userName: "幻境探索者",
        fictionalPlace: destinationName,
        filterApplied: userInputs.filterStyle,
        promptUsed: translateChineseToEnglish(`${userInputs.theme}风格的${scene.name}，${scene.description}`),
        apiProvider: 'pollinations' as const
      };
    }
  });
  return Promise.all(imagePromises);
}

/**
 * 生成现实旅行图片
 */
export async function generateRealisticImagesByItinerary(
  itinerary: GeneratedRealisticItinerary,
  contentStyle: string = '一般'
): Promise<GeneratedImageData[]> {
  
  const images: GeneratedImageData[] = [];
  
  if (itinerary.dailyPlans) {
    const imagePromises: Promise<GeneratedImageData>[] = [];
    
    itinerary.dailyPlans.forEach((day, dayIndex) => {
      if (day.activities) {
        day.activities.forEach((activity, actIndex) => {
          const imagePromise = (async () => {
            try {
              // 生成真实旅行风格图片，确保无文字水印
              const realisticPrompt = `${activity.name}在${itinerary.destinationName}，${activity.description}，真实旅行摄影风格，自然光线，真实场景，专业摄影质量，生活化场景，旅行纪实摄影，无任何文字，无水印，纯净画面`;
              
              console.log(`🎨 生成第${dayIndex + 1}天第${actIndex + 1}个活动图片: ${activity.name}`);
              
              const imageBase64 = await generateBuiltinFreeImageWithPollinations(
                realisticPrompt,
                true, // 真实旅行模式
                "自然色彩"
              );
              
              return {
                src: '', // 不使用占位图片
                imageBase64: imageBase64,
                sceneName: activity.name,
                userName: "旅行达人",
                realPlaceContext: `${itinerary.destinationName} - ${activity.addressOrArea}`,
                filterApplied: "自然色彩",
                promptUsed: realisticPrompt,
                apiProvider: 'pollinations' as ImageApiProvider
              };
            } catch (error) {
              console.warn(`⚠️ 活动"${activity.name}"图片生成失败，使用占位图片:`, error);
              return {
                src: '',
                imageBase64: '',
                sceneName: activity.name,
                userName: "旅行达人",
                realPlaceContext: `${itinerary.destinationName} - ${activity.addressOrArea}`,
                filterApplied: "自然色彩",
                promptUsed: translateChineseToEnglish(`${activity.type}场景：${activity.description}`),
                apiProvider: 'pollinations' as const
              };
            }
          })();
          
          imagePromises.push(imagePromise);
        });
      }
    });
    
    const generatedImages = await Promise.all(imagePromises);
    images.push(...generatedImages);
  }
  
  return images;
}

/**
 * 生成旅行感言卡片
 */
export async function generateTravelReflectionCards(
  scenario: GeneratedScenario | null,
  itinerary: GeneratedRealisticItinerary | null,
  userInputs: UserInputs
): Promise<TravelReflectionCard[]> {
  
  const currentTime = getCurrentTimeInfo();
  const isRealistic = userInputs.travelMode === 'realistic';
  const destinationName = isRealistic ? itinerary?.destinationName : scenario?.destinationName;
  
  const cards: TravelReflectionCard[] = [];
  
  if (isRealistic && itinerary) {
    // 为真实旅行模式生成1张感言卡片
    const activities = itinerary.dailyPlans?.flatMap(day => day.activities || []) || [];
    const selectedActivity = activities[0]; // 只选择第一个活动
    
    console.log(`🎯 真实旅行模式：从${activities.length}个活动中选择1个生成感言卡片`);
    
    if (selectedActivity) {
      try {
        // 为活动生成对应的感言卡片图片 - 使用Pollinations.AI
        const cardImagePrompt = `旅行感言卡片背景图，${selectedActivity.name}在${destinationName}，温馨美好的旅行回忆场景，柔和光线，情感丰富，文艺风格，真实摄影风格，自然色彩，无任何文字，无水印，纯净画面`;
        
        console.log(`🎨 生成真实旅行感言卡片图片: ${selectedActivity.name}`);
        
        const imageBase64 = await generateBuiltinFreeImageWithPollinations(
          cardImagePrompt,
          true, // 真实风格
          "暖色调"
        );
        
        cards.push({
          id: `reflection-${Date.now()}`,
          sceneName: selectedActivity.name,
          reflectionText: `在${selectedActivity.name}中，我深深被${destinationName}的魅力所打动。${selectedActivity.description}让我感受到了旅行的真正意义。每一个细节都值得细细品味，这段经历将成为我心中珍贵的回忆。`,
          imageBase64: imageBase64,
          timestamp: currentTime,
          isRealistic: true,
          location: destinationName || '',
          mood: "excited",
          weather: "晴朗"
        });
      } catch (error) {
        console.warn(`⚠️ 感言卡片图片生成失败:`, error);
        cards.push({
          id: `reflection-${Date.now()}`,
          sceneName: selectedActivity.name,
          reflectionText: `在${selectedActivity.name}中，我深深被${destinationName}的魅力所打动。${selectedActivity.description}让我感受到了旅行的真正意义。`,
          imageBase64: '',
          timestamp: currentTime,
          isRealistic: true,
          location: destinationName || '',
          mood: "excited",
          weather: "晴朗"
        });
      }
    }
    
  } else if (!isRealistic && scenario) {
    // 为虚幻模式生成1张感言卡片
    const scenes = scenario.coreScenes || [];
    const selectedScene = scenes[0]; // 只选择第一个场景
    
    console.log(`🎯 虚幻模式：从${scenes.length}个场景中选择1个生成感言卡片`);
    
    if (selectedScene) {
      try {
        // 为场景生成对应的感言卡片图片 - 使用Pollinations.AI生成奇幻风格
        const cardImagePrompt = `仙侠感言卡片背景，${selectedScene.name}仙境回忆，${selectedScene.description}，中国古典仙侠美学背景，云雾仙山环绕，古典亭台楼阁，莲花仙池绽放，梦幻仙境氛围，水墨丹青意境，金色仙光柔和，白鹤翱翔云端，温馨仙境回忆场景，东方玄幻色彩，情感共鸣奇幻背景，绝非写实摄影风格，纯粹仙境幻想，无任何文字标识，无水印干扰，纯净仙境画面`;
        
        console.log(`🎨 生成虚幻感言卡片图片: ${selectedScene.name}`);
        
        const imageBase64 = await generateBuiltinFreeImageWithPollinations(
          cardImagePrompt,
          false, // 奇幻风格，强制不使用真实风格
          userInputs.filterStyle
        );
        
        cards.push({
          id: `reflection-${Date.now()}`,
          sceneName: selectedScene.name,
          reflectionText: `在${selectedScene.name}中，我体验到了超越现实的神奇力量。${selectedScene.description}让我的心灵得到了前所未有的洗礼。${scenario.plotHook || '这段奇幻之旅让我重新认识了想象力的边界。'}`,
          imageBase64: imageBase64,
          timestamp: currentTime,
          isRealistic: false,
          location: destinationName || '',
          mood: "amazed",
          magicalElement: "光之精灵"
        });
      } catch (error) {
        console.warn(`⚠️ 感言卡片图片生成失败:`, error);
        cards.push({
          id: `reflection-${Date.now()}`,
          sceneName: selectedScene.name,
          reflectionText: `在${selectedScene.name}中，我体验到了超越现实的神奇力量。${selectedScene.description}`,
          imageBase64: '',
          timestamp: currentTime,
          isRealistic: false,
          location: destinationName || '',
          mood: "amazed",
          magicalElement: "光之精灵"
        });
      }
    }
  }
  
  return cards;
}

/**
 * 生成单张图片
 */
export async function generateBuiltinFreeImage(
  prompt: string,
  userInputs: UserInputs
): Promise<GeneratedImageData> {
  
  try {
    console.log(`🎨 生成单张图片: ${prompt.substring(0, 50)}...`);
    
    const imageBase64 = await generateBuiltinFreeImageWithPollinations(
      prompt,
      userInputs.travelMode === 'realistic',
      userInputs.filterStyle
    );
    
    return {
      src: imageBase64,
      imageBase64: imageBase64,
      sceneName: prompt,
      userName: "AI生成器",
      fictionalPlace: userInputs.customDestination || "AI幻境",
      filterApplied: userInputs.filterStyle,
      promptUsed: prompt,
      apiProvider: 'pollinations' as ImageApiProvider
    };
  } catch (error) {
    console.warn(`⚠️ 单张图片生成失败，使用占位图片:`, error);
    const translatedPrompt = translateChineseToEnglish(prompt);
    
    return {
      src: '',
      imageBase64: '',
      sceneName: prompt,
      userName: "AI生成器",
      fictionalPlace: userInputs.customDestination || "AI幻境",
      filterApplied: userInputs.filterStyle,
      promptUsed: translatedPrompt,
      apiProvider: 'pollinations' as const
    };
  }
}

/**
 * 生成虚假评论
 */
export async function generateBuiltinFreeComments(
  scenario: GeneratedScenario | null,
  itinerary: GeneratedRealisticItinerary | null,
  userInputs: UserInputs
): Promise<FakeComment[]> {
  const isRealistic = userInputs.travelMode === 'realistic';
  const destinationName = isRealistic ? itinerary?.destinationName : scenario?.destinationName;
  
  const baseComments = [
    "哇，这个地方太美了！",
    "我也想去这里旅行！",
    "楼主的照片拍得真棒",
    "收藏了，下次一定要去",
    "看起来就很治愈呢",
    "这是什么神仙地方",
    "已经加入我的旅行清单了",
    "太羡慕了！"
  ];
  
  return baseComments.map((content, index) => ({
    id: `comment-${Date.now()}-${index}`,
    userName: `旅行爱好者${index + 1}`,
    content,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  }));
}

/**
 * 生成增强版现实视频脚本
 */
export async function generateRealisticVideoScriptEnhanced(
  itinerary: GeneratedRealisticItinerary,
  contentStyle: string = '一般'
): Promise<GeneratedVideoScript> {
  const activities = itinerary.dailyPlans?.[0]?.activities || [];
  
  const scenes = activities.map((activity, index) => ({
    shot: `${activity.name}：${activity.description}`,
    duration_seconds: 5 + Math.floor(Math.random() * 5),
    audio_visual_notes: `在${activity.addressOrArea}拍摄，突出${activity.type}特色`
  }));
  
  return {
    titleSuggestion: `${itinerary.destinationName}${contentStyle}之旅！${itinerary.duration}超详细攻略`,
    scenes,
    dynamicTags: ["旅行攻略", "实用指南", "必去景点", "美食推荐"],
    fakeBulletComments: [
      { time_cue: "00:03", comment: "这个攻略太实用了！" },
      { time_cue: "00:10", comment: "马克一下，准备出发！" },
      { time_cue: "00:15", comment: "楼主的推荐都很靠谱" },
      { time_cue: "00:20", comment: "已经订机票了哈哈" }
    ],
    fakeDataMetrics: "预计播放量: 15万+, 点赞: 1.2万+, 收藏: 3千+"
  };
}

/**
 * 获取内置免费API服务状态
 */
export async function getBuiltinFreeServiceStatus(): Promise<{
  isActive: boolean;
  limitations: string[];
  features: string[];
}> {
  return {
    isActive: true,
    limitations: [
      "基于Pollinations.AI的免费图片生成",
      "固定的内容模板结构",
      "无付费API的高级定制功能"
    ],
    features: [
      "完整的内容生成流程",
      "支持虚拟和现实两种模式",
      "高质量Pollinations.AI图片生成",
      "智能分镜与图片匹配",
      "详细的分镜描述和提示词",
      "多语言中英文转换",
      "丰富的场景模板",
      "奇幻和真实风格自动识别"
    ]
  };
}

/**
 * 根据视频分镜生成对应数量的图片（升级：分镜shot先优化为英文prompt再生成图片）
 * @param videoScript 分镜脚本
 * @param scenario 虚拟场景
 * @param itinerary 真实行程
 * @param userInputs 用户输入
 * @returns 图片数据数组
 */
export async function generateImagesByVideoScenes(
  videoScript: GeneratedVideoScript,
  scenario: GeneratedScenario | null,
  itinerary: GeneratedRealisticItinerary | null,
  userInputs: UserInputs
): Promise<GeneratedImageData[]> {
  const isRealistic = userInputs.travelMode === 'realistic';
  const destinationName = isRealistic ? itinerary?.destinationName : scenario?.destinationName;
  const imagePromises = videoScript.scenes.map(async (scene, index) => {
    try {
      // 1. 优化分镜shot为英文prompt
      const optimizedPrompt = optimizePromptForPollinations(
        scene.shot,
        isRealistic,
        userInputs.filterStyle || '自然色彩'
      );
      const { generatePollinationsImageWithRetry } = await import('./pollinationsService');
      let imageBase64 = '';
      if (userInputs.uploadedImageBase64) {
        imageBase64 = await generatePollinationsImageWithRetry(optimizedPrompt, {
          width: 1024,
          height: 1024,
          model: 'flux',
          enhance: true,
          nologo: true,
        });
      } else {
        imageBase64 = await generatePollinationsImageWithRetry(optimizedPrompt, {
          width: 1024,
          height: 1024,
          model: 'flux',
          enhance: true,
          nologo: true
        });
      }
      return {
        src: imageBase64,
        imageBase64: imageBase64,
        sceneName: `分镜${index + 1}`,
        userName: isRealistic ? "旅行达人" : "幻境探索者",
        fictionalPlace: isRealistic ? undefined : destinationName,
        realPlaceContext: isRealistic ? destinationName : undefined,
        filterApplied: userInputs.filterStyle,
        promptUsed: optimizedPrompt,
        apiProvider: 'pollinations' as ImageApiProvider
      };
    } catch (error) {
      return {
        src: '',
        imageBase64: '',
        sceneName: `分镜${index + 1}`,
        userName: isRealistic ? "旅行达人" : "幻境探索者",
        fictionalPlace: isRealistic ? undefined : destinationName,
        realPlaceContext: isRealistic ? destinationName : undefined,
        filterApplied: userInputs.filterStyle,
        promptUsed: scene.shot,
        apiProvider: 'pollinations' as ImageApiProvider
      };
    }
  });
  return Promise.all(imagePromises);
}

export default {
  generateBuiltinFreeScenario,
  generateBuiltinFreeItinerary,
  generateBuiltinFreeSocialMediaCopy,
  generateBuiltinFreeVideoScript,
  generateBuiltinFreeImagesByScenes,
  generateRealisticImagesByItinerary,
  generateImagesByVideoScenes,
  generateTravelReflectionCards,
  generateBuiltinFreeImage,
  generateBuiltinFreeComments,
  generateRealisticVideoScriptEnhanced,
  getBuiltinFreeServiceStatus
};
import type { ImageApiProvider } from './types'; 

export const FICTIONAL_THEME_OPTIONS: string[] = [
  "蒸汽朋克废墟探险",
  "精灵秘境治愈之旅",
  "暗黑童话森林",
  "未来都市废土拾荒",
  "深海赛博朋克都市",
  "星际游牧部落",
  "时间裂缝考古",
  "浮空岛屿链生态考察",
  "🌌 全宇宙神话巡礼",
  "🌟 跨维度神界探索",
  "⚡ 全神话传说穿越",
  "🔮 多元宇宙神话融合",
  "🌈 全球神话文明集萃",
  "🎭 千年神话史诗重现",
];

export const FICTIONAL_DURATION_OPTIONS: string[] = [
  "1 天的闪电之旅",
  "3 天 2 夜的深度体验",
  "5 天 4 夜的沉浸探索",
  "7 天的史诗冒险",
  "🌌 跨时空永恒之旅",
  "自定义时长...", 
];

export const FICTIONAL_PERSONA_OPTIONS: string[] = [
  "孤独的摄影博主",
  "寻找灵感的科幻小说作家",
  "记录见闻的吟游诗人",
  "热衷探险的情侣搭档",
  "研究异星文化的学者",
  "追寻传说的宝藏猎人",
  "🌟 全知全能的宇宙观察者",
  "⚡ 穿越诸界的神话使者",
];

export const REALISTIC_THEME_OPTIONS: string[] = [
  "历史文化探索",
  "自然风光摄影",
  "美食寻味之旅",
  "城市休闲漫步",
  "海滨度假胜地",
  "户外徒步探险",
  "主题乐园畅游",
  "自驾公路旅行",
  "温泉疗养放松",
  "博物馆与艺术馆巡礼",
  "🌍 全球文明古迹巡礼",
  "🌎 世界七大洲探索",
  "🌏 环球自然奇观之旅",
  "🗺️ 跨国文化体验",
  "✈️ 全球美食寻根",
  "🏔️ 世界极地探险",
];

export const REALISTIC_DURATION_OPTIONS: string[] = [
  "周末短假 (2天1夜)",
  "小长假悠游 (3天2夜)",
  "标准周游 (5天4夜)",
  "黄金周深度行 (7天6夜)",
  "两周慢旅行 (14天)",
  "🌍 环球之旅 (1个月)",
  "🗺️ 洲际深度游 (3个月)",
  "自定义时长...",
];

export const REALISTIC_PERSONA_OPTIONS: string[] = [
  "独自旅行的探索者",
  "甜蜜出行的情侣/夫妻",
  "欢乐亲子家庭团 (带小孩)",
  "与朋友结伴的小分队",
  "预算有限的背包客/学生",
  "追求舒适的休闲度假者",
  "资深摄影爱好者",
  "标准吃货美食家",
  "商务差旅人士 (顺道游玩)",
  "活力满满的退休银发族",
  "🌍 环球旅行达人",
  "✈️ 数字游牧民族",
  "🗺️ 文化交流使者",
  "🎒 极限挑战冒险家",
  "📚 世界文明研究者",
];

export const FILTER_STYLE_OPTIONS: string[] = [
  "无滤镜 (真实色彩)",
  "赛博朋克霓虹",
  "宫崎骏水彩",
  "复古胶片质感",
  "黑白电影经典",
  "油画浓郁笔触",
  "低多边形抽象",
  "蒸汽波故障艺术",
  "清新日系风格",
  "LOMO暗角效果",
];

export const CONTENT_STYLE_OPTIONS: string[] = [
  "简介",
  "一般", 
  "详细",
  "复杂"
];

export const IMAGE_API_PROVIDER_OPTIONS: { value: ImageApiProvider; label: string }[] = [
  { value: 'gemini', label: 'Google Gemini (内置)' },
  { value: 'deepai_real', label: 'DeepAI API (真实调用)' },
  { value: 'jiemeng_simulated', label: '即梦 API (模拟)' },
  { value: 'deepseek_simulated', label: 'DeepSeek API (模拟)' },
  { value: 'tongyi_simulated', label: '通义千问 API (模拟)' },
  { value: 'doubao_simulated', label: '豆包 API (模拟)' },
  { value: 'custom', label: '其他自定义API (模拟)' },
];

export const DEFAULT_USER_NAME = "旅行梦想家";
export const FALLBACK_IMAGE_URL = "https://picsum.photos/seed/fallback/600/400"; 

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002";
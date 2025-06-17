import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Camera, BookOpen, Coffee, Heart, Star, Zap, Users, Globe } from 'lucide-react';

interface LoadingSpinnerProps {
  /** 当前生成步骤 */
  currentStep?: string;
  /** 总步骤数 */
  totalSteps?: number;
  /** 当前步骤索引 */
  currentStepIndex?: number;
  /** 是否为虚拟模式 */
  isVirtual?: boolean;
}

/**
 * 增强版加载动画组件 - 带有丰富互动元素
 * 通过多种用户参与方式消除等待焦虑
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  currentStep = "正在生成内容...", 
  totalSteps = 8,
  currentStepIndex = 0,
  isVirtual = true
}) => {
  const [funFacts, setFunFacts] = useState<string[]>([]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [userClicks, setUserClicks] = useState(0);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [collectedStars, setCollectedStars] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(45);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [userPreference, setUserPreference] = useState('');

  // 趣味知识库
  const virtualFunFacts = [
    "🌟 古代传说中，仙境的时间流速与人间不同，一天等于人间一年",
    "🐉 在中国神话中，龙宫有七十二层，每层都有不同的奇景",
    "🌸 传说中的桃花源，桃花永远不会凋谢，代表着永恒的美好",
    "⭐ 昆仑山被称为万山之祖，是连接天地的神秘之地",
    "🦋 庄子梦蝶的故事告诉我们，梦境与现实的边界有时很模糊",
    "🌙 嫦娥奔月后，月宫中只有玉兔陪伴，象征着美丽的孤独",
    "🏔️ 蓬莱仙岛据说只有有缘人才能看到，象征着可遇不可求的机缘",
    "🌊 传说中的水晶宫有可以映照内心的魔法镜子",
    "🎋 仙界的竹林能够奏出天籁之音，净化灵魂",
    "🌺 九天玄女的花园中，每朵花都代表着不同的美德",
    "⚡ 北欧神话中，彩虹桥比弗罗斯特连接人间与神域阿斯加德",
    "🦄 独角兽在西方传说中象征纯洁与神秘，只会出现在心灵纯净的人面前",
    "🦅 凤凰在中国与古埃及神话中都象征重生与不朽",
    "🏝️ 亚特兰蒂斯是传说中高度发达却神秘消失的海底文明",
    "🧚‍♀️ 精灵之森在西方奇幻中是魔法生物的家园，四季常青",
    "🗻 须弥山在印度神话中是世界的中心，众神居住之地",
    "🦀 希腊神话中，赫拉克勒斯曾捕捉金羊毛，经历十二项伟业",
    "🦋 玛雅神话中，羽蛇神掌管风雨与智慧，守护着金字塔",
    "🦉 北欧诸神黄昏预言了神与巨人的终极大战，世界重生",
    "🦢 俄罗斯童话中，天鹅公主能在月光下变成人形",
    "🦌 日本神话的八岐大蛇有八个头，被须佐之男斩杀救出公主",
    "🦀 埃及神话中，太阳神拉每天乘船穿越冥界，带来昼夜更替",
    "🦢 凯尔特神话的阿瓦隆岛是英雄最终的归宿，永远春天",
    "🦄 龙在中西方文化中形象各异，东方为祥瑞，西方为力量与挑战",
    "🦋 传说中的时空之门可通往平行世界，开启无限冒险",
    "🦉 伏羲画卦，八卦演化万物，揭示天地奥秘",
    "🦢 女娲补天，炼石补天拯救苍生，象征大爱与创造",
    "🦄 精灵女王加拉德瑞尔守护着魔法森林洛丝罗瑞恩（托尔金奇幻）",
    "🦋 传说中的仙山琼阁，云雾缭绕，仙人居住，世外桃源",
    "🦉 龙母丹妮莉丝驾驭三条巨龙，征战七国（权力的游戏）",
    "🦢 传说中，仙鹤是长寿与吉祥的象征，常伴仙人左右",
    "🦄 诸神的宝藏隐藏在彩虹尽头，只有勇者能找到",
    "🦋 传说中的魔法水晶可实现心愿，但需付出代价",
    "🦉 仙界的时间与人间不同，短暂一梦已是百年",
    "🦢 传说中，仙女下凡会遗落羽衣，凡人拾得可与仙结缘",
    "🦄 世界树伊格德拉希尔连接九大世界，根系深植于宇宙（北欧神话）",
    "🦋 传说中的月光湖能映照前世今生，揭示命运之谜",
    "🦉 仙境之门只在流星雨夜短暂开启，错过需再等百年",
    "🦢 传说中，仙人可御剑飞行，遨游天地之间",
    "🦄 仙界的花园中，每一朵花都蕴含着一个故事",
    "🦋 传说中的神兽麒麟，祥瑞降世，预示太平盛世",
    "🦉 仙境的彩虹桥连接着不同的世界，通向未知的冒险",
    "🦢 传说中，仙人炼丹可得长生不老之术",
    "🦄 仙界的竹林中，风声如乐，能净化心灵",
    "🦋 传说中的仙山有灵泉，饮之可治百病，返老还童"
  ];

  const realisticFunFacts = [
    "✈️ 世界上最短的航班只需要57秒，连接苏格兰两个小岛",
    "🗺️ 日本有超过6800个岛屿，但只有430个有人居住",
    "🏔️ 珠穆朗玛峰每年增高约4毫米，仍在不断长高",
    "🌊 马尔代夫由1192个珊瑚岛组成，平均海拔只有1.5米",
    "🏰 欧洲有超过45000座城堡，德国占了其中的25000座",
    "🌸 日本的樱花季从南到北需要4个月时间才能完全开遍",
    "🎭 威尼斯面具节始于13世纪，是世界最古老的嘉年华之一",
    "🍕 意大利那不勒斯是披萨的发源地，至今保持传统制作工艺",
    "🌅 冰岛的极光最佳观赏期是9月到3月，需要晴朗无云的夜晚",
    "🏛️ 雅典卫城的帕特农神庙建造时没有使用一根钉子"
  ];

  const motivationalMessages = [
    "✨ 好的内容值得等待，我们正在为您精心雕琢...",
    "🎨 AI正在发挥创造力，每一秒都在完善细节...",
    "🌟 精彩的旅程即将开始，请耐心片刻...",
    "💫 创意正在发酵，马上就有惊喜呈现...",
    "🎭 我们正在编织一个专属于您的故事...",
    "🌈 美好的事物需要时间沉淀，即将完成...",
    "🎪 内容生成的魔法正在施展，请稍等片刻...",
    "🎨 AI画师正在为您创作独一无二的作品..."
  ];

  const userPreferences = [
    "最爱的旅行季节", "梦想的目的地", "旅行必备物品", 
    "最难忘的风景", "最期待的体验", "旅行中的小确幸"
  ];

  // 初始化趣味知识
  useEffect(() => {
    if (isVirtual) {
      // 每次加载时从LEGEND_POOL随机抽取10条
      const shuffled = LEGEND_POOL.sort(() => 0.5 - Math.random());
      setFunFacts(shuffled.slice(0, 10));
    } else {
      setFunFacts(realisticFunFacts);
    }
  }, [isVirtual]);

  // 轮播趣味知识
  useEffect(() => {
    const interval = setInterval(() => {
      if (funFacts.length > 0) {
        setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [funFacts.length]);

  // 时间计数器
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      setEstimatedTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 动态激励消息
  useEffect(() => {
    const messageInterval = setInterval(() => {
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setMotivationalMessage(randomMessage);
    }, 6000);
    return () => clearInterval(messageInterval);
  }, []);

  // 进度计算
  const progress = totalSteps > 0 ? Math.min(((currentStepIndex + 1) / totalSteps) * 100, 100) : 0;

  // 处理互动点击
  const handleInteractiveClick = () => {
    setUserClicks(prev => prev + 1);
    if (userClicks > 0 && userClicks % 5 === 0) {
      setShowMiniGame(true);
      setTimeout(() => setShowMiniGame(false), 3000);
    }
  };

  // 收集星星小游戏
  const handleStarClick = (starId: number) => {
    setCollectedStars(prev => prev + 1);
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 z-50 flex items-start justify-center overflow-y-auto">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/10 to-cyan-600/20 animate-pulse"></div>
        
        {/* 浮动星星 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-ping opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* 流动光线 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center px-6 py-8 min-h-screen flex flex-col justify-center">
        {/* 主标题 */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 mb-4 md:mb-6">
            {isVirtual ? '🌌 正在编织奇幻世界' : '🌍 正在规划梦想之旅'}
          </h2>
          
          {/* 动态激励消息 */}
          <p className="text-slate-300 text-lg md:text-xl mb-4 animate-pulse">
            {motivationalMessage || "AI正在发挥创意，为您生成精彩内容..."}
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-slate-400 text-sm md:text-base lg:text-lg">当前步骤: {currentStep}</span>
            <span className="text-slate-400 text-sm md:text-base lg:text-lg">{Math.round(progress)}%</span>
          </div>
          
          {/* 进度条 */}
          <div className="w-full bg-slate-700/50 rounded-full h-3 md:h-4 mb-4 md:mb-6 overflow-hidden shadow-lg">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
            </div>
          </div>
          
          {/* 时间信息 */}
          <div className="flex justify-between text-slate-400 text-sm md:text-base">
            <span>已用时间: {formatTime(timeElapsed)}</span>
            <span>预计剩余: {formatTime(estimatedTimeLeft)}</span>
          </div>
        </div>

        {/* 主要加载动画 */}
        <div className="mb-8 md:mb-12 relative">
          <div className="w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 mx-auto mb-6 md:mb-8 relative">
            {/* 外圈旋转 */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
            
            {/* 内圈反向旋转 */}
            <div className="absolute inset-4 border-4 border-transparent border-b-cyan-500 border-l-pink-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
            
            {/* 中心图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isVirtual ? (
                <Sparkles className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-purple-400 animate-pulse" />
              ) : (
                <Globe className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-cyan-400 animate-bounce" />
              )}
            </div>
          </div>
        </div>

        {/* 互动式趣味知识 */}
        <div className="mb-8 md:mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-600/30 shadow-xl">
            <div className="flex items-center justify-center mb-3 md:mb-4">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 mr-2 md:mr-3" />
              <h3 className="text-yellow-400 font-semibold text-base md:text-lg">
                {isVirtual ? '仙境传说' : '旅行冷知识'}
              </h3>
            </div>
            
            {funFacts.length > 0 && (
              <p className="text-slate-300 leading-relaxed animate-fadeIn text-base md:text-lg">
                {funFacts[currentFactIndex]}
              </p>
            )}
            
            <div className="mt-3 md:mt-4 flex justify-center space-x-2">
              {funFacts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentFactIndex ? 'bg-yellow-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 用户互动区域 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* 点击互动 */}
          <div className="bg-slate-800/40 rounded-lg p-4 md:p-6 border border-slate-600/20 shadow-lg">
            <button
              onClick={handleInteractiveClick}
              className="w-full flex flex-col items-center space-y-2 md:space-y-3 hover:scale-105 transition-transform duration-200"
            >
              <Heart className={`w-8 h-8 md:w-10 md:h-10 ${userClicks > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-slate-300 text-sm md:text-base">为创作加油</span>
              <span className="text-cyan-400 text-xs md:text-sm">{userClicks} 次鼓励</span>
            </button>
          </div>

          {/* 收集星星小游戏 */}
          <div className="bg-slate-800/40 rounded-lg p-4 md:p-6 border border-slate-600/20 shadow-lg">
            <div className="flex flex-col items-center space-y-2 md:space-y-3">
              <div className="flex space-x-1 md:space-x-2">
                {[1, 2, 3].map((starId) => (
                  <Star
                    key={starId}
                    className={`w-6 h-6 md:w-8 md:h-8 cursor-pointer transition-all duration-200 hover:scale-110 ${
                      collectedStars >= starId ? 'text-yellow-400 fill-current' : 'text-slate-500'
                    }`}
                    onClick={() => handleStarClick(starId)}
                  />
                ))}
              </div>
              <span className="text-slate-300 text-sm md:text-base">收集幸运星</span>
              <span className="text-yellow-400 text-xs md:text-sm">{collectedStars}/3 颗</span>
            </div>
          </div>

          {/* 期待值调节 */}
          <div className="bg-slate-800/40 rounded-lg p-4 md:p-6 border border-slate-600/20 shadow-lg sm:col-span-2 lg:col-span-1">
            <div className="flex flex-col items-center space-y-2 md:space-y-3">
              <Zap className="w-8 h-8 md:w-10 md:h-10 text-blue-400 animate-bounce" />
              <span className="text-slate-300 text-sm md:text-base">期待指数</span>
              <div className="flex space-x-1 md:space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-4 md:w-3 md:h-6 rounded-sm transition-all duration-300 ${
                      level <= (userClicks % 5) + 1 ? 'bg-blue-400' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 快速投票/偏好选择 */}
        <div className="mb-6 md:mb-8">
          <div className="bg-slate-800/30 rounded-lg p-4 md:p-6 border border-slate-600/20 shadow-lg">
            <div className="flex items-center justify-center mb-3 md:mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-green-400 mr-2 md:mr-3" />
              <span className="text-green-400 font-semibold text-base md:text-lg">快速投票</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {userPreferences.map((pref, index) => (
                <button
                  key={index}
                  onClick={() => setUserPreference(pref)}
                  className={`px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm transition-all duration-200 ${
                    userPreference === pref
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-600/50'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
            
            {userPreference && (
              <p className="mt-3 md:mt-4 text-green-300 text-sm md:text-base">
                ✨ 已记录您的偏好: {userPreference}
              </p>
            )}
          </div>
        </div>

        {/* 迷你游戏弹窗 */}
        {showMiniGame && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
            <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-purple-500/50 text-center animate-bounce max-w-sm w-full">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">🎉</div>
              <h3 className="text-purple-300 font-bold mb-2 md:mb-3 text-lg md:text-xl">太棒了！</h3>
              <p className="text-slate-300 text-sm md:text-base">您的鼓励让AI更有创意了！</p>
            </div>
          </div>
        )}

        {/* 底部提示 */}
        <div className="text-slate-400 text-sm md:text-base pb-8">
          <p className="mb-2 md:mb-3">🎨 AI正在精心制作您的专属内容</p>
          <p className="flex items-center justify-center space-x-4 md:space-x-6 flex-wrap">
            <span className="flex items-center mb-2 md:mb-0">
              <Coffee className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              来杯咖啡的功夫
            </span>
            <span className="flex items-center">
              <Camera className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              准备好记录美好
            </span>
          </p>
        </div>
      </div>

      {/* CSS动画样式 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

/**
 * 仙境传说内容池（中外神话、幻想、历史轶事等）
 * 可用于任何需要随机展示传说的模块
 */
export const LEGEND_POOL = [
  "🌟 古代传说中，仙境的时间流速与人间不同，一天等于人间一年",
  "🐉 在中国神话中，龙宫有七十二层，每层都有不同的奇景",
  "🌸 传说中的桃花源，桃花永远不会凋谢，代表着永恒的美好",
  "⭐ 昆仑山被称为万山之祖，是连接天地的神秘之地",
  "🦋 庄子梦蝶的故事告诉我们，梦境与现实的边界有时很模糊",
  "🌙 嫦娥奔月后，月宫中只有玉兔陪伴，象征着美丽的孤独",
  "🏔️ 蓬莱仙岛据说只有有缘人才能看到，象征着可遇不可求的机缘",
  "🌊 传说中的水晶宫有可以映照内心的魔法镜子",
  "🎋 仙界的竹林能够奏出天籁之音，净化灵魂",
  "🌺 九天玄女的花园中，每朵花都代表着不同的美德",
  "⚡ 北欧神话中，彩虹桥比弗罗斯特连接人间与神域阿斯加德",
  "🦄 独角兽在西方传说中象征纯洁与神秘，只会出现在心灵纯净的人面前",
  "🦅 凤凰在中国与古埃及神话中都象征重生与不朽",
  "🏝️ 亚特兰蒂斯是传说中高度发达却神秘消失的海底文明",
  "🧚‍♀️ 精灵之森在西方奇幻中是魔法生物的家园，四季常青",
  "🗻 须弥山在印度神话中是世界的中心，众神居住之地",
  "🦀 希腊神话中，赫拉克勒斯曾捕捉金羊毛，经历十二项伟业",
  "🦋 玛雅神话中，羽蛇神掌管风雨与智慧，守护着金字塔",
  "🦉 北欧诸神黄昏预言了神与巨人的终极大战，世界重生",
  "🦢 俄罗斯童话中，天鹅公主能在月光下变成人形",
  "🦌 日本神话的八岐大蛇有八个头，被须佐之男斩杀救出公主",
  "🦀 埃及神话中，太阳神拉每天乘船穿越冥界，带来昼夜更替",
  "🦢 凯尔特神话的阿瓦隆岛是英雄最终的归宿，永远春天",
  "🦄 龙在中西方文化中形象各异，东方为祥瑞，西方为力量与挑战",
  "🦋 传说中的时空之门可通往平行世界，开启无限冒险",
  "🦉 伏羲画卦，八卦演化万物，揭示天地奥秘",
  "🦢 女娲补天，炼石补天拯救苍生，象征大爱与创造",
  "🦄 精灵女王加拉德瑞尔守护着魔法森林洛丝罗瑞恩（托尔金奇幻）",
  "🦋 传说中的仙山琼阁，云雾缭绕，仙人居住，世外桃源",
  "🦉 龙母丹妮莉丝驾驭三条巨龙，征战七国（权力的游戏）",
  "🦢 传说中，仙鹤是长寿与吉祥的象征，常伴仙人左右",
  "🦄 诸神的宝藏隐藏在彩虹尽头，只有勇者能找到",
  "🦋 传说中的魔法水晶可实现心愿，但需付出代价",
  "🦉 仙界的时间与人间不同，短暂一梦已是百年",
  "🦢 传说中，仙女下凡会遗落羽衣，凡人拾得可与仙结缘",
  "🦄 世界树伊格德拉希尔连接九大世界，根系深植于宇宙（北欧神话）",
  "🦋 传说中的月光湖能映照前世今生，揭示命运之谜",
  "🦉 仙境之门只在流星雨夜短暂开启，错过需再等百年",
  "🦢 传说中，仙人可御剑飞行，遨游天地之间",
  "🦄 仙界的花园中，每一朵花都蕴含着一个故事",
  "🦋 传说中的神兽麒麟，祥瑞降世，预示太平盛世",
  "🦉 仙境的彩虹桥连接着不同的世界，通向未知的冒险",
  "🦢 传说中，仙人炼丹可得长生不老之术",
  "🦄 仙界的竹林中，风声如乐，能净化心灵",
  "🦋 传说中的仙山有灵泉，饮之可治百病，返老还童",
  // 可持续扩充...
];

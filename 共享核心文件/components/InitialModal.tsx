import React, { useState, useEffect, useCallback } from 'react';
import type { UserInputs, TravelMode, ContentStyle } from '../types';
import { 
  FICTIONAL_THEME_OPTIONS, 
  FICTIONAL_DURATION_OPTIONS, 
  FICTIONAL_PERSONA_OPTIONS, 
  REALISTIC_THEME_OPTIONS,
  REALISTIC_DURATION_OPTIONS,
  REALISTIC_PERSONA_OPTIONS,
  FILTER_STYLE_OPTIONS,
  CONTENT_STYLE_OPTIONS
} from '../constants';
import { X, Upload, CheckCircle, AlertCircle, Loader2, Camera, Globe, Sparkles, MapPin, Clock, User, Palette, FileText, Image, Plane, Mountain, Sunset, LogOut } from 'lucide-react';

interface InitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inputs: UserInputs) => void;
  travelMode: 'fictional' | 'realistic';
  onExit?: () => void;
}

/**
 * 初始化模态框组件 - 精美旅行风格设计
 * 提供沉浸式的旅行参数配置界面
 */
export const InitialModal: React.FC<InitialModalProps> = ({ isOpen, onClose, onSubmit, travelMode, onExit }) => {
  const [theme, setTheme] = useState<string>(FICTIONAL_THEME_OPTIONS[0]);
  const [duration, setDuration] = useState<string>(FICTIONAL_DURATION_OPTIONS[0]);
  const [persona, setPersona] = useState<string>(FICTIONAL_PERSONA_OPTIONS[0]);
  const [filterStyle, setFilterStyle] = useState<string>(FILTER_STYLE_OPTIONS[0]);
  const [contentStyle, setContentStyle] = useState<string>(CONTENT_STYLE_OPTIONS[0]);
  
  const [customDestination, setCustomDestination] = useState<string>("");
  const [customDurationValue, setCustomDurationValue] = useState<string>("");
  const [showCustomDurationInput, setShowCustomDurationInput] = useState<boolean>(false);
  
  // 添加预设目的地选择状态
  const [presetDestination, setPresetDestination] = useState<string>("");

  // 图片上传相关状态 - 极简版本，与测试页面保持一致
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');

  // 清理图片状态
  const clearImageData = useCallback(() => {
    console.log("🧹 清理图片数据");
    setImageFile(null);
    setImageDataUrl('');
    setImageBase64('');
    setImageMimeType('');
    setImageError('');
    
    // 清理文件输入框
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  // 🎯 图片上传处理函数 - 最简化版本，绝对可靠
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🚀 图片上传事件触发！", new Date().toLocaleTimeString());
    
    const file = event.target.files?.[0];
    console.log("📁 选中的文件:", file);
    
    if (!file) {
      console.log("❌ 没有文件被选择");
      clearImageData();
      return;
    }

    console.log("📸 文件详情:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // 简单验证
    if (!file.type.startsWith('image/')) {
      console.error("❌ 不是图片文件:", file.type);
      setImageError('请选择图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error("❌ 文件太大:", file.size);
      setImageError('文件不能超过10MB');
      return;
    }

    // 清除错误
    setImageError('');
    setImageFile(file);
    setImageMimeType(file.type);
    
    console.log("✅ 开始创建预览URL和Base64...");
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setImageDataUrl(previewUrl);
    console.log("✅ 预览URL创建成功:", previewUrl);
    
    // 生成Base64
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setImageBase64(base64);
      console.log("✅ Base64生成成功，长度:", base64.length);
    };
    
    reader.onerror = () => {
      console.error("❌ FileReader错误");
      setImageError('文件读取失败');
    };
    
    reader.readAsDataURL(file);
  };

  // 键盘事件监听 - ESC键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        console.log('ESC键按下，关闭模态框');
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (travelMode === 'fictional') {
      setTheme(FICTIONAL_THEME_OPTIONS[0]);
      setDuration(FICTIONAL_DURATION_OPTIONS[0]);
      setPersona(FICTIONAL_PERSONA_OPTIONS[0]);
    } else {
      setTheme(REALISTIC_THEME_OPTIONS[0]);
      setDuration(REALISTIC_DURATION_OPTIONS[0]);
      setPersona(REALISTIC_PERSONA_OPTIONS[0]);
    }
    setCustomDestination("");
    setPresetDestination("");
    setCustomDurationValue("");
    setShowCustomDurationInput(false);
    clearImageData();
  }, [travelMode, clearImageData]);

  useEffect(() => {
    if (duration === "自定义时长...") {
      setShowCustomDurationInput(true);
    } else {
      setShowCustomDurationInput(false);
      setCustomDurationValue("");
    }
  }, [duration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 确定最终使用的目的地：优先使用自定义输入，其次使用预设选择
    const finalDestination = customDestination.trim() || presetDestination || undefined;
    
    const finalInputs: UserInputs = {
      theme,
      duration,
      persona,
      filterStyle,
      contentStyle: contentStyle as ContentStyle,
      travelMode,
      customDestination: finalDestination,
      uploadedImageBase64: imageBase64 || undefined,
      uploadedImageMimeType: imageMimeType || undefined,
    };
    if (duration === "自定义时长..." && customDurationValue.trim()) {
      finalInputs.customDurationValue = customDurationValue.trim();
    }
    console.log("📤 提交表单数据:", finalInputs);
    onSubmit(finalInputs);
  };

  const handleClose = () => {
    console.log("🚪 关闭模态框");
    clearImageData();
    onClose();
  };

  // 背景点击关闭
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log("🚪 背景点击，关闭模态框");
      handleClose();
    }
  };

  if (!isOpen) return null;

  const currentThemeOptions = travelMode === 'fictional' ? FICTIONAL_THEME_OPTIONS : REALISTIC_THEME_OPTIONS;
  const currentDurationOptions = travelMode === 'fictional' ? FICTIONAL_DURATION_OPTIONS : REALISTIC_DURATION_OPTIONS;
  const currentPersonaOptions = travelMode === 'fictional' ? FICTIONAL_PERSONA_OPTIONS : REALISTIC_PERSONA_OPTIONS;
  
  const modeConfig = {
    fictional: {
      title: '✨ 虚拟幻境之旅',
      subtitle: '踏入AI创造的神秘奇幻世界，开启一场超越现实的冒险',
      themeGradient: 'from-purple-900 via-blue-900 to-indigo-900',
      accentGradient: 'from-purple-500 via-pink-500 to-blue-500',
      bgPattern: 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100',
      icon: <Sparkles className="w-8 h-8" />,
      decorativeIcon1: <Mountain className="w-6 h-6" />,
      decorativeIcon2: <Sunset className="w-6 h-6" />
    },
    realistic: {
      title: '🌍 真实旅行规划',
      subtitle: '发现世界的美好，享受专业的旅行建议与精心规划的行程',
      themeGradient: 'from-emerald-900 via-teal-900 to-cyan-900',
      accentGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgPattern: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100',
      icon: <Globe className="w-8 h-8" />,
      decorativeIcon1: <Plane className="w-6 h-6" />,
      decorativeIcon2: <MapPin className="w-6 h-6" />
    }
  };

  const config = modeConfig[travelMode];

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackgroundClick}
    >
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-32 h-32 bg-gradient-to-r ${config.accentGradient} rounded-full blur-3xl opacity-20 animate-pulse`}></div>
        <div className={`absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r ${config.accentGradient} rounded-full blur-3xl opacity-20 animate-pulse delay-1000`}></div>
        <div className={`absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r ${config.accentGradient} rounded-full blur-3xl opacity-15 animate-pulse delay-500`}></div>
      </div>

      <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden ${config.bgPattern} border border-white/20 relative`}>
        
        {/* 华丽的头部区域 */}
        <div className={`bg-gradient-to-r ${config.themeGradient} text-white p-8 relative overflow-hidden`}>
          {/* 头部装饰背景 */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          
          {/* 强化的关闭按钮 - 确保在最顶层 */}
          <div className="absolute top-6 right-6 flex items-center space-x-2 z-50">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110 bg-black/20 border border-white/30"
                title="退出应用"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110 bg-black/20 border border-white/30"
              style={{ zIndex: 9999 }}
              title="关闭 (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 bg-gradient-to-r ${config.accentGradient} rounded-2xl shadow-lg`}>
                {config.icon}
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">{config.title}</h1>
                <div className="flex items-center space-x-3 mt-2 text-white/90">
                  {config.decorativeIcon1}
                  <span className="text-lg">{config.subtitle}</span>
                  {config.decorativeIcon2}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 主要内容区域 */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 目的地选择 - 重新设计 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-gradient-to-r ${config.accentGradient} rounded-lg`}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <label className="text-lg font-bold text-gray-800">
                  选择您的梦想目的地
                </label>
              </div>
              <select
                value={presetDestination}
                onChange={(e) => setPresetDestination(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <option value="">
                  {travelMode === 'fictional' ? '🎲 让AI为您创造神秘目的地' : '🤖 AI智能推荐完美目的地'}
                </option>
                {travelMode === 'fictional' ? (
                  <>
                    <option value="九霄云境·仙雾缭绕">🌙 九霄云境·仙雾缭绕</option>
                    <option value="龙宫水晶宫">🐉 龙宫水晶宫</option>
                    <option value="凤凰涅槃台">🔥 凤凰涅槃台</option>
                    <option value="麒麟祥云谷">☁️ 麒麟祥云谷</option>
                    <option value="蓬莱仙岛">🏝️ 蓬莱仙岛</option>
                    <option value="昆仑虚境">⛰️ 昆仑虚境</option>
                    <option value="瑶池圣地">💎 瑶池圣地</option>
                    <option value="天庭云霄">☁️ 天庭云霄</option>
                    <option value="嫦娥月宫">🌕 嫦娥月宫</option>
                    <option value="神农百草园">🌿 神农百草园</option>
                    <optgroup label="🌌 全宇宙神话领域">
                      <option value="奥林匹斯神山">⚡ 奥林匹斯神山 (希腊神话)</option>
                      <option value="阿斯加德神域">🔨 阿斯加德神域 (北欧神话)</option>
                      <option value="杜亚特冥界">🏺 杜亚特冥界 (埃及神话)</option>
                      <option value="须弥山神界">🕉️ 须弥山神界 (印度神话)</option>
                      <option value="高天原神域">⛩️ 高天原神域 (日本神话)</option>
                      <option value="羽蛇神金字塔">🐍 羽蛇神金字塔 (玛雅神话)</option>
                      <option value="万神殿宇宙中心">🌟 万神殿宇宙中心 (跨神话)</option>
                      <option value="创世纪源点">💫 创世纪源点 (原初神话)</option>
                      <option value="诸神黄昏战场">⚔️ 诸神黄昏战场 (末日神话)</option>
                      <option value="时空神话交汇点">🌀 时空神话交汇点 (多维融合)</option>
                    </optgroup>
                  </>
                ) : (
                  <>
                    <option value="北京">🏛️ 北京 - 历史文化之都</option>
                    <option value="上海">🏙️ 上海 - 现代都市风采</option>
                    <option value="杭州">🏞️ 杭州 - 人间天堂</option>
                    <option value="苏州">🏘️ 苏州 - 园林水乡</option>
                    <option value="成都">🍜 成都 - 美食之都</option>
                    <option value="重庆">🍲 重庆 - 山城火锅</option>
                    <option value="西安">🏺 西安 - 古都长安</option>
                    <option value="南京">🏯 南京 - 六朝古都</option>
                    <option value="厦门">🌊 厦门 - 海上花园</option>
                    <option value="青岛">🍺 青岛 - 海滨风情</option>
                    <optgroup label="🌍 全球热门目的地">
                      <option value="巴黎">🗼 巴黎 - 浪漫之都</option>
                      <option value="伦敦">🏰 伦敦 - 雾都风情</option>
                      <option value="罗马">🏛️ 罗马 - 永恒之城</option>
                      <option value="纽约">🗽 纽约 - 不夜之城</option>
                      <option value="东京">🗾 东京 - 现代与传统</option>
                      <option value="首尔">🏙️ 首尔 - 韩流之都</option>
                      <option value="曼谷">🍜 曼谷 - 微笑之国</option>
                      <option value="新德里">🕌 新德里 - 古老印度</option>
                      <option value="伊斯坦布尔">🕌 伊斯坦布尔 - 欧亚桥梁</option>
                      <option value="开罗">🏺 开罗 - 法老之地</option>
                      <option value="悉尼">🏄‍♂️ 悉尼 - 南半球明珠</option>
                      <option value="里约热内卢">🎭 里约热内卢 - 狂欢之城</option>
                      <option value="开普敦">🦁 开普敦 - 非洲之角</option>
                      <option value="冰岛雷克雅未克">🌋 冰岛雷克雅未克 - 极光之地</option>
                      <option value="马尔代夫">🏝️ 马尔代夫 - 人间天堂</option>
                    </optgroup>
                    <optgroup label="🗺️ 环球探险路线">
                      <option value="环太平洋探索">🌊 环太平洋探索路线</option>
                      <option value="欧亚大陆横穿">🚂 欧亚大陆横穿之旅</option>
                      <option value="非洲大陆纵贯">🦒 非洲大陆纵贯冒险</option>
                      <option value="南美洲自然奇观">🦜 南美洲自然奇观之旅</option>
                      <option value="北极圈极地探险">🐻‍❄️ 北极圈极地探险</option>
                      <option value="七大洲全景游">🌍 七大洲全景巡礼</option>
                    </optgroup>
                  </>
                )}
              </select>
            </div>

            {/* 自定义目的地输入框 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-gradient-to-r ${config.accentGradient} rounded-lg`}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <label className="text-lg font-bold text-gray-800">
                  自定义目的地
                </label>
              </div>
              <input
                type="text"
                value={customDestination}
                onChange={(e) => setCustomDestination(e.target.value)}
                placeholder={travelMode === 'fictional' 
                  ? "例如：九霄云境、龙宫水晶宫、蓬莱仙岛..." 
                  : "例如：巴黎、东京、马尔代夫..."
                }
                className="w-full p-4 border-2 border-gray-400 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white text-gray-900 font-semibold placeholder-gray-600 shadow-lg transition-all duration-300 hover:border-gray-500 hover:shadow-xl text-base"
              />
            </div>

            {/* 三列网格布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 主题风格 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 bg-gradient-to-r ${config.accentGradient} rounded-lg`}>
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-lg font-semibold text-white">主题风格</label>
                </div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white text-gray-900 font-semibold shadow-lg transition-all duration-300 hover:border-gray-500 text-base"
                >
                  {currentThemeOptions.map((option) => (
                    <option key={option} value={option} className="text-gray-900 font-semibold py-2 bg-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* 旅行时长 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 bg-gradient-to-r ${config.accentGradient} rounded-lg`}>
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-lg font-semibold text-white">旅行时长</label>
                </div>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white text-gray-900 font-semibold shadow-lg transition-all duration-300 hover:border-gray-500 text-base"
                >
                  {currentDurationOptions.map((option) => (
                    <option key={option} value={option} className="text-gray-900 font-semibold py-2 bg-white">
                      {option}
                    </option>
                  ))}
                </select>
                {showCustomDurationInput && (
                  <input
                    type="text"
                    value={customDurationValue}
                    onChange={(e) => setCustomDurationValue(e.target.value)}
                    placeholder="例如：5天4夜、一个月..."
                    className="w-full p-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white text-gray-900 font-semibold placeholder-gray-600 shadow-lg transition-all duration-300 hover:border-gray-500 text-base"
                  />
                )}
              </div>

              {/* 旅行者身份 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 bg-gradient-to-r ${config.accentGradient} rounded-lg`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-lg font-semibold text-white">旅行者身份</label>
                </div>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full p-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white text-gray-900 font-semibold shadow-lg transition-all duration-300 hover:border-gray-500 text-base"
                >
                  {currentPersonaOptions.map((option) => (
                    <option key={option} value={option} className="text-gray-900 font-semibold py-2 bg-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 双列布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 图片滤镜 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 bg-gradient-to-r ${config.accentGradient} rounded-lg`}>
                    <Image className="w-4 h-4 text-white" />
                  </div>
                  <label className="font-semibold text-gray-800">图片滤镜</label>
                </div>
                <select
                  value={filterStyle}
                  onChange={(e) => setFilterStyle(e.target.value)}
                  className="w-full p-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white text-gray-900 font-semibold shadow-lg transition-all duration-300 hover:border-gray-500 text-base"
                >
                  {FILTER_STYLE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="text-gray-900 font-semibold py-2 bg-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* 文案详细程度 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 bg-gradient-to-r ${config.accentGradient} rounded-lg`}>
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <label className="font-semibold text-gray-800">文案详细程度</label>
                </div>
                <select
                  value={contentStyle}
                  onChange={(e) => setContentStyle(e.target.value as ContentStyle)}
                  className="w-full p-4 border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white text-gray-900 font-semibold shadow-lg transition-all duration-300 hover:border-gray-500 text-base"
                >
                  {CONTENT_STYLE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="text-gray-900 font-semibold py-2 bg-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 精美的图片上传区域 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 bg-gradient-to-r ${config.accentGradient} rounded-lg`}>
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <label className="font-semibold text-gray-800">
                  上传个人照片 <span className="text-gray-500 font-normal">(可选)</span>
                </label>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  onFocus={() => console.log("🎯 文件输入框获得焦点！")}
                  onInput={(e) => console.log("📝 文件输入框输入事件！", e)}
                  className="hidden"
                />
                
                {/* 图片预览或上传区域 */}
                {imageDataUrl ? (
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
                      <img
                        src={imageDataUrl}
                        alt="预览图片"
                        className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                        onLoad={() => {
                          console.log("✅ 图片加载成功，URL:", imageDataUrl);
                        }}
                        onError={(e) => {
                          console.error("❌ 图片加载失败，URL:", imageDataUrl);
                          console.error("错误事件:", e);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={clearImageData}
                          className="bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          <X className="w-5 h-5" />
                          <span>移除图片</span>
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>{imageFile?.name}</span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {Math.round((imageFile?.size || 0) / 1024)}KB
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="imageUpload"
                    className={`flex flex-col items-center justify-center w-full h-40 border-3 border-dashed rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      imageError
                        ? 'border-red-400 bg-red-50/50 backdrop-blur-sm'
                        : 'border-gray-300 bg-gray-50/50 backdrop-blur-sm hover:bg-gray-100/50 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {imageError ? (
                        <>
                          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                          <p className="text-red-600 font-semibold text-lg">上传失败</p>
                          <p className="text-red-500 text-sm text-center">{imageError}</p>
                        </>
                      ) : (
                        <>
                          <div className={`p-4 bg-gradient-to-r ${config.accentGradient} rounded-2xl mb-4 shadow-lg`}>
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-gray-700 font-semibold text-lg mb-2">点击选择您的照片</p>
                          <p className="text-gray-500 text-sm text-center">
                            支持 JPG、PNG、GIF、WebP 格式<br/>
                            文件大小不超过 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>
            
            <div className={`p-4 bg-gradient-to-r ${config.accentGradient} rounded-xl text-white shadow-lg`}>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold mb-1">个性化提示</p>
                  <p className="text-white/90 text-sm">
                    {travelMode === 'fictional' 
                      ? '上传您的照片，AI将为您创造专属的虚幻世界角色，让您成为奇幻故事的主角！' 
                      : '上传您的照片，AI将为您量身定制真实的旅行体验，制作专属的旅行视频脚本！'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* 华丽的提交按钮 */}
            <div className="pt-6">
              <button
                type="submit"
                className={`w-full py-6 px-8 bg-gradient-to-r ${config.themeGradient} text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/30 relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {travelMode === 'fictional' ? <Sparkles className="w-6 h-6" /> : <Plane className="w-6 h-6" />}
                  </div>
                  <span>
                    {travelMode === 'fictional' ? '🌟 启动奇幻冒险之旅' : '✈️ 开始我的梦想旅程'}
                  </span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
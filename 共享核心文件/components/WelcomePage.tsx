import React, { useState, useEffect } from 'react';
import { Compass, Star, Map, Globe, Sparkles, ArrowRight, Play, Camera, MapPin, Plane, Mountain, Sunset, Calendar, Users, Heart } from 'lucide-react';

interface WelcomePageProps {
  onContinue: (functionType: 'virtual' | 'real') => void;
}

/**
 * 精美的欢迎页组件 - 专业旅行应用风格
 * 沉浸式的首页体验，展示旅行的魅力与可能性
 * 优化布局，确保在所有屏幕尺寸下完美显示
 */
export const WelcomePage: React.FC<WelcomePageProps> = ({ onContinue }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  useEffect(() => {
    // 页面渐入动画
    const timer1 = setTimeout(() => setIsVisible(true), 300);
    const timer2 = setTimeout(() => setShowContent(true), 800);
    
    // 自动切换特色功能展示
    const featureTimer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(featureTimer);
    };
  }, []);

  const features = [
    { icon: Camera, text: "智能内容生成", color: "text-yellow-400" },
    { icon: MapPin, text: "个性化行程规划", color: "text-blue-400" },
    { icon: Users, text: "社交媒体优化", color: "text-green-400" },
    { icon: Heart, text: "情感化体验设计", color: "text-pink-400" }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 overflow-auto">
      {/* 高级背景 - 旅行主题 */}
      <div className="absolute inset-0">
        {/* 地球背景图 */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="earthGradient" cx="50%" cy="40%" r="30%">
                <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.8}} />
                <stop offset="50%" style={{stopColor: '#1e40af', stopOpacity: 0.6}} />
                <stop offset="100%" style={{stopColor: '#1e3a8a', stopOpacity: 0.4}} />
              </radialGradient>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#0f172a', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#1e293b', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            
            {/* 天空背景 */}
            <rect width="100%" height="100%" fill="url(#skyGradient)" />
            
            {/* 地球轮廓 */}
            <circle cx="960" cy="540" r="300" fill="url(#earthGradient)" />
            
            {/* 大陆轮廓 - 简化的世界地图 */}
            <g opacity="0.6">
              {/* 亚洲 */}
              <path d="M1000,400 Q1050,420 1100,450 Q1120,480 1080,520 Q1040,540 1000,500 Q980,450 1000,400" fill="#60a5fa" />
              {/* 欧洲 */}
              <path d="M900,420 Q920,440 940,460 Q930,480 900,470 Q880,450 900,420" fill="#60a5fa" />
              {/* 非洲 */}
              <path d="M920,480 Q950,520 970,580 Q940,620 910,580 Q900,520 920,480" fill="#60a5fa" />
              {/* 美洲 */}
              <path d="M800,460 Q820,480 840,520 Q850,560 830,600 Q810,580 790,540 Q780,500 800,460" fill="#60a5fa" />
            </g>
            
            {/* 航线和飞机轨迹 */}
            <g opacity="0.8">
              <path d="M700,300 Q850,250 1000,300 Q1150,350 1300,300" stroke="#fbbf24" strokeWidth="2" fill="none" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M600,600 Q800,550 1000,600 Q1200,650 1400,600" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" values="0;-10" dur="3s" repeatCount="indefinite" />
              </path>
            </g>
            
            {/* 飞机图标 */}
            <g transform="translate(850, 250)" opacity="0.9">
              <Plane className="w-6 h-6 text-yellow-400" style={{transform: 'rotate(45deg)'}} />
            </g>
            <g transform="translate(1200, 650)" opacity="0.9">
              <Plane className="w-6 h-6 text-orange-400" style={{transform: 'rotate(-45deg)'}} />
            </g>
          </svg>
        </div>
        
        {/* 动态装饰元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 漂浮的旅行图标 */}
          {[...Array(12)].map((_, i) => {
            const icons = [Mountain, Camera, MapPin, Calendar, Globe, Star];
            const Icon = icons[i % icons.length];
            return (
              <div
                key={`travel-icon-${i}`}
                className="absolute opacity-20"
                style={{
                  left: `${10 + (i * 8)}%`,
                  top: `${10 + (i * 7)}%`,
                  animationDelay: `${i * 0.5}s`,
                  animation: 'floatSlow 20s ease-in-out infinite'
                }}
              >
                <Icon className="w-8 h-8 text-blue-300" />
              </div>
            );
          })}
          
          {/* 光点效果 */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`light-${i}`}
              className="absolute rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 6}px`,
                height: `${2 + Math.random() * 6}px`,
                animationDelay: `${Math.random() * 10}s`,
                animation: 'twinkle 8s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* 主要内容区域 - 优化布局 */}
      <div className={`relative z-10 flex flex-col items-center justify-start min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-all duration-2000 ease-out ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
      }`}>
        
        {/* 品牌标题区域 - 响应式优化 */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-6xl mx-auto">
          {/* Logo组合 - 响应式调整 */}
          <div className={`flex items-center justify-center space-x-3 sm:space-x-4 lg:space-x-6 mb-6 sm:mb-8 transition-all duration-1500 ${
            showContent ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-110'
          }`}>
            <div className="relative">
              <Compass className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-blue-400 animate-spin-slow" />
              <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse"></div>
            </div>
            <div className="h-10 sm:h-12 lg:h-16 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full"></div>
            <div className="relative">
              <Globe className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 text-purple-400 animate-bounce" />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div className="h-10 sm:h-12 lg:h-16 w-1 bg-gradient-to-b from-purple-400 via-pink-400 to-cyan-400 rounded-full"></div>
            <div className="relative">
              <Mountain className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-cyan-400" />
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse delay-1000"></div>
            </div>
          </div>
          
          {/* 主标题 - 响应式字体 */}
          <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-4 sm:mb-6 transition-all duration-1500 ${
            showContent ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-110'
          }`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 animate-gradient-x">
              幻境之旅
            </span>
          </h1>
          
          {/* 副标题 - 响应式调整 */}
          <div className={`space-y-3 sm:space-y-4 transition-all duration-1500 delay-300 ${
            showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-5'
          }`}>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-slate-200">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                AI 驱动的智能旅行生成器
              </span>
            </h2>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base lg:text-lg text-slate-300">
              <span>✨ 个性化</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>🎯 智能化</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>🚀 创新性</span>
            </div>
          </div>
          
          {/* 描述文字 - 响应式调整 */}
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mt-6 sm:mt-8 px-4 transition-all duration-1500 delay-500 ${
            showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-5'
          }`}>
            踏上探索之旅，发现无限可能的世界。无论是充满奇幻色彩的虚拟幻境，
            还是真实存在的绝美目的地，让AI为您量身定制专属的旅行体验与创意内容。
          </p>
        </div>
        
        {/* 动态特色功能展示 - 响应式优化 */}
        <div className={`grid grid-cols-2 sm:flex sm:items-center sm:space-x-4 lg:space-x-8 gap-4 sm:gap-0 mb-8 sm:mb-12 transition-all duration-1500 delay-700 ${
          showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
        }`}>
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center space-y-2 transition-all duration-500 ${
                activeFeature === index ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
              }`}
            >
              <div className={`p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${
                activeFeature === index ? 'bg-white/20 shadow-xl' : ''
              }`}>
                <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color}`} />
              </div>
              <span className="text-xs sm:text-sm text-slate-300 font-medium text-center">{feature.text}</span>
            </div>
          ))}
        </div>
        
        {/* 主要功能选择卡片 - 优化布局和间距 */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl w-full px-4 sm:px-0 transition-all duration-1500 delay-900 ${
          showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
        }`}>
          
          {/* 虚拟幻境卡片 - 响应式优化 */}
          <div 
            onClick={() => onContinue('virtual')}
            className="group bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-400/30 hover:border-purple-400/60 hover:scale-105 transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-purple-500/25"
          >
            <div className="text-6xl mb-6 group-hover:animate-bounce transform transition-transform duration-300">
              🌌
            </div>
            <h3 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              虚拟幻境之旅
            </h3>
            <p className="text-slate-300 mb-6 text-lg leading-relaxed">
              探索AI创造的奇幻世界，穿越全宇宙神话领域，体验前所未有的虚拟旅行，从中国神话到世界各大神话体系的无限融合
            </p>
            <div className="space-y-2 text-sm">
              <div className="text-purple-300">✨ 中华神话仙境 • 全球神话传说</div>
              <div className="text-blue-300">🌌 跨维度探索 • 全宇宙神话巡礼</div>
              <div className="text-indigo-300">🎭 史诗级奇幻体验 • 多元神话融合</div>
            </div>
          </div>
          
          {/* 真实旅行卡片 - 响应式优化 */}
          <div 
            onClick={() => onContinue('real')}
            className="group bg-gradient-to-br from-emerald-600/20 via-cyan-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-8 border border-emerald-400/30 hover:border-emerald-400/60 hover:scale-105 transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-emerald-500/25"
          >
            <div className="text-6xl mb-6 group-hover:animate-bounce transform transition-transform duration-300">
              🌍
            </div>
            <h3 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
              真实旅行规划
            </h3>
            <p className="text-slate-300 mb-6 text-lg leading-relaxed">
              AI智能规划真实的旅行路线，从本地精品游到全球探险，获得专业的行程建议和实用的环球旅行攻略
            </p>
            <div className="space-y-2 text-sm">
              <div className="text-emerald-300">🗺️ 本地深度游 • 全国精品线路</div>
              <div className="text-cyan-300">🌍 环球探险路线 • 七大洲巡礼</div>
              <div className="text-blue-300">✈️ 专业规划建议 • 极地冒险体验</div>
            </div>
          </div>
        </div>
        
        {/* 底部装饰信息 - 响应式优化 */}
        <div className={`mt-12 sm:mt-16 text-center transition-all duration-1500 delay-1100 ${
          showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-5'
        }`}>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-slate-400 px-4">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-sm sm:text-base">AI智能推荐</span>
            </div>
            <div className="w-2 h-2 bg-purple-400 rounded-full hidden sm:block"></div>
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-sm sm:text-base">多媒体内容</span>
            </div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full hidden sm:block"></div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
              <span className="text-sm sm:text-base">个性化定制</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS动画样式 */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.6; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
}; 
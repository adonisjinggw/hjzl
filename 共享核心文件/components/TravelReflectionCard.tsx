import React from 'react';
import type { TravelReflectionCard } from '../types';
import { Calendar, MapPin, Cloud, Sparkles, Heart, Camera } from 'lucide-react';

interface TravelReflectionCardProps {
  card: TravelReflectionCard;
  index: number;
}

/**
 * 旅行感言卡片组件
 * 展示每个场景完成后的个性化感言
 */
export const TravelReflectionCardComponent: React.FC<TravelReflectionCardProps> = ({ 
  card, 
  index 
}) => {
  // 格式化时间显示
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}小时前`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}天前`;
    }
  };

  // 心情对应的颜色和图标
  const getMoodStyle = (mood: string) => {
    const styles = {
      '开心': { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '😊' },
      '惊叹': { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: '😮' },
      '感动': { color: 'text-pink-400', bg: 'bg-pink-500/20', icon: '🥺' },
      '平静': { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '😌' },
      '兴奋': { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '🤩' },
      '治愈': { color: 'text-green-400', bg: 'bg-green-500/20', icon: '🌱' },
      '震撼': { color: 'text-red-400', bg: 'bg-red-500/20', icon: '🤯' },
      '神奇': { color: 'text-indigo-400', bg: 'bg-indigo-500/20', icon: '✨' }
    };
    return styles[mood as keyof typeof styles] || styles['开心'];
  };

  const moodStyle = getMoodStyle(card.mood);

  return (
    <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl border border-slate-700/50">
      {/* 卡片编号标识 */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-white border border-white/20">
          #{index + 1}
        </div>
      </div>

      {/* 心情标签 */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`${moodStyle.bg} backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium ${moodStyle.color} border border-white/20 flex items-center space-x-1`}>
          <span>{moodStyle.icon}</span>
          <span>{card.mood}</span>
        </div>
      </div>

      {/* 主要图片区域 */}
      <div className="aspect-square overflow-hidden">
        {card.imageBase64 ? (
          <>
            <img 
              src={card.imageBase64} 
              alt={card.sceneName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Camera size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">图片生成中...</p>
            </div>
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        )}
        
        {/* 场景名称覆盖层 */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
            {card.sceneName}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-slate-200">
            <div className="flex items-center space-x-1">
              <MapPin size={14} />
              <span>{card.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatTime(card.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 感言文案区域 */}
      <div className="p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart size={18} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-accent-300 font-semibold mb-2 flex items-center">
              💭 旅行感言
              <Camera size={16} className="ml-2 text-slate-400" />
            </h4>
            <p className="text-slate-300 leading-relaxed text-sm bg-slate-700/50 rounded-lg p-3 border-l-4 border-accent-500">
              {card.reflectionText}
            </p>
          </div>
        </div>

        {/* 特殊元素标签 */}
        <div className="flex flex-wrap gap-2 mt-4">
          {card.isRealistic ? (
            card.weather && (
              <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs">
                <Cloud size={12} />
                <span>{card.weather}</span>
              </div>
            )
          ) : (
            card.magicalElement && (
              <div className="flex items-center space-x-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs">
                <Sparkles size={12} />
                <span>{card.magicalElement}</span>
              </div>
            )
          )}
          
          {/* 模式标识 */}
          <div className={`px-2 py-1 rounded-md text-xs ${card.isRealistic 
            ? 'bg-green-500/20 text-green-300' 
            : 'bg-indigo-500/20 text-indigo-300'
          }`}>
            {card.isRealistic ? '🌍 真实' : '🌌 幻境'}
          </div>
        </div>

        {/* 底部装饰线 */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
          <div className="text-xs text-slate-500 italic">
            "每一段旅程，都是心灵的成长"
          </div>
        </div>
      </div>

      {/* 悬停时的发光效果 */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/5 group-hover:ring-accent-500/50 transition-all duration-300" />
    </div>
  );
}; 
import React from 'react';

interface ImageWithWatermarkProps {
  src?: string;
  alt?: string;
  userName?: string;
  fictionalPlace?: string; // For fictional journey
  realPlaceContext?: string; // For realistic journey, e.g., "北京颐和园"
  filterApplied?: string;
  isRealistic: boolean;
}

/**
 * 带水印的图片组件
 * 使用旅行博主常用的1:1正方形比例
 */
export const ImageWithWatermark: React.FC<ImageWithWatermarkProps> = ({ 
    src = '', 
    alt = '生成的图片', 
    userName = '幻境旅行者', 
    fictionalPlace, 
    realPlaceContext, 
    filterApplied = '无滤镜',
    isRealistic
}) => {
  const currentYear = "2025"; 
  const season = ["春季", "夏季", "秋季", "冬季"][Math.floor(Math.random() * 4)]; 
  
  const placeText = isRealistic ? realPlaceContext : fictionalPlace;

  return (
    <div className="relative group bg-slate-700 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* 使用1:1正方形比例，符合Instagram/小红书等平台的热门尺寸 */}
      <div className="aspect-square overflow-hidden">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>
      
      {/* 底部水印信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent text-white">
        <p className="font-mono text-sm font-medium">📷 @{userName}</p>
        <p className="font-mono text-xs text-slate-200 mt-1">
          {currentYear}年 {season} · {isRealistic ? '📍 ' : '✨ '}
          {placeText || '未知地点'}
        </p>
        <p className="font-mono text-xs text-accent-300 mt-1">
          🎨 {filterApplied}
        </p>
      </div>
      
      {/* 右上角场景标识 */}
      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium border border-white/20">
        {alt}
      </div>

      {/* 左上角模式标识 */}
      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium">
        {isRealistic ? '🌍 真实' : '🌌 虚拟'}
      </div>
    </div>
  );
};

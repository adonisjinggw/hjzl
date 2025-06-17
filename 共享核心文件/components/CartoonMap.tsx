/**
 * CartoonMap 卡通风格SVG地图组件（动画+缩放+自检，最终兼容版）
 * 1. 主岛屿/大陆轮廓 2. 探索路径 3. 分区/地标 4. 多层地形叠加
 */
import React, { useEffect, useRef } from 'react';

interface CartoonMapNode {
  x: number;
  y: number;
  type?: string;
  label?: string;
}

interface CartoonMapProps {
  theme?: 'magic-forest' | 'star-island' | 'candy-world' | 'default';
  nodes: CartoonMapNode[];
  zoomLevel?: number;
}

/**
 * 获取主题色和地形参数
 */
function getThemeConfig(theme: string) {
  switch (theme) {
    case 'magic-forest':
      return {
        bgGradient: ['#a7f3d0', '#34d399'],
        island: ['#bbf7d0', '#4ade80'],
        mountain: '#4ade80',
        river: '#38bdf8',
        deco: '#fbbf24',
        cloud: '#fff',
        tree: '#22c55e',
        mushroom: '#f87171',
        zone: '#bef264',
      };
    case 'star-island':
      return {
        bgGradient: ['#f0abfc', '#818cf8'],
        island: ['#e0e7ff', '#818cf8'],
        mountain: '#a5b4fc',
        river: '#f472b6',
        deco: '#facc15',
        cloud: '#fff',
        star: '#fde68a',
        zone: '#fcd34d',
      };
    case 'candy-world':
      return {
        bgGradient: ['#f9a8d4', '#fcd34d'],
        island: ['#fcd34d', '#f9a8d4'],
        mountain: '#f472b6',
        river: '#fbbf24',
        deco: '#a3e635',
        cloud: '#fff',
        candy: '#f472b6',
        zone: '#fbbf24',
      };
    default:
      return {
        bgGradient: ['#bae6fd', '#818cf8'],
        island: ['#e0f2fe', '#60a5fa'],
        mountain: '#60a5fa',
        river: '#38bdf8',
        deco: '#fbbf24',
        cloud: '#fff',
        zone: '#a7f3d0',
      };
  }
}

export const CartoonMap: React.FC<CartoonMapProps> = ({ theme = 'default', nodes, zoomLevel = 1 }) => {
  const config = getThemeConfig(theme);
  const svgRef = useRef<SVGSVGElement>(null);
  // 自动自检：渲染后检测内容是否被裁剪
  useEffect(() => {
    if (svgRef.current) {
      const bbox = svgRef.current.getBBox();
      if (bbox.x < 0 || bbox.y < 0 || bbox.x + bbox.width > 800 * zoomLevel || bbox.y + bbox.height > 400 * zoomLevel) {
        console.warn('CartoonMap: SVG内容可能被裁剪或缩放异常', bbox);
      }
    }
  }, [zoomLevel, nodes]);
  // 主岛屿轮廓点（椭圆+波浪边）
  const islandPath = 'M120,320 Q200,180 400,120 Q600,180 680,320 Q600,360 400,380 Q200,360 120,320 Z';
  // 分区/地标（示例：三块区域）
  const zones = [
    'M200,320 Q250,220 400,180 Q400,260 300,340 Q250,340 200,320 Z',
    'M400,180 Q550,220 600,320 Q550,340 400,260 Q400,180 400,180 Z',
    'M300,340 Q400,260 600,320 Q600,360 400,370 Q300,360 300,340 Z',
  ];
  // 路径动画直接渲染
  const pathLines = nodes.length > 1 ? nodes.map((node, i) => {
    if (i === 0) return null;
    const prev = nodes[i - 1];
    return (
      <path
        key={i}
        d={`M${prev.x},${prev.y} Q${(prev.x + node.x) / 2},${(prev.y + node.y) / 2 - 40} ${node.x},${node.y}`}
        stroke={config.river}
        strokeWidth="6"
        fill="none"
        strokeDasharray="12,8"
        opacity="0.7"
      >
        <animate attributeName="stroke-dashoffset" values="0;40" dur="2s" repeatCount="indefinite" />
      </path>
    );
  }) : null;
  return (
    <svg ref={svgRef} width={800 * zoomLevel} height={400 * zoomLevel} viewBox="0 0 800 400" style={{ display: 'block', transition: 'width 0.3s,height 0.3s' }}>
      {/* 背景渐变 */}
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={config.bgGradient[0]} />
          <stop offset="100%" stopColor={config.bgGradient[1]} />
        </linearGradient>
        <linearGradient id="island" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={config.island[0]} />
          <stop offset="100%" stopColor={config.island[1]} />
        </linearGradient>
        <radialGradient id="deco" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={config.deco} stopOpacity="0.7" />
          <stop offset="100%" stopColor={config.bgGradient[1]} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#bg)" />
      {/* 主岛屿/大陆轮廓 */}
      <path d={islandPath} fill="url(#island)" stroke="#fff" strokeWidth="6" opacity="0.95" />
      {/* 分区/地标 */}
      {zones.map((zone, i) => (
        <path key={i} d={zone} fill={config.zone} opacity={0.18 + i * 0.08} />
      ))}
      {/* 多层山丘/湖泊 */}
      <ellipse cx="400" cy="370" rx="180" ry="24" fill={config.mountain} opacity="0.18" />
      <ellipse cx="400" cy="390" rx="200" ry="30" fill={config.mountain} opacity="0.12" />
      {/* 云朵装饰 */}
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={160 + i * 120} cy={60 + (i % 2) * 20} rx="36" ry="16" fill={config.cloud} opacity="0.7">
          <animate attributeName="cx" values={`${160 + i * 120};${180 + i * 120};${160 + i * 120}`} dur="6s" repeatCount="indefinite" />
        </ellipse>
      ))}
      {/* 魔法森林主题：树木蘑菇 */}
      {theme === 'magic-forest' && (
        <>
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={180 + i * 80} y={300 + (i % 2) * 10} width="12" height="32" fill="#7c3aed" rx="6" />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx={186 + i * 80} cy={300 + (i % 2) * 10} rx="18" ry="12" fill={config.tree} />
          ))}
          {/* 蘑菇 */}
          {Array.from({ length: 4 }, (_, i) => (
            <g key={i}>
              <ellipse cx={220 + i * 120} cy={350} rx="10" ry="6" fill={config.mushroom} />
              <rect x={215 + i * 120} y={350} width="10" height="12" fill="#fff" rx="3" />
            </g>
          ))}
        </>
      )}
      {/* 星空岛主题：星星 */}
      {theme === 'star-island' && (
        <>
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={i} cx={60 + Math.random() * 680} cy={40 + Math.random() * 320} r={6 + Math.random() * 8} fill={config.star} opacity={0.5 + Math.random() * 0.5} />
          ))}
        </>
      )}
      {/* 糖果世界主题：糖果 */}
      {theme === 'candy-world' && (
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={120 + i * 60} y={340 + (i % 2) * 10} width="18" height="18" fill={config.candy} rx="6" />
          ))}
        </>
      )}
      {/* 路径动画 */}
      {pathLines}
      {/* 节点脉冲动画 */}
      {nodes.map((node, idx) => (
        <g key={idx}>
          <circle cx={node.x} cy={node.y} r={28} fill="#fff" stroke={config.deco} strokeWidth="4" >
            <animate attributeName="r" values="24;32;24" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx={node.x} cy={node.y} r={18} fill={config.deco} opacity="0.8" />
          <text x={node.x} y={node.y + 6} textAnchor="middle" fontSize="18" fill="#fff" fontWeight="bold">
            {node.label || '★'}
          </text>
        </g>
      ))}
      {/* 魔法传送门（中心） */}
      <ellipse cx="400" cy="200" rx="38" ry="38" fill="none" stroke={config.deco} strokeWidth="8" opacity="0.7" />
      <circle cx="400" cy="200" r="22" fill="#fff" stroke={config.deco} strokeWidth="4" />
      <text x="400" y="208" textAnchor="middle" fontSize="22" fill={config.deco} fontWeight="bold">传</text>
    </svg>
  );
}; 
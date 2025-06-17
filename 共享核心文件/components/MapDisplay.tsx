import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Compass, Star, Globe, Eye, Info, X, ZoomIn, ZoomOut, Layers, Clock } from 'lucide-react';
import type { GeneratedScenario, GeneratedRealisticItinerary, RealisticActivity, CoreScene } from '../types';
import { fetchWeather } from '../services/weatherService';
import { generateFantasyMap } from '../services/aiMapService';
import { CartoonMap } from './CartoonMap';
import ReactDOM from 'react-dom';

// 导入Leaflet地图库 (完全免费!)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapDisplayProps {
  isRealistic: boolean;
  scenario?: GeneratedScenario | null;
  itinerary?: GeneratedRealisticItinerary | null;
}

interface SceneDetail {
  name: string;
  description: string;
  type?: string;
  x: number;
  y: number;
  scene?: CoreScene;
  dayPlan?: any;
}

// 高德地图类型声明
declare global {
  interface Window {
    AMap: any;
    initAMap: () => void;
    google: {
      maps: {
        Map: any;
        Marker: any;
        Size: any;
      };
    };
  }
}

// 地图API配置
const MAP_API_CONFIG = {
  // 高德地图配置
  amap: {
    key: import.meta.env.VITE_AMAP_API_KEY || '您的高德地图API密钥',
    jsApiUrl: 'https://webapi.amap.com/maps?v=1.4.15&key=',
    securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE || '您的安全密钥'
  },
  // 谷歌地图配置  
  google: {
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '您的Google Maps API密钥',
    jsApiUrl: 'https://maps.googleapis.com/maps/api/js?key=',
    libraries: 'geometry,places'
  },
  // 免费OpenStreetMap配置 (无需API密钥!)
  openstreetmap: {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }
};

// 中国主要城市坐标 (免费使用!)
const CHINA_CITIES = {
  '北京': [39.904200, 116.407396],
  '上海': [31.230390, 121.473702],
  '广州': [23.129110, 113.264385],
  '深圳': [22.543099, 114.057868],
  '杭州': [30.274085, 120.155070],
  '成都': [30.572815, 104.066801],
  '西安': [34.341568, 108.940175],
  '重庆': [29.563761, 106.550464],
  '天津': [39.343357, 117.361649],
  '南京': [32.059344, 118.796877],
  '武汉': [30.593099, 114.305393],
  '大连': [38.914003, 121.618622],
  '青岛': [36.094406, 120.384428],
  '沈阳': [41.805699, 123.431472],
  '长沙': [28.194070, 112.982279]
} as const;

/**
 * 地图显示组件 - 升级版
 * 为真实旅行显示优化的真实地图，为虚拟旅行显示精美的幻境地图
 * 
 * 🆓 现已支持完全免费的OpenStreetMap地图！
 */
export const MapDisplay: React.FC<MapDisplayProps> = ({ isRealistic, scenario, itinerary }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedScene, setSelectedScene] = useState<SceneDetail | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'map' | 'timeline' | 'details'>('map');

  // 地图实例和状态
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapProvider, setMapProvider] = useState<'leaflet' | 'amap' | 'google' | 'fallback'>('leaflet'); // 默认使用免费地图
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  
  // 路线动画状态
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [routeMarker, setRouteMarker] = useState<any>(null);

  // 天气信息状态
  const [weather, setWeather] = useState<any>(null);

  // 新增AI地图贴图状态
  const [aiMapUrl, setAiMapUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  // 新增本地兜底贴图数组
  const fallbackImages = [
    'https://cdn.pixabay.com/photo/2017/01/31/13/14/fantasy-2022816_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/09/32/map-1867319_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/01/31/13/13/fantasy-2022815_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/01/31/13/14/fantasy-2022817_1280.jpg',
  ];
  const [fallbackIndex] = useState(() => Math.floor(Math.random() * fallbackImages.length));
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  // 新增弹窗状态
  const [activeNode, setActiveNode] = useState<number | null>(null);

  // 为Leaflet地图添加自定义样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker {
        background: transparent !important;
        border: none !important;
      }
      
      .custom-marker > div {
        animation: markerPulse 2s infinite;
      }
      
      @keyframes markerPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
      
      .leaflet-popup-tip {
        background: white;
      }
      
      /* 隐藏默认的缩放控件 */
      .leaflet-control-zoom {
        display: none;
      }
      
      /* 路线动画角色样式 */
      .route-character {
        width: 32px;
        height: 32px;
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: transform 0.3s ease;
        z-index: 1000;
      }
      
      .route-character:hover {
        transform: scale(1.2);
      }
      
      .route-character.moving {
        animation: characterBounce 0.5s ease-in-out infinite alternate;
      }
      
      @keyframes characterBounce {
        from { transform: translateY(0px); }
        to { transform: translateY(-4px); }
      }
      
      /* 路径线样式 */
      .route-line {
        stroke: #4ade80;
        stroke-width: 4;
        stroke-dasharray: 10, 5;
        stroke-linecap: round;
        animation: routeDash 1s linear infinite;
      }
      
      @keyframes routeDash {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 15; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 生成地图数据
  const generateMapData = (): SceneDetail[] => {
    console.log('🗺️ 生成地图数据...');
    console.log('模式:', isRealistic ? '真实' : '虚拟');
    console.log('场景数据:', scenario?.coreScenes?.length || 0);
    console.log('行程数据:', itinerary?.dailyPlans?.length || 0);
    
    if (isRealistic && itinerary) {
      // 真实模式：基于行程生成地图点
      const scenes: SceneDetail[] = [];
      
      itinerary.dailyPlans.forEach((dayPlan, dayIndex) => {
        dayPlan.activities.forEach((activity, activityIndex) => {
          scenes.push({
            name: `第${dayPlan.dayNumber}天: ${activity.name}`,
            description: activity.description,
            type: activity.type,
            x: 200 + (dayIndex * 150) + (activityIndex * 50),
            y: 200 + (activityIndex * 80) + Math.sin(dayIndex) * 50,
            dayPlan: dayPlan
          });
        });
      });
      
      console.log('✅ 生成真实模式地图数据:', scenes.length, '个点');
      return scenes;
    } else if (!isRealistic && scenario) {
      // 虚拟模式：基于核心场景生成地图点
      const scenes: SceneDetail[] = scenario.coreScenes.map((scene, index) => {
        const angle = (index / scenario.coreScenes.length) * 2 * Math.PI;
        const radius = 150;
        const centerX = 400;
        const centerY = 300;
        
        return {
          name: scene.name,
          description: scene.description,
          type: 'fantasy',
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          scene: scene
        };
      });
      
      console.log('✅ 生成虚拟模式地图数据:', scenes.length, '个点');
      return scenes;
    }
    
    console.warn('⚠️ 未找到可用数据，返回空数组');
    return [];
  };

  const mapData = generateMapData();

  // 创建路线动画
  const createRouteAnimation = useCallback((map: any, markers: L.Marker[]) => {
    if (markers.length < 2) return;

    // 创建路径点
    const pathCoords = markers.map(marker => marker.getLatLng());
    
    // 绘制路径线
    const routeLine = L.polyline(pathCoords, {
      color: '#4ade80',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 5',
      className: 'route-line'
    }).addTo(map);

    // 创建移动角色
    const characterIcon = L.divIcon({
      className: 'route-character',
      html: '🚶‍♂️',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const character = L.marker(pathCoords[0], { icon: characterIcon }).addTo(map);
    setRouteMarker(character);

    return { routeLine, character, pathCoords };
  }, []);

  // 执行路线动画
  const animateRoute = useCallback(() => {
    if (!mapInstance || !routeMarker || mapData.length < 2) return;

    setIsAnimating(true);
    const totalSteps = 100 * animationSpeed;
    let currentStep = 0;

    // 获取路径坐标
    const pathCoords = mapData.map((_, index) => {
      const cityCoords = CHINA_CITIES[itinerary?.destinationName as keyof typeof CHINA_CITIES] || CHINA_CITIES['北京'];
      return [
        cityCoords[0] + (Math.random() - 0.5) * 0.05 + index * 0.01,
        cityCoords[1] + (Math.random() - 0.5) * 0.05 + index * 0.01
      ];
    });

    const animate = () => {
      const progress = currentStep / totalSteps;
      setAnimationProgress(progress);

      if (progress >= 1) {
        setIsAnimating(false);
        setAnimationProgress(0);
        return;
      }

      // 计算当前位置
      const segmentIndex = Math.floor(progress * (pathCoords.length - 1));
      const segmentProgress = (progress * (pathCoords.length - 1)) - segmentIndex;
      
      if (segmentIndex < pathCoords.length - 1) {
        const startCoord = pathCoords[segmentIndex];
        const endCoord = pathCoords[segmentIndex + 1];
        
        const currentLat = startCoord[0] + (endCoord[0] - startCoord[0]) * segmentProgress;
        const currentLng = startCoord[1] + (endCoord[1] - startCoord[1]) * segmentProgress;
        
        routeMarker.setLatLng([currentLat, currentLng]);
      }

      currentStep++;
      setTimeout(animate, 50 / animationSpeed);
    };

    animate();
  }, [mapInstance, routeMarker, mapData, animationSpeed, itinerary?.destinationName]);

  // 初始化免费的Leaflet地图 (🆓 完全免费!)
  const initializeLeafletMap = useCallback(() => {
    if (!mapRef.current || !isRealistic) return;

    console.log('🗺️ 初始化免费Leaflet地图...');

    try {
      // 获取目的地坐标
      const destinationName = itinerary?.destinationName || '北京';
      const cityCoords = CHINA_CITIES[destinationName as keyof typeof CHINA_CITIES] || CHINA_CITIES['北京'];

      // 创建Leaflet地图实例
      const map = L.map(mapRef.current, {
        center: cityCoords as [number, number],
        zoom: 12,
        zoomControl: false, // 我们会自定义缩放控件
        attributionControl: true
      });

      // 添加OpenStreetMap瓦片图层 (完全免费!)
      L.tileLayer(MAP_API_CONFIG.openstreetmap.tileUrl, {
        attribution: MAP_API_CONFIG.openstreetmap.attribution,
        maxZoom: MAP_API_CONFIG.openstreetmap.maxZoom,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // 创建自定义标记图标
      const createCustomIcon = (index: number) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `<div class="w-8 h-8 bg-blue-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold">${index + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
      };

      // 添加地图标记
      const markers: L.Marker[] = [];
      mapData.forEach((point, index) => {
        // 为每个点生成稍微不同的坐标 (模拟真实分布)
        const lat = cityCoords[0] + (Math.random() - 0.5) * 0.05 + index * 0.01;
        const lng = cityCoords[1] + (Math.random() - 0.5) * 0.05 + index * 0.01;

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(index)
        }).addTo(map);

        markers.push(marker);

        // 添加弹窗
        marker.bindPopup(`
          <div class="p-2 min-w-48">
            <h3 class="font-semibold text-lg mb-2">${point.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${point.description}</p>
            ${point.type ? `<span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${point.type}</span>` : ''}
          </div>
        `);

        // 点击标记时更新选中场景
        marker.on('click', () => {
          setSelectedScene(point);
        });
      });

      // 如果有多个点，调整视图以显示所有标记
      if (markers.length > 1) {
        const group = new L.FeatureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }

      // 创建路线动画
      if (markers.length > 1) {
        createRouteAnimation(map, markers);
      }

      setMapInstance(map);
      setIsApiLoaded(true);
      console.log('✅ 免费Leaflet地图初始化成功!');

    } catch (error) {
      console.error('❌ Leaflet地图初始化失败:', error);
      setMapProvider('fallback');
    }
  }, [mapData, itinerary?.destinationName, createRouteAnimation]);

  // 组件挂载时初始化免费地图
  useEffect(() => {
    if (isRealistic && mapData.length > 0 && mapProvider === 'leaflet') {
      console.log('🚀 启动免费地图模式...');
      // 清理之前的地图实例
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
      // 延迟初始化，确保DOM已准备好
      setTimeout(initializeLeafletMap, 100);
    }
  }, [isRealistic, mapData.length, mapProvider, initializeLeafletMap]);

  // 清理地图实例
  useEffect(() => {
    return () => {
      if (mapInstance && mapInstance.remove) {
        mapInstance.remove();
      }
    };
  }, [mapInstance]);

  // 加载高德地图API
  const loadAmapApi = useCallback(async () => {
    if (window.AMap) {
      setIsApiLoaded(true);
      setMapProvider('amap');
      return;
    }

    const apiKey = MAP_API_CONFIG.amap.key;
    if (!apiKey || apiKey === '您的高德地图API密钥') {
      console.warn('⚠️ 高德地图API密钥未配置，使用备用地图');
      setMapProvider('fallback');
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = `${MAP_API_CONFIG.amap.jsApiUrl}${apiKey}`;
      script.onload = () => {
        setIsApiLoaded(true);
        setMapProvider('amap');
        console.log('✅ 高德地图API加载成功');
      };
      script.onerror = () => {
        console.error('❌ 高德地图API加载失败');
        setMapProvider('fallback');
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ 高德地图API加载异常:', error);
      setMapProvider('fallback');
    }
  }, []);

  // 加载Google Maps API
  const loadGoogleMapsApi = useCallback(async () => {
    if (window.google?.maps) {
      setIsApiLoaded(true);
      setMapProvider('google');
      return;
    }

    const apiKey = MAP_API_CONFIG.google.key;
    if (!apiKey || apiKey === '您的Google Maps API密钥') {
      console.warn('⚠️ Google Maps API密钥未配置，尝试高德地图');
      await loadAmapApi();
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = `${MAP_API_CONFIG.google.jsApiUrl}${apiKey}&libraries=${MAP_API_CONFIG.google.libraries}`;
      script.onload = () => {
        setIsApiLoaded(true);
        setMapProvider('google');
        console.log('✅ Google Maps API加载成功');
      };
      script.onerror = async () => {
        console.error('❌ Google Maps API加载失败，尝试高德地图');
        await loadAmapApi();
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ Google Maps API加载异常:', error);
      await loadAmapApi();
    }
  }, [loadAmapApi]);

  // 初始化真实地图
  const initializeRealMap = useCallback(async () => {
    if (!mapRef.current || !isApiLoaded) return;

    try {
      if (mapProvider === 'amap' && window.AMap) {
        // 初始化高德地图
        const map = new window.AMap.Map(mapRef.current, {
          zoom: 10,
          center: [116.397428, 39.90923], // 北京天安门
          mapStyle: 'amap://styles/blue',
          viewMode: '3D',
          pitch: 30
        });

        // 添加地图标记
        mapData.forEach((point, index) => {
          const marker = new window.AMap.Marker({
            position: [116.397428 + index * 0.01, 39.90923 + index * 0.01],
            title: point.name,
            content: `<div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold">${index + 1}</div>`
          });

          marker.on('click', () => setSelectedScene(point));
          map.add(marker);
        });

        setMapInstance(map);
        console.log('✅ 高德地图初始化成功');

      } else if (mapProvider === 'google' && window.google?.maps) {
        // 初始化Google Maps
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 10,
          center: { lat: 39.90923, lng: 116.397428 },
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'all',
              elementType: 'all',
              stylers: [{ saturation: -20 }, { lightness: 10 }]
            }
          ]
        });

        // 添加地图标记
        mapData.forEach((point, index) => {
          const marker = new window.google.maps.Marker({
            position: { lat: 39.90923 + index * 0.01, lng: 116.397428 + index * 0.01 },
            map: map,
            title: point.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="white" stroke-width="2"/>
                  <text x="16" y="21" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32)
            }
          });

          marker.addListener('click', () => setSelectedScene(point));
        });

        setMapInstance(map);
        console.log('✅ Google Maps初始化成功');
      }
    } catch (error) {
      console.error('❌ 地图初始化失败:', error);
      setMapProvider('fallback');
    }
  }, [mapProvider, isApiLoaded, mapData]);

  // 组件挂载时加载地图API
  useEffect(() => {
    if (isRealistic && mapData.length > 0) {
      console.log('🗺️ 开始加载真实地图API...');
      loadGoogleMapsApi();
    }
  }, [isRealistic, mapData.length, loadGoogleMapsApi]);

  // API加载完成后初始化地图
  useEffect(() => {
    if (isApiLoaded && mapProvider !== 'fallback') {
      initializeRealMap();
    }
  }, [isApiLoaded, mapProvider, initializeRealMap]);

  // 虚拟地图天气获取
  useEffect(() => {
    if (!isRealistic && scenario && scenario.destinationName) {
      // 默认用中国主要城市坐标，找不到则用北京
      const coords = CHINA_CITIES[scenario.destinationName as keyof typeof CHINA_CITIES] || CHINA_CITIES['北京'];
      fetchWeather(coords[0], coords[1]).then(setWeather).catch(() => setWeather(null));
    }
  }, [isRealistic, scenario]);

  // 根据场景自动生成prompt
  function getMapPrompt(scenario: any) {
    if (!scenario) return 'fantasy RPG world map, high detail, beautiful, game style';
    return `${scenario.title || 'Fantasy'} RPG world map, high detail, beautiful, game style, ${scenario.theme || ''}`;
  }

  // 监听场景变化，自动生成AI地图
  useEffect(() => {
    if (!isRealistic && scenario) {
      setAiLoading(true);
      setAiError(false);
      setAiErrorMsg(null);
      const prompt = getMapPrompt(scenario);
      generateFantasyMap(prompt)
        .then(url => setAiMapUrl(url))
        .catch((err) => {
          setAiError(true);
          setAiErrorMsg(err?.message || 'AI地图生成失败');
        })
        .finally(() => setAiLoading(false));
    }
  }, [scenario, isRealistic]);

  // 主题风格采用默认值
  const theme = 'magic-forest';

  // 渲染真实地图模式
  const renderRealisticMap = () => {
    if (!itinerary) {
      return (
        <div className="w-full h-96 bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-slate-400">
            <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无行程数据</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-96 bg-slate-800 rounded-lg overflow-hidden border border-blue-500/30">
        {/* 地图容器 */}
        <div 
          ref={mapRef}
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: '384px' }}
        />

        {/* 加载状态 */}
        {!isApiLoaded && mapProvider === 'leaflet' && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p>正在加载免费地图...</p>
            </div>
          </div>
        )}

        {!isApiLoaded && mapProvider !== 'fallback' && mapProvider !== 'leaflet' && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p>正在加载{mapProvider === 'amap' ? '高德' : 'Google'}地图...</p>
            </div>
          </div>
        )}

        {/* 备用SVG地图 */}
        {mapProvider === 'fallback' && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 800 400">
                <defs>
                  <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridPattern)" />
                <polygon 
                  points="0,300 100,200 250,180 400,220 550,160 700,200 800,190 800,400 0,400" 
                  fill="rgba(30, 64, 175, 0.5)" 
                />
              </svg>
            </div>

            {/* 备用地图标记 */}
            {mapData.map((point, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ 
                  left: `${Math.min(Math.max(point.x, 50), 750)}px`, 
                  top: `${Math.min(Math.max(point.y, 50), 350)}px` 
                }}
                onClick={() => setSelectedScene(point)}
              >
                <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 地图控制台 */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {/* 地图状态指示器 */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-500/30">
            <div className="flex items-center space-x-2 text-xs text-white">
              <div className={`w-2 h-2 rounded-full ${
                mapProvider === 'leaflet' ? 'bg-green-500' :
                mapProvider === 'amap' ? 'bg-blue-500' : 
                mapProvider === 'google' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`}></div>
              <span>
                {mapProvider === 'leaflet' ? '🆓 免费地图' :
                 mapProvider === 'amap' ? '高德地图' : 
                 mapProvider === 'google' ? 'Google Maps' : 
                 '备用地图'}
              </span>
            </div>
          </div>

          {/* 自定义缩放控件 (仅Leaflet地图显示) */}
          {mapProvider === 'leaflet' && mapInstance && (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-blue-500/30 overflow-hidden">
              <button
                onClick={() => mapInstance.zoomIn()}
                className="block w-full p-2 bg-blue-600/80 hover:bg-blue-600 text-white transition-colors text-sm border-b border-blue-500/30"
                title="放大"
              >
                <ZoomIn className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => mapInstance.zoomOut()}
                className="block w-full p-2 bg-blue-600/80 hover:bg-blue-600 text-white transition-colors text-sm"
                title="缩小"
              >
                <ZoomOut className="w-4 h-4 mx-auto" />
              </button>
            </div>
          )}

          {/* 路线动画控制 (仅Leaflet地图且有路线时显示) */}
          {mapProvider === 'leaflet' && mapData.length > 1 && (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-green-500/30 p-2 space-y-2">
              <div className="text-xs text-green-300 text-center font-semibold">🚶‍♂️ 路线动画</div>
              
              {/* 播放/暂停按钮 */}
              <button
                onClick={animateRoute}
                disabled={isAnimating}
                className={`w-full p-2 rounded text-white text-xs transition-colors ${
                  isAnimating 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                title={isAnimating ? '动画进行中...' : '开始路线动画'}
              >
                {isAnimating ? '🎬 进行中...' : '▶️ 开始动画'}
              </button>

              {/* 速度控制 */}
              <div className="space-y-1">
                <div className="text-xs text-green-200">速度: {animationSpeed}x</div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setAnimationSpeed(0.5)}
                    className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                      animationSpeed === 0.5 ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    0.5x
                  </button>
                  <button
                    onClick={() => setAnimationSpeed(1)}
                    className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                      animationSpeed === 1 ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    1x
                  </button>
                  <button
                    onClick={() => setAnimationSpeed(2)}
                    className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                      animationSpeed === 2 ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    2x
                  </button>
                </div>
              </div>

              {/* 动画进度条 */}
              {isAnimating && (
                <div className="space-y-1">
                  <div className="text-xs text-green-200">进度: {Math.round(animationProgress * 100)}%</div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${animationProgress * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 切换地图提供商 */}
          <button
            onClick={() => {
              if (mapProvider === 'leaflet') {
                loadGoogleMapsApi();
              } else if (mapProvider === 'google' || mapProvider === 'amap') {
                setMapProvider('fallback');
                setIsApiLoaded(false);
              } else {
                setMapProvider('leaflet');
                setIsApiLoaded(false);
              }
            }}
            className="p-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs"
            title="切换地图"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* 目的地信息 */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-500/30">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-white font-semibold">{itinerary.destinationName}</h3>
              <p className="text-blue-300 text-sm">{itinerary.dailyPlans.length} 天行程</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 节点弹窗Portal渲染
  const renderNodePopup = () => {
    if (activeNode === null || !scenario?.coreScenes[activeNode]) return null;
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setActiveNode(null)}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
          <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-500" onClick={() => setActiveNode(null)}>✕</button>
          <h3 className="text-2xl font-bold text-blue-700 mb-2">{scenario.coreScenes[activeNode].name}</h3>
          <p className="text-gray-700 mb-2">{scenario.coreScenes[activeNode].description}</p>
          {scenario.coreScenes[activeNode].influencerAttribute && <div className="text-sm text-blue-400 mb-1">网红属性：{scenario.coreScenes[activeNode].influencerAttribute}</div>}
          {scenario.coreScenes[activeNode].interactiveEgg && <div className="text-sm text-pink-400">互动彩蛋：{scenario.coreScenes[activeNode].interactiveEgg}</div>}
        </div>
      </div>,
      document.body
    );
  };

  // 修改 renderVirtualMap，节点交互全部SVG内实现
  const renderVirtualMap = () => {
    if (!scenario) {
      return (
        <div className="w-full h-96 bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-slate-400">
            <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无场景数据</p>
          </div>
        </div>
      );
    }
    // 生成节点分布
    const centerX = 400;
    const centerY = 200;
    const radius = 120;
    const nodeCount = scenario.coreScenes.length;
    const nodeAngle = (2 * Math.PI) / nodeCount;
    const nodes = scenario.coreScenes.map((scene, i) => {
      const angle = i * nodeAngle - Math.PI / 2;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        label: scene.name.slice(0, 2),
        type: 'fantasy',
      };
    });
    return (
      <div className="relative w-full max-w-4xl mx-auto aspect-[2/1] bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 rounded-2xl shadow-lg flex items-center justify-center overflow-visible">
        {/* 缩放按钮悬浮右下角 */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col space-y-2">
          <button onClick={() => setZoomLevel(z => Math.min(z + 0.2, 2))} className="p-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition">+</button>
          <button onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.5))} className="p-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition">-</button>
          <button onClick={() => setZoomLevel(1)} className="p-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition">重置</button>
        </div>
        {/* 节点交互全部SVG内实现 */}
        <svg width={800 * zoomLevel} height={400 * zoomLevel} viewBox="0 0 800 400" style={{ display: 'block', transition: 'width 0.3s,height 0.3s' }}>
          <CartoonMap theme={theme} nodes={nodes} zoomLevel={zoomLevel} />
          {/* 节点高亮与动画 */}
          {nodes.map((node, i) => (
            <g key={i} onMouseEnter={() => setActiveNode(i)} onMouseLeave={() => setActiveNode(null)} onClick={() => setActiveNode(i)} style={{ cursor: 'pointer' }}>
              <circle cx={node.x} cy={node.y} r={activeNode === i ? 32 : 28} fill={activeNode === i ? '#fde68a' : '#fff'} stroke={activeNode === i ? '#fbbf24' : '#60a5fa'} strokeWidth={activeNode === i ? 6 : 4} />
              <text x={node.x} y={node.y + 6} textAnchor="middle" fontSize="18" fill="#f59e42" fontWeight="bold">{node.label || '★'}</text>
              {activeNode === i && <circle cx={node.x} cy={node.y} r={38} fill="none" stroke="#fde68a" strokeWidth="3" opacity="0.5">
                <animate attributeName="r" values="32;44;32" dur="1.2s" repeatCount="indefinite" />
              </circle>}
            </g>
          ))}
        </svg>
        {/* 节点弹窗Portal渲染 */}
        {renderNodePopup()}
      </div>
    );
  };

  // 渲染时间线视图
  const renderTimelineView = () => {
    if (!isRealistic || !itinerary) return null;

    return (
      <div className="w-full space-y-4">
        <h4 className="text-lg font-semibold text-blue-300 mb-4">行程时间线</h4>
        {itinerary.dailyPlans.map((dayPlan, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 bg-slate-800/50 rounded-lg border border-blue-500/20">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {dayPlan.dayNumber}
              </div>
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-white mb-2">{dayPlan.summary}</h5>
              <div className="space-y-2">
                {dayPlan.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">{activity.name}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-blue-300">{activity.estimatedDurationHours}小时</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染详细信息弹窗
  const renderSceneDetails = () => {
    if (!selectedScene) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedScene(null)}>
        <div className="bg-slate-900 border border-slate-600 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{selectedScene.name}</h3>
            <button
              onClick={() => setSelectedScene(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-slate-300">{selectedScene.description}</p>
            
            {selectedScene.scene && (
              <>
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-semibold text-purple-300 mb-2">🌟 网红属性</h4>
                  <p className="text-sm text-slate-400">{selectedScene.scene.influencerAttribute}</p>
                </div>
                
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-semibold text-pink-300 mb-2">🎁 互动彩蛋</h4>
                  <p className="text-sm text-slate-400">{selectedScene.scene.interactiveEgg}</p>
                </div>
              </>
            )}
            
            {selectedScene.dayPlan && (
              <div className="border-t border-slate-700 pt-4">
                <h4 className="font-semibold text-blue-300 mb-2">📅 行程安排</h4>
                <p className="text-sm text-slate-400">
                  第{selectedScene.dayPlan.dayNumber}天 · {selectedScene.type} · 
                  预计{selectedScene.dayPlan.activities[0]?.estimatedDurationHours || 3}小时
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 主渲染
  return (
    <div className="w-full space-y-6">
      {/* 地图渲染 */}
      {currentView === 'map' && (
        <>
          {isRealistic ? renderRealisticMap() : renderVirtualMap()}
        </>
      )}

      {/* 时间线视图 */}
      {currentView === 'timeline' && renderTimelineView()}

      {/* 详细信息视图 */}
      {currentView === 'details' && (
        <div className="w-full p-6 bg-slate-800/50 rounded-lg border border-slate-600/50">
          <h4 className="text-lg font-semibold text-slate-300 mb-4">
            {isRealistic ? '🗺️ 地图使用说明' : '🧭 幻境探索指南'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
            <div>
              <h5 className="font-semibold text-slate-200 mb-2">基本操作</h5>
              <ul className="space-y-1">
                <li>• 点击地图标记查看详细信息</li>
                <li>• 使用右上角按钮切换视图</li>
                {!isRealistic && <li>• 滚轮或按钮可缩放幻境地图</li>}
                <li>• 悬停标记显示快速预览</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-slate-200 mb-2">标记说明</h5>
              <ul className="space-y-1">
                {isRealistic ? (
                  <>
                    <li>• 🔵 蓝色圆点：每日行程安排</li>
                    <li>• ➖ 虚线：推荐游览路线</li>
                    <li>• 📍 悬浮信息：景点详情</li>
                  </>
                ) : (
                  <>
                    <li>• ⭐ 彩色星标：神秘场景入口</li>
                    <li>• 🧭 中心传送门：幻境核心</li>
                    <li>• ✨ 魔法连线：探索路径</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 场景详情弹窗 */}
      {renderSceneDetails()}

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-slate-500 p-2 bg-slate-900/30 rounded">
          调试: {isRealistic ? '真实' : '虚拟'}模式 | 
          场景数: {mapData.length} | 
          当前视图: {currentView} | 
          缩放: {zoomLevel.toFixed(1)}
        </div>
      )}
    </div>
  );
}; 
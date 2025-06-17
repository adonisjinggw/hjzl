import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  Quote, 
  Phone, 
  Star, 
  Clock,
  DollarSign,
  Compass,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  getComprehensiveTravelInfo,
  type WeatherInfo,
  type LocationInfo,
  type TravelQuote,
  type PointOfInterest,
  getCurrencyRate,
  type CurrencyRate
} from '../services/freeApiService';

interface TravelInfoPanelProps {
  destination: string;
  className?: string;
}

/**
 * 旅行信息面板组件
 * 显示从免费API获取的各种旅行相关信息
 */
export const TravelInfoPanel: React.FC<TravelInfoPanelProps> = ({
  destination,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [travelInfo, setTravelInfo] = useState<any>(null);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取旅行信息
   */
  const fetchTravelInfo = async () => {
    if (!destination) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const info = await getComprehensiveTravelInfo(destination);
      setTravelInfo(info);
      
      // 获取汇率信息
      if (info.location && 'country' in info.location) {
        const location = info.location as LocationInfo;
        if (location.currency !== 'CNY') {
          try {
            const rate = await getCurrencyRate('CNY', location.currency);
            setCurrencyRates([rate]);
          } catch (rateError) {
            console.warn('获取汇率失败:', rateError);
          }
        }
      }
    } catch (err) {
      console.error('获取旅行信息失败:', err);
      setError(err instanceof Error ? err.message : '获取旅行信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelInfo();
  }, [destination]);

  if (!destination) {
    return null;
  }

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              旅行助手 - {destination}
            </h3>
            {isLoading && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchTravelInfo}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              title="刷新信息"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title={isExpanded ? '收起' : '展开'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-900/30 border-b border-slate-700">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* 内容区域 */}
      {isExpanded && travelInfo && (
        <div className="p-4 space-y-6">
          {/* 天气信息 */}
          {travelInfo.weather && !travelInfo.weather.error && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Cloud className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-white">天气状况</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-300">{travelInfo.weather.temperature}°C</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{travelInfo.weather.icon}</span>
                  <span className="text-slate-300">{travelInfo.weather.description}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">湿度 {travelInfo.weather.humidity}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <span className="text-slate-300">风速 {travelInfo.weather.windSpeed}km/h</span>
                </div>
              </div>
            </div>
          )}

          {/* 地理位置信息 */}
          {travelInfo.location && !travelInfo.location.error && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Compass className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-white">位置信息</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-300">
                <div>
                  <span className="text-slate-400">国家：</span>
                  <span>{travelInfo.location.country}</span>
                </div>
                <div>
                  <span className="text-slate-400">地区：</span>
                  <span>{travelInfo.location.region}</span>
                </div>
                <div>
                  <span className="text-slate-400">时区：</span>
                  <span>{travelInfo.location.timezone}</span>
                </div>
                <div>
                  <span className="text-slate-400">货币：</span>
                  <span>{travelInfo.location.currency}</span>
                </div>
                <div>
                  <span className="text-slate-400">语言：</span>
                  <span>{travelInfo.location.language}</span>
                </div>
              </div>
            </div>
          )}

          {/* 汇率信息 */}
          {currencyRates.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <h4 className="font-semibold text-white">汇率信息</h4>
              </div>
              <div className="space-y-2">
                {currencyRates.map((rate, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">1 {rate.from} =</span>
                    <span className="text-white font-medium">{rate.rate.toFixed(4)} {rate.to}</span>
                  </div>
                ))}
                <div className="text-xs text-slate-500 mt-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  更新时间: {currencyRates[0]?.lastUpdate ? new Date(currencyRates[0].lastUpdate).toLocaleString('zh-CN') : '未知'}
                </div>
              </div>
            </div>
          )}

          {/* 旅行名言 */}
          {travelInfo.quote && !travelInfo.quote.error && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Quote className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold text-white">旅行格言</h4>
              </div>
              <blockquote className="text-slate-300 italic">
                "{travelInfo.quote.text}"
                <footer className="text-slate-400 text-sm mt-2">
                  — {travelInfo.quote.author}
                </footer>
              </blockquote>
            </div>
          )}

          {/* 兴趣点 */}
          {travelInfo.pointsOfInterest && !travelInfo.pointsOfInterest.error && travelInfo.pointsOfInterest.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-5 h-5 text-amber-400" />
                <h4 className="font-semibold text-white">推荐景点</h4>
              </div>
              <div className="space-y-3">
                {travelInfo.pointsOfInterest.slice(0, 5).map((poi: PointOfInterest, index: number) => (
                  <div key={index} className="border-l-2 border-amber-400 pl-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-white">{poi.name}</h5>
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                        {poi.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{poi.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 紧急联系方式 */}
          {travelInfo.emergencyContacts && !travelInfo.emergencyContacts.error && (
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/30">
              <div className="flex items-center space-x-2 mb-3">
                <Phone className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-white">紧急联系</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(travelInfo.emergencyContacts).map(([service, number]) => (
                  <div key={service} className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">{service}:</span>
                    <a 
                      href={`tel:${number}`}
                      className="text-red-400 font-mono text-sm hover:text-red-300 transition-colors"
                    >
                      {String(number)}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 数据时间戳 */}
          <div className="text-xs text-slate-500 text-center">
            <Clock className="w-3 h-3 inline mr-1" />
            信息获取时间: {travelInfo.generatedAt ? new Date(travelInfo.generatedAt).toLocaleString('zh-CN') : '未知'}
          </div>
        </div>
      )}

      {/* 收起状态的简要信息 */}
      {!isExpanded && travelInfo && (
        <div className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {travelInfo.weather && !travelInfo.weather.error && (
                <div className="flex items-center space-x-1 text-slate-400">
                  <span>{travelInfo.weather.icon}</span>
                  <span>{travelInfo.weather.temperature}°C</span>
                </div>
              )}
              {travelInfo.location && !travelInfo.location.error && (
                <div className="text-slate-400">
                  {travelInfo.location.country} · {travelInfo.location.currency}
                </div>
              )}
            </div>
            <div className="text-slate-500">
              点击展开查看详细信息
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
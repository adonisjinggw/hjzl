import React, { useState } from 'react';
import type { 
  UserInputs, 
  GeneratedScenario, 
  GeneratedSocialMediaCopy, 
  GeneratedVideoScript, 
  GeneratedImageData, 
  FakeEngagementData, 
  FakeComment, 
  CoreScene,
  GeneratedRealisticItinerary,
  RealisticDayPlan,
  RealisticActivity,
  TravelReflectionCard
} from '../types';
import { ImageWithWatermark } from './ImageWithWatermark';
import { MapDisplay } from './MapDisplay';
import { TravelReflectionCardComponent } from './TravelReflectionCard';
import { Lightbulb, BookOpen, Film, Users, BarChart2, MessageCircle, MapPin, CalendarDays, Sparkles, Plane, Heart, ArrowLeft, Home, RefreshCw, LogOut } from 'lucide-react';

interface ResultsDisplayProps {
  userInputs: UserInputs;
  // Fictional mode data
  scenario: GeneratedScenario | null;
  // Realistic mode data
  realisticItinerary: GeneratedRealisticItinerary | null;
  // Common data (content will differ based on mode)
  socialMediaCopy: GeneratedSocialMediaCopy | null;
  videoScript: GeneratedVideoScript | null;
  generatedImages: GeneratedImageData[];
  fakeEngagement: FakeEngagementData | null;
  fakeComments: FakeComment[];
  travelReflectionCards: TravelReflectionCard[];
  onReset?: () => void;
  onBackToHome?: () => void;
  onBackToSetup?: () => void;
  onExit?: () => void;
  onRetryImage?: (index: number) => Promise<void>;
  /**
   * 每张图片的刷新错误提示（可选）
   */
  refreshError?: string[];
}

type ActiveTab = 'overview' | 'social' | 'video' | 'gallery' | 'map' | 'reflections';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 -mb-px font-semibold border-b-2 transition-colors duration-150 ease-in-out focus:outline-none
      ${active ? 'border-accent-500 text-accent-400' : 'border-transparent text-slate-400 hover:text-accent-300'}`}
  >
    {children}
  </button>
);

/**
 * 图片卡片刷新按钮组件
 * @param loading 是否加载中
 * @param onClick 点击事件
 */
const RefreshButton: React.FC<{loading: boolean, onClick: () => void}> = ({ loading, onClick }) => (
  <button
    className="absolute top-3 right-3 bg-slate-800/80 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200 z-10 disabled:opacity-50"
    onClick={onClick}
    disabled={loading}
    title="刷新图片"
  >
    {loading ? (
      <span className="animate-spin">🔄</span>
    ) : (
      <span>🔄</span>
    )}
  </button>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  userInputs,
  scenario,
  realisticItinerary,
  socialMediaCopy,
  videoScript,
  generatedImages,
  fakeEngagement,
  fakeComments,
  travelReflectionCards,
  onReset,
  onBackToHome,
  onBackToSetup,
  onExit,
  onRetryImage,
  refreshError = [],
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const isRealisticMode = userInputs.travelMode === 'realistic';
  const [refreshingIndexes, setRefreshingIndexes] = useState<number[]>([]);

  const renderFictionalSceneDetails = (scene: CoreScene, index: number) => (
    <div key={index} className="mb-6 p-4 bg-slate-700/50 rounded-lg shadow">
      <h4 className="text-xl font-semibold text-accent-400 mb-2">{scene.name}</h4>
      <p className="text-slate-300 mb-2"><strong className="text-slate-100">感官描述：</strong>{scene.description}</p>
      <p className="text-slate-300 mb-2"><strong className="text-slate-100">网红属性：</strong>{scene.influencerAttribute}</p>
      <p className="text-slate-300"><strong className="text-slate-100">互动彩蛋：</strong>{scene.interactiveEgg}</p>
    </div>
  );
  
  const renderRealisticActivityDetails = (activity: RealisticActivity, index: number) => (
     <div key={index} className="mb-3 p-3 bg-slate-600/30 rounded-md shadow-sm">
        <h5 className="text-md font-semibold text-accent-300">{activity.name} <span className="text-xs px-1.5 py-0.5 bg-primary-700 text-primary-200 rounded-full ml-2">{activity.type}</span></h5>
        <p className="text-sm text-slate-300 mt-1">{activity.description}</p>
        {activity.estimatedDurationHours && <p className="text-xs text-slate-400 mt-1">预估时长：{activity.estimatedDurationHours}小时</p>}
        {activity.addressOrArea && <p className="text-xs text-slate-400 mt-1">地点/区域：{activity.addressOrArea}</p>}
        {activity.notes && <p className="text-xs text-slate-400 mt-1 italic">小贴士：{activity.notes}</p>}
     </div>
  );

  const renderRealisticDayPlan = (dayPlan: RealisticDayPlan, index: number) => (
    <div key={index} className="mb-6 p-4 bg-slate-700/50 rounded-lg shadow">
      <h4 className="text-xl font-semibold text-accent-400 mb-2">第 {dayPlan.dayNumber} 天 {dayPlan.summary ? `- ${dayPlan.summary}` : ''}</h4>
      {dayPlan.activities.map(renderRealisticActivityDetails)}
    </div>
  );

  // 自动兜底刷新逻辑，无需用户手动理解props
  const safeOnRetryImage = onRetryImage
    ? onRetryImage
    : async (index: number) => {
        window.alert('请联系开发者完善图片刷新逻辑！');
      };

  const handleRetryImage = async (index: number) => {
    setRefreshingIndexes(prev => [...prev, index]);
    await safeOnRetryImage(index);
    setRefreshingIndexes(prev => prev.filter(i => i !== index));
  };

  return (
    <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-2xl">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200 group"
              title="返回首页"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">返回首页</span>
            </button>
          )}
          {onBackToSetup && (
            <button
              onClick={onBackToSetup}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 group"
              title="重新设置旅程"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">重新设置</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onExit && (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 group"
              title="退出应用"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span className="hidden sm:inline">退出</span>
            </button>
          )}
        </div>
      </div>

      {/* 退出确认模态框 */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">确认退出</h3>
              <p className="text-slate-300 mb-6">
                您确定要退出幻境之旅生成器吗？当前生成的内容将会丢失。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    if (onExit) onExit();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-500">
        您的专属{isRealisticMode ? '真实模拟之旅' : '幻境之旅'}已生成！
      </h2>
      
      <div className="mb-6 border-b border-slate-700">
        <nav className="flex space-x-1">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            {isRealisticMode ? <Plane size={18} className="inline mr-1"/> : <Lightbulb size={18} className="inline mr-1"/>}
            {isRealisticMode ? '行程概览' : '旅程概览'}
          </TabButton>
          <TabButton active={activeTab === 'map'} onClick={() => setActiveTab('map')}>
            <MapPin size={18} className="inline mr-1"/>
            {isRealisticMode ? '地理地图' : '幻境地图'}
          </TabButton>
          <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')}><BookOpen size={18} className="inline mr-1"/> 社交文案</TabButton>
          <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')}><Film size={18} className="inline mr-1"/> 短视频脚本</TabButton>
          <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')}><Users size={18} className="inline mr-1"/> {isRealisticMode ? '旅行相册' : '虚拟画廊'}</TabButton>
          <TabButton active={activeTab === 'reflections'} onClick={() => setActiveTab('reflections')}><Heart size={18} className="inline mr-1"/> 感言卡片</TabButton>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="prose prose-invert max-w-none prose-headings:text-accent-300 prose-strong:text-slate-100">
          {isRealisticMode && realisticItinerary && (
            <>
              <h3 className="text-2xl font-semibold text-primary-400 mb-3 flex items-center"><MapPin size={22} className="mr-2"/> 目的地：{realisticItinerary.destinationName}</h3>
              <p className="text-slate-300 mb-1"><strong>旅行主题：</strong>{realisticItinerary.travelTheme}</p>
              <p className="text-slate-300 mb-1"><strong>旅行时长：</strong>{realisticItinerary.duration}</p>
              <p className="text-slate-300 mb-4"><strong>旅行者类型：</strong>{realisticItinerary.travelerPersona}</p>
              {realisticItinerary.suggestedBudgetLevel && <p className="text-slate-300 mb-4"><strong>建议预算：</strong>{realisticItinerary.suggestedBudgetLevel}</p>}

              <div className="mb-8 not-prose">
                <MapDisplay 
                  isRealistic={true}
                  itinerary={realisticItinerary}
                />
              </div>

              <h4 className="text-xl font-semibold text-accent-300 mt-6 mb-3 flex items-center"><CalendarDays size={20} className="mr-2"/> 每日行程亮点：</h4>
              {realisticItinerary.dailyPlans.map(renderRealisticDayPlan)}

              {realisticItinerary.overallTravelTips && realisticItinerary.overallTravelTips.length > 0 && (
                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg shadow">
                  <h4 className="text-xl font-semibold text-accent-400 mb-2">旅行小贴士</h4>
                  <ul className="list-disc pl-5 text-slate-300">
                    {realisticItinerary.overallTravelTips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}

          {!isRealisticMode && scenario && (
            <>
              <h3 className="text-2xl font-semibold text-primary-400 mb-3">目的地：{scenario.destinationName}</h3>
              <p className="text-slate-300 mb-2"><strong>主题风格：</strong>{userInputs.theme}</p>
              <p className="text-slate-300 mb-2"><strong>旅行时长：</strong>{userInputs.duration}</p>
              <p className="text-slate-300 mb-4"><strong>您的身份：</strong>{userInputs.persona}</p>

              <div className="mb-8 not-prose">
                <MapDisplay 
                  isRealistic={false}
                  scenario={scenario}
                />
              </div>
              
              <h4 className="text-xl font-semibold text-accent-300 mt-6 mb-3 flex items-center"><Sparkles size={20} className="mr-2"/>核心奇幻场景：</h4>
              {scenario.coreScenes.map(renderFictionalSceneDetails)}

              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg shadow">
                 <h4 className="text-xl font-semibold text-accent-400 mb-2">剧情伏笔</h4>
                 <p className="text-slate-300">{scenario.plotHook}</p>
              </div>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg shadow">
                 <h4 className="text-xl font-semibold text-accent-400 mb-2">当地文化一瞥</h4>
                 <p className="text-slate-300">{scenario.fictionalCulture}</p>
              </div>
              {scenario.worldviewHint && (
                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg shadow">
                   <h4 className="text-xl font-semibold text-accent-400 mb-2">隐藏世界观提示</h4>
                   <p className="text-slate-300">{scenario.worldviewHint}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <div>
          <h3 className="text-2xl font-semibold text-primary-400 mb-4">
            {isRealisticMode ? '🗺️ 地理位置地图' : '🧭 幻境探索地图'}
          </h3>
          <MapDisplay 
            isRealistic={isRealisticMode}
            scenario={isRealisticMode ? undefined : scenario}
            itinerary={isRealisticMode ? realisticItinerary : undefined}
          />
          
          {/* 地图详细信息 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {isRealisticMode && realisticItinerary && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-accent-300 mb-3">📍 位置信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">目的地：</span>
                    <span className="text-white font-medium">{realisticItinerary.destinationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">旅行天数：</span>
                    <span className="text-white font-medium">{realisticItinerary.dailyPlans.length} 天</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">主要景点：</span>
                    <span className="text-white font-medium">{realisticItinerary.dailyPlans.reduce((total, day) => total + day.activities.length, 0)} 个</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">预算级别：</span>
                    <span className="text-white font-medium">{realisticItinerary.suggestedBudgetLevel || '标准'}</span>
                  </div>
                </div>
              </div>
            )}

            {!isRealisticMode && scenario && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-accent-300 mb-3">🌟 幻境信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">幻境名称：</span>
                    <span className="text-white font-medium">{scenario.destinationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">核心场景：</span>
                    <span className="text-white font-medium">{scenario.coreScenes.length} 处</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">探索模式：</span>
                    <span className="text-white font-medium">{userInputs.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">冒险时长：</span>
                    <span className="text-white font-medium">{userInputs.duration}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-accent-300 mb-3">🎯 使用说明</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {isRealisticMode ? (
                  <>
                    <li>• 红色标记表示主要目的地中心</li>
                    <li>• 蓝色标记表示每日行程安排</li>
                    <li>• 虚线连接显示推荐游览路线</li>
                    <li>• 坐标信息显示真实地理位置</li>
                  </>
                ) : (
                  <>
                    <li>• 彩色标记表示不同类型的奇幻场景</li>
                    <li>• 中心传送门连接各个神秘区域</li>
                    <li>• 虚线路径指引冒险探索方向</li>
                    <li>• 背景山脉营造仙境氛围效果</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && socialMediaCopy && (
        <div className="prose prose-invert max-w-none prose-headings:text-accent-300 prose-p:text-slate-300">
          <h3 className="text-2xl font-semibold text-primary-400 mb-4">自媒体文案 ({isRealisticMode ? '真实游记风格' : '小红书/公众号风格'})</h3>
          <div className="bg-slate-700/90 border border-slate-600 p-6 rounded-lg shadow-lg">
            <div className="text-white font-medium text-lg leading-relaxed whitespace-pre-wrap bg-slate-800/50 p-4 rounded-md border border-slate-600">
              {socialMediaCopy.text}
            </div>
            {/* 复制按钮 */}
            <div className="mt-4 pt-4 border-t border-slate-600">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(socialMediaCopy.text);
                  // 可以添加复制成功提示
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                📋 复制文案
              </button>
            </div>
          </div>
          {fakeEngagement && (
            <div className="mt-4 text-sm text-slate-300 flex items-center space-x-4 p-4 bg-slate-700/80 rounded-lg border border-slate-600">
              <BarChart2 size={16} className="inline text-accent-400" />
              <span className="font-medium">阅读量: <span className="text-white">{fakeEngagement.reads}</span></span>
              <span className="font-medium">收藏: <span className="text-white">{fakeEngagement.collections}</span></span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'video' && videoScript && (
        <div className="prose prose-invert max-w-none prose-headings:text-accent-300">
          <h3 className="text-2xl font-semibold text-primary-400 mb-4">短视频脚本 ({isRealisticMode ? '旅行Vlog风格' : '抖音/快手风格'})</h3>
          <div className="bg-slate-700/50 p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold text-accent-300">标题建议: {videoScript.titleSuggestion}</h4>
            <div className="mt-4 space-y-3">
              {videoScript.scenes.map((scene, i) => (
                <div key={i} className="p-3 bg-slate-600/50 rounded">
                  <p className="text-slate-200"><strong>镜头 {i+1} ({scene.duration_seconds}s):</strong> {scene.shot}</p>
                  <p className="text-sm text-slate-400"><em>笔记: {scene.audio_visual_notes}</em></p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <strong className="text-slate-100">动态标签:</strong> {videoScript.dynamicTags.join(', ')}
            </div>
            <div className="mt-3">
              <strong className="text-slate-100">伪造弹幕:</strong>
              <ul className="list-disc list-inside text-slate-300 ml-4 text-sm">
                {videoScript.fakeBulletComments.map((comment, i) => (
                  <li key={i}>({comment.time_cue}) {comment.comment}</li>
                ))}
              </ul>
            </div>
            {fakeEngagement && (
              <div className="mt-4 text-sm text-slate-400 flex items-center space-x-4 p-3 bg-slate-700 rounded-md">
                <BarChart2 size={16} className="inline text-accent-500" />
                <span>{videoScript.fakeDataMetrics}</span>
                <span>点赞率: {fakeEngagement.likeRate}</span>
                <span>完播率: {fakeEngagement.completionRate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div>
          <h3 className="text-2xl font-semibold text-primary-400 mb-6">{isRealisticMode ? '📸 旅行相册' : '🎨 虚拟旅行画廊'}</h3>
          {generatedImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((imgData, index) => (
                <div key={index} className="relative transform transition-all duration-300 hover:-translate-y-2">
                  {/* 刷新按钮始终显示，无论图片是否生成 */}
                  <RefreshButton loading={refreshingIndexes.includes(index)} onClick={() => handleRetryImage(index)} />
                  {imgData.imageBase64 ? (
                    <ImageWithWatermark
                      src={imgData.imageBase64 || imgData.src || ''}
                      alt={imgData.sceneName || `${isRealisticMode ? '旅行' : '场景'}${index + 1}`}
                      userName={imgData.userName || (isRealisticMode ? '旅行达人' : '幻境探索者')}
                      fictionalPlace={imgData.fictionalPlace}
                      realPlaceContext={imgData.realPlaceContext} 
                      filterApplied={imgData.filterApplied || '原生色彩'}
                      isRealistic={isRealisticMode}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-700/60 rounded-lg">
                      <span className="text-4xl mb-2">⚠️</span>
                      <span className="text-slate-300 mb-2">生成失败</span>
                    </div>
                  )}
                  {/* 刷新失败错误提示 */}
                  {refreshError[index] && (
                    <div className="mt-2 text-xs text-red-400 text-center">{refreshError[index]}</div>
                  )}
                  {/* 图片详细信息卡片 */}
                  <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="text-lg font-semibold text-accent-300 mb-2">
                      {imgData.sceneName || `${isRealisticMode ? '精彩瞬间' : '神秘场景'} ${index + 1}`}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">📍 地点：</span>
                        <span className="text-white font-medium">
                          {imgData.realPlaceContext || imgData.fictionalPlace || '神秘之地'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">🎨 滤镜：</span>
                        <span className="text-white font-medium">{imgData.filterApplied || '原生色彩'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">🤖 AI提供商：</span>
                        <span className="text-white font-medium">
                          {imgData.apiProvider === 'huggingface' ? 'RunningHub' : imgData.apiProvider}
                        </span>
                      </div>
                      {imgData.promptUsed && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <span className="text-slate-400 text-xs">💭 生成提示：</span>
                          <p className="text-slate-300 text-xs mt-1 line-clamp-2">{imgData.promptUsed}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <h4 className="text-xl font-semibold text-slate-300 mb-2">暂无生成的照片</h4>
              <p className="text-slate-400">AI正在努力为您生成精美的{isRealisticMode ? '旅行' : '幻境'}图片...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reflections' && (
        <div>
          <h3 className="text-2xl font-semibold text-primary-400 mb-6">{isRealisticMode ? '💭 旅行感言卡片' : '✨ 幻境感言卡片'}</h3>
          {travelReflectionCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {travelReflectionCards.map((card, index) => (
                <div key={card.id || index} className="transform transition-all duration-300 hover:-translate-y-2">
                  <TravelReflectionCardComponent
                    card={card}
                    index={index}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h4 className="text-xl font-semibold text-slate-300 mb-2">暂无生成的感言卡片</h4>
              <p className="text-slate-400">AI正在努力为您生成个性化的{isRealisticMode ? '旅行' : '幻境'}感言卡片...</p>
            </div>
          )}
        </div>
      )}
      
      {/* 模拟用户反馈部分 */}
      {(fakeComments.length > 0 || fakeEngagement) && (
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="text-2xl font-semibold text-primary-400 mb-6 flex items-center">
            <MessageCircle size={24} className="mr-2 text-accent-400"/> 
            {isRealisticMode ? '🌟 游客真实反馈' : '✨ 探险者互动评论'}
          </h3>
          
          {/* 数据概览 */}
          {fakeEngagement && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-400/30">
                <div className="text-2xl font-bold text-blue-300">{fakeEngagement.reads}</div>
                <div className="text-sm text-slate-400">📖 总阅读量</div>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-4 rounded-lg border border-red-400/30">
                <div className="text-2xl font-bold text-red-300">{fakeEngagement.likeRate}</div>
                <div className="text-sm text-slate-400">❤️ 点赞率</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-400/30">
                <div className="text-2xl font-bold text-yellow-300">{fakeEngagement.collections}</div>
                <div className="text-sm text-slate-400">⭐ 收藏数</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-400/30">
                <div className="text-2xl font-bold text-green-300">{fakeEngagement.completionRate}</div>
                <div className="text-sm text-slate-400">📊 完成率</div>
              </div>
            </div>
          )}

          {/* 用户评论列表 */}
          {fakeComments.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {fakeComments.map((comment, index) => {
                // 生成随机头像颜色
                const avatarColors = [
                  'bg-gradient-to-br from-purple-500 to-blue-500',
                  'bg-gradient-to-br from-green-500 to-cyan-500', 
                  'bg-gradient-to-br from-red-500 to-pink-500',
                  'bg-gradient-to-br from-yellow-500 to-orange-500',
                  'bg-gradient-to-br from-indigo-500 to-purple-500'
                ];
                const avatarColor = avatarColors[index % avatarColors.length];
                
                // 获取用户名首字符
                const userInitial = comment.userName?.charAt(0) || '用';
                
                // 格式化时间
                const timeAgo = (() => {
                  const now = new Date();
                  const commentTime = new Date(comment.timestamp);
                  const diffInHours = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60 * 60));
                  
                  if (diffInHours < 1) return '刚刚';
                  if (diffInHours < 24) return `${diffInHours}小时前`;
                  return `${Math.floor(diffInHours / 24)}天前`;
                })();

                return (
                  <div key={comment.id || index} className="flex items-start space-x-4 p-4 bg-slate-700/70 rounded-xl shadow-md hover:bg-slate-700/90 transition-all duration-200">
                    {/* 用户头像 */}
                    <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {userInitial}
                    </div>
                    
                    {/* 评论内容 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-semibold text-accent-300">{comment.userName}</p>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{timeAgo}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{comment.content}</p>
                      
                      {/* 互动按钮 */}
                      <div className="flex items-center space-x-4 mt-3 text-xs text-slate-400">
                        <button className="flex items-center space-x-1 hover:text-red-400 transition-colors">
                          <span>❤️</span>
                          <span>{Math.floor(Math.random() * 50) + 1}</span>
                        </button>
                        <button className="hover:text-blue-400 transition-colors">
                          💬 回复
                        </button>
                        {isRealisticMode && (
                          <span className="text-green-400">✅ 已验证游客</span>
                        )}
                        {!isRealisticMode && Math.random() > 0.7 && (
                          <span className="text-purple-400">🔮 探险老手</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 空状态 */}
          {fakeComments.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-400">暂无用户评论，成为第一个评论者吧！</p>
            </div>
          )}
        </div>
      )}

      {/* 重新开始按钮 */}
      {onReset && (
        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <button
            onClick={onReset}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            🔄 重新开始新的旅程
          </button>
          <p className="text-slate-400 text-sm mt-2">
            创建一个全新的旅行体验
          </p>
        </div>
      )}
    </div>
  );
};

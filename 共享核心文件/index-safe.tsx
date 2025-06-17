import React from 'react';
import ReactDOM from 'react-dom/client';

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full text-center text-white">
            <h1 className="text-3xl font-bold mb-4 text-red-400">🚨 应用加载错误</h1>
            <p className="text-lg mb-6">React应用遇到了问题，正在切换到安全模式...</p>
            <div className="bg-red-500/20 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2">错误详情：</h3>
              <pre className="text-sm overflow-auto">
                {this.state.error?.message || '未知错误'}
              </pre>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🔄 重新加载
            </button>
            <div className="mt-4 text-sm text-gray-300">
              <p>如果问题持续，请使用简化版本：</p>
              <a href="/simple-index.html" className="text-blue-400 hover:underline">
                点击这里使用简化版本
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 简化的应用组件
const SafeApp = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 模拟应用初始化
    const initApp = async () => {
      try {
        // 检查必要的依赖
        if (typeof React === 'undefined') {
          throw new Error('React 未正确加载');
        }
        
        // 延迟加载主应用
        const { default: App } = await import('./App');
        setIsLoading(false);
        
        // 渲染主应用
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
          const root = ReactDOM.createRoot(appContainer);
          root.render(<App />);
        }
      } catch (err) {
        console.error('应用初始化失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2">🌟 幻境之旅生成器</h2>
          <p className="text-blue-200">正在加载应用...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full text-center text-white">
          <h1 className="text-3xl font-bold mb-4 text-red-400">⚠️ 加载失败</h1>
          <p className="text-lg mb-6">主应用无法加载，请使用简化版本</p>
          <div className="bg-red-500/20 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">错误信息：</h3>
            <p className="text-sm">{error}</p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors mr-4"
            >
              🔄 重试
            </button>
            <button 
              onClick={() => window.location.href = '/simple-index.html'} 
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🚀 使用简化版本
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div id="app-container"></div>;
};

// 主入口
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("找不到根元素挂载React应用");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <SafeApp />
    </ErrorBoundary>
  </React.StrictMode>
);

// 集成 stagewise 开发工具栏 - 仅在开发环境下加载
if (process.env.NODE_ENV === 'development') {
  // 动态导入 stagewise 工具栏，避免生产环境包含相关代码
  import('@stagewise/toolbar-react').then(({ StagewiseToolbar }) => {
    // 创建工具栏配置
    const stagewiseConfig = {
      plugins: []
    };

    // 为工具栏创建独立的DOM容器
    const toolbarContainer = document.createElement('div');
    toolbarContainer.id = 'stagewise-toolbar';
    document.body.appendChild(toolbarContainer);

    // 创建独立的React根节点来渲染工具栏
    const toolbarRoot = ReactDOM.createRoot(toolbarContainer);
    toolbarRoot.render(
      <StagewiseToolbar config={stagewiseConfig} />
    );
  }).catch(error => {
    console.warn('Stagewise 工具栏加载失败:', error);
  });
} 
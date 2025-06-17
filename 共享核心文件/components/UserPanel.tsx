import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Share2, 
  Users, 
  Crown, 
  Gift,
  TrendingUp,
  Calendar,
  Zap,
  CheckCircle,
  Copy,
  MessageCircle,
  Camera,
  Link,
  X,
  Star,
  Medal,
  Sparkles,
  Video
} from 'lucide-react';
import { User, PaymentPlan } from '../types';
import userService from '../services/userService';

interface UserPanelProps {
  onClose: () => void;
}

/**
 * 用户中心面板组件
 * 集成注册、登录、体验管理、分享、邀请、付费等完整功能
 */
export default function UserPanel({ onClose }: UserPanelProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'profile' | 'share' | 'invite' | 'pricing'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({ emailOrUsername: '', password: '' });
  
  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    username: '', 
    password: '', 
    confirmPassword: '',
    inviteCode: ''
  });

  // 使用限制状态
  const [usageInfo, setUsageInfo] = useState<{
    canUse: boolean;
    remainingToday: number;
    nextResetTime: string;
  }>({ canUse: true, remainingToday: 0, nextResetTime: '' });

  // 用户统计
  const [userStats, setUserStats] = useState<{
    totalGenerations: number;
    totalShares: number;
    totalInvites: number;
    memberSince: string;
  }>({ totalGenerations: 0, totalShares: 0, totalInvites: 0, memberSince: '' });

  // 邀请链接状态
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  // 付费计划
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);

  useEffect(() => {
    // 初始化用户状态
    const user = userService.getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      setActiveTab('profile');
      updateUsageInfo(user.id);
      updateUserStats(user.id);
    } else {
      // 检查URL中是否有邀请码
      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('invite');
      if (inviteCode) {
        setRegisterForm(prev => ({ ...prev, inviteCode }));
        setActiveTab('register');
      }
    }

    // 获取付费计划
    setPaymentPlans(userService.getPaymentPlans());

    // 检查游客使用情况
    if (!user) {
      updateUsageInfo();
    }
  }, []);

  const updateUsageInfo = (userId?: string) => {
    const info = userService.checkUsageLimit(userId);
    setUsageInfo(info);
  };

  const updateUserStats = (userId: string) => {
    const stats = userService.getUserStats(userId);
    setUserStats(stats);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await userService.login(loginForm.emailOrUsername, loginForm.password);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setActiveTab('profile');
        updateUsageInfo(result.user.id);
        updateUserStats(result.user.id);
        showMessage('success', '登录成功！');
      } else {
        showMessage('error', result.error || '登录失败');
      }
    } catch (error) {
      showMessage('error', '登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      showMessage('error', '两次输入的密码不一致');
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await userService.register(
        registerForm.email,
        registerForm.username,
        registerForm.password,
        registerForm.inviteCode || undefined
      );
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setActiveTab('profile');
        updateUsageInfo(result.user.id);
        updateUserStats(result.user.id);
        showMessage('success', '注册成功！' + (registerForm.inviteCode ? ' 邀请奖励已发放！' : ''));
      } else {
        showMessage('error', result.error || '注册失败');
      }
    } catch (error) {
      showMessage('error', '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    userService.logout();
    setCurrentUser(null);
    setActiveTab('login');
    updateUsageInfo();
    showMessage('success', '已退出登录');
  };

  const handleShare = async (platform: string) => {
    if (!currentUser) return;

    try {
      const result = await userService.shareContent(
        currentUser.id,
        'scenario',
        'current_content',
        platform as any
      );

      if (result.success) {
        if (result.bonusAwarded) {
          showMessage('success', '分享成功！获得2次体验奖励！');
          updateUsageInfo(currentUser.id);
        } else {
          showMessage('success', '分享成功！（今日分享奖励已达上限）');
        }
        updateUserStats(currentUser.id);
      } else {
        showMessage('error', result.error || '分享失败');
      }
    } catch (error) {
      showMessage('error', '分享失败，请稍后重试');
    }
  };

  const generateInviteLink = () => {
    if (!currentUser) return;

    const result = userService.generateInviteLink(currentUser.id);
    if (result.success && result.inviteLink) {
      setInviteLink(result.inviteLink);
      showMessage('success', '邀请链接生成成功！');
    } else {
      showMessage('error', result.error || '生成邀请链接失败');
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showMessage('success', '邀请链接已复制到剪贴板！');
    } catch (error) {
      showMessage('error', '复制失败，请手动复制');
    }
  };

  const handlePurchase = async (planId: string) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const result = await userService.initiatePurchase(currentUser.id, planId, 'alipay');
      if (result.success) {
        showMessage('success', '支付已发起，请稍等...');
        // 模拟支付成功后更新用户状态
        setTimeout(() => {
          const updatedUser = userService.getCurrentUser();
          if (updatedUser) {
            setCurrentUser(updatedUser);
            updateUsageInfo(updatedUser.id);
            showMessage('success', '支付成功！会员权益已生效！');
          }
        }, 3000);
      } else {
        showMessage('error', result.error || '支付失败');
      }
    } catch (error) {
      showMessage('error', '支付失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      guest: { icon: UserIcon, text: '游客', color: 'bg-gray-500' },
      free: { icon: Star, text: '免费用户', color: 'bg-blue-500' },
      premium: { icon: Medal, text: '高级会员', color: 'bg-purple-500' },
      pro: { icon: Crown, text: '专业会员', color: 'bg-yellow-500' }
    };
    
    const badge = badges[tier as keyof typeof badges] || badges.guest;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const shareButtons = [
    { platform: 'wechat', name: '微信', icon: MessageCircle, color: 'bg-green-500' },
    { platform: 'weibo', name: '微博', icon: Share2, color: 'bg-red-500' },
    { platform: 'qq', name: 'QQ', icon: MessageCircle, color: 'bg-blue-600' },
    { platform: 'douyin', name: '抖音', icon: Video, color: 'bg-black' },
    { platform: 'xiaohongshu', name: '小红书', icon: Camera, color: 'bg-pink-500' },
    { platform: 'link', name: '复制链接', icon: Link, color: 'bg-gray-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">用户中心</h2>
                <p className="text-blue-100">
                  {currentUser ? `欢迎回来，${currentUser.profile?.nickname || currentUser.username || '用户'}！` : '登录享受更多功能'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 标签导航 */}
          <div className="mt-6 flex space-x-1 bg-white bg-opacity-10 rounded-lg p-1">
            {currentUser ? (
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'profile' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  个人资料
                </button>
                <button
                  onClick={() => setActiveTab('share')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'share' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <Share2 className="w-4 h-4 inline mr-2" />
                  分享赚次数
                </button>
                <button
                  onClick={() => setActiveTab('invite')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'invite' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  邀请好友
                </button>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'pricing' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <Crown className="w-4 h-4 inline mr-2" />
                  升级会员
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'login' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <LogIn className="w-4 h-4 inline mr-2" />
                  登录
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'register' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  注册
                </button>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'pricing' ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <Crown className="w-4 h-4 inline mr-2" />
                  查看会员
                </button>
              </>
            )}
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* 使用次数显示 */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">今日剩余次数</h3>
                <p className="text-3xl font-bold text-blue-600">{usageInfo.remainingToday}</p>
                <p className="text-sm text-gray-600">
                  {currentUser ? (currentUser.tier === 'guest' ? '游客模式' : `${currentUser.tier.toUpperCase()} 会员`) : '游客模式'}
                </p>
              </div>
              <div className="text-right">
                <Zap className="w-12 h-12 text-yellow-500 mb-2" />
                <p className="text-xs text-gray-500">明日自动重置</p>
              </div>
            </div>
          </div>

          {/* 标签内容 */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名或邮箱
                </label>
                <input
                  type="text"
                  value={loginForm.emailOrUsername}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, emailOrUsername: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入用户名或邮箱"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入密码"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入邮箱地址"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入用户名"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    密码
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入密码"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="再次输入密码"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邀请码（可选）
                </label>
                <input
                  type="text"
                  value={registerForm.inviteCode}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, inviteCode: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入邀请码可获得奖励次数"
                />
                {registerForm.inviteCode && (
                  <p className="text-sm text-green-600 mt-1">
                    <Gift className="w-4 h-4 inline mr-1" />
                    使用邀请码注册可获得5次奖励次数！
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '注册中...' : '注册账号'}
              </button>
            </form>
          )}

          {activeTab === 'profile' && currentUser && (
            <div className="space-y-6">
              {/* 用户信息卡片 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {currentUser.profile?.nickname?.[0] || currentUser.username?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {currentUser.profile?.nickname || currentUser.username || '用户'}
                      </h3>
                      <p className="text-gray-600">{currentUser.email}</p>
                      {getTierBadge(currentUser.tier)}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">{userStats.totalGenerations}</p>
                    <p className="text-sm text-gray-600">总生成次数</p>
                  </div>
                  <div className="text-center">
                    <Share2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">{userStats.totalShares}</p>
                    <p className="text-sm text-gray-600">分享次数</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">{userStats.totalInvites}</p>
                    <p className="text-sm text-gray-600">邀请人数</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(userStats.memberSince).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">注册时间</p>
                  </div>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('share')}
                  className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <Share2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-800">分享赚次数</h4>
                  <p className="text-sm text-gray-600">每日分享最多获得6次</p>
                </button>
                <button
                  onClick={() => setActiveTab('invite')}
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-800">邀请好友</h4>
                  <p className="text-sm text-gray-600">邀请1人双方各得5次</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-6">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">分享赚取体验次数</h3>
                <p className="text-gray-600">
                  分享你的精彩作品到社交平台，每日最多可获得 <span className="font-bold text-blue-600">6次</span> 奖励次数
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Gift className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">分享奖励规则</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• 每次分享可获得 2 次体验奖励</li>
                      <li>• 每日最多可获得 3 次分享奖励（6次体验）</li>
                      <li>• 分享到不同平台都可获得奖励</li>
                      <li>• 需要登录账号才能获得奖励</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {shareButtons.map((button) => {
                  const Icon = button.icon;
                  return (
                    <button
                      key={button.platform}
                      onClick={() => handleShare(button.platform)}
                      disabled={!currentUser}
                      className={`p-4 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${button.color}`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{button.name}</p>
                    </button>
                  );
                })}
              </div>

              {!currentUser && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">请先登录账号才能获得分享奖励</p>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    立即登录
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'invite' && (
            <div className="space-y-6">
              <div className="text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <Users className="w-20 h-20 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">邀请好友获得奖励</h3>
                <div className="text-lg text-gray-700 leading-relaxed">
                  邀请好友注册成功后，你和好友都将获得 
                  <span className="inline-block mx-2 px-3 py-1 bg-purple-600 text-white font-bold rounded-full text-xl shadow-lg">5次</span> 
                  体验奖励
                </div>
                <div className="mt-3 text-sm text-purple-700 font-medium">
                  立即分享，双方收益！
                </div>
              </div>

              {currentUser ? (
                <div className="space-y-6">
                  {!inviteLink ? (
                    <button
                      onClick={generateInviteLink}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      🎁 生成我的专属邀请链接
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
                        <h4 className="font-bold text-purple-900 mb-4 text-lg flex items-center">
                          <Link className="w-5 h-5 mr-2" />
                          你的专属邀请链接
                        </h4>
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={inviteLink}
                            readOnly
                            className="flex-1 p-3 bg-white border-2 border-purple-300 rounded-lg text-sm font-mono select-all text-gray-800 shadow-inner"
                          />
                          <button
                            onClick={copyInviteLink}
                            className={`px-4 py-3 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 ${
                              copied 
                                ? 'bg-green-500 text-white shadow-lg' 
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                            }`}
                          >
                            {copied ? (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>已复制</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Copy className="w-4 h-4" />
                                <span>复制</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
                        <div className="flex items-start space-x-4">
                          <Gift className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-bold text-blue-900 mb-3 text-lg">💰 邀请奖励规则</h4>
                            <ul className="text-base text-blue-800 space-y-2 font-medium">
                              <li className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                <span>好友通过你的链接注册成功</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                <span>你和好友各获得 <strong className="text-purple-700">5 次</strong> 体验奖励</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                <span>奖励会立即发放到账户</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                <span>可邀请多个好友，<strong className="text-green-700">无上限</strong></span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-4 text-lg">请先登录账号才能生成邀请链接</p>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                  >
                    立即登录
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="text-center">
                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">升级会员享受更多权益</h3>
                <p className="text-gray-600">选择适合你的会员计划，解锁更多高级功能</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                      plan.popular ? 'border-purple-500 shadow-lg' : 'border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                          最受欢迎
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h4>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ¥{plan.price}
                        <span className="text-sm font-normal text-gray-500">
                          /{plan.duration === 365 ? '年' : '月'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        每日 {plan.dailyLimit} 次体验
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePurchase(plan.id)}
                      disabled={isLoading || (currentUser?.tier === plan.tier)}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        currentUser?.tier === plan.tier
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {currentUser?.tier === plan.tier 
                        ? '当前计划' 
                        : isLoading 
                        ? '处理中...' 
                        : '立即升级'
                      }
                    </button>
                  </div>
                ))}
              </div>

              {!currentUser && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">请先登录账号才能购买会员</p>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    立即登录
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
import { 
  User, 
  UserTier, 
  UsageLimit, 
  ShareRecord, 
  InviteRecord, 
  PaymentPlan, 
  PaymentRecord, 
  UserActivity,
  SystemStats 
} from '../types';

/**
 * 用户管理服务
 * 提供完整的用户系统功能：注册、登录、体验次数、分享、邀请、付费
 */
class UserService {
  private readonly STORAGE_KEYS = {
    CURRENT_USER: 'travel_generator_current_user',
    USAGE_LIMITS: 'travel_generator_usage_limits',
    SHARE_RECORDS: 'travel_generator_share_records',
    INVITE_RECORDS: 'travel_generator_invite_records',
    PAYMENT_RECORDS: 'travel_generator_payment_records',
    USER_ACTIVITIES: 'travel_generator_user_activities',
    GUEST_USAGE: 'travel_generator_guest_usage'
  };

  private readonly TIER_LIMITS: Record<UserTier, { dailyLimit: number; features: string[] }> = {
    guest: { 
      dailyLimit: 3, 
      features: ['基础生成', '有限图片'] 
    },
    free: { 
      dailyLimit: 10, 
      features: ['基础生成', '标准图片', '分享功能', '邀请奖励'] 
    },
    premium: { 
      dailyLimit: 50, 
      features: ['高级生成', '高清图片', '视频脚本', '优先支持', '无广告'] 
    },
    pro: { 
      dailyLimit: 200, 
      features: ['无限生成', '4K图片', '专业视频', '专属客服', '早期功能'] 
    },
    admin: {
      dailyLimit: 999999,
      features: ['无限生成', '管理员权限', '系统监控', '用户管理', '数据分析', '所有功能']
    }
  };

  private readonly PAYMENT_PLANS: PaymentPlan[] = [
    {
      id: 'premium_monthly',
      name: '高级会员（月卡）',
      tier: 'premium',
      price: 29.9,
      duration: 30,
      dailyLimit: 50,
      features: ['高级生成', '高清图片', '视频脚本', '优先支持', '无广告'],
      popular: false
    },
    {
      id: 'premium_yearly',
      name: '高级会员（年卡）',
      tier: 'premium',
      price: 299,
      duration: 365,
      dailyLimit: 50,
      features: ['高级生成', '高清图片', '视频脚本', '优先支持', '无广告'],
      popular: true
    },
    {
      id: 'pro_monthly',
      name: '专业会员（月卡）',
      tier: 'pro',
      price: 99.9,
      duration: 30,
      dailyLimit: 200,
      features: ['无限生成', '4K图片', '专业视频', '专属客服', '早期功能'],
      popular: false
    },
    {
      id: 'pro_yearly',
      name: '专业会员（年卡）',
      tier: 'pro',
      price: 999,
      duration: 365,
      dailyLimit: 200,
      features: ['无限生成', '4K图片', '专业视频', '专属客服', '早期功能'],
      popular: false
    }
  ];

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 生成邀请码
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 获取今日日期字符串
   */
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 保存数据到localStorage
   */
  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  /**
   * 从localStorage读取数据
   */
  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('读取数据失败:', error);
      return defaultValue;
    }
  }

  /**
   * 记录用户活动
   */
  private logActivity(userId: string, action: UserActivity['action'], details: Record<string, any>): void {
    const activities = this.loadFromStorage<UserActivity[]>(this.STORAGE_KEYS.USER_ACTIVITIES, []);
    const activity: UserActivity = {
      id: this.generateId(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // 模拟IP
      userAgent: navigator.userAgent
    };
    activities.push(activity);
    this.saveToStorage(this.STORAGE_KEYS.USER_ACTIVITIES, activities);
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this.loadFromStorage<User | null>(this.STORAGE_KEYS.CURRENT_USER, null);
  }

  /**
   * 用户注册
   */
  async register(email: string, username: string, password: string, inviteCode?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 模拟注册延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 检查邀请码
      let inviteRecord: InviteRecord | undefined;
      if (inviteCode) {
        const invites = this.loadFromStorage<InviteRecord[]>(this.STORAGE_KEYS.INVITE_RECORDS, []);
        inviteRecord = invites.find(invite => 
          invite.inviteCode === inviteCode && 
          invite.status === 'pending' && 
          !invite.inviteeId
        );
        if (!inviteRecord) {
          return { success: false, error: '邀请码无效或已使用' };
        }
      }

      // 创建新用户
      const user: User = {
        id: this.generateId(),
        email,
        username,
        tier: 'free',
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profile: {
          nickname: username
        }
      };

      // 初始化使用限制
      const usageLimit: UsageLimit = {
        userId: user.id,
        tier: 'free',
        dailyLimit: this.TIER_LIMITS.free.dailyLimit,
        usedToday: 0,
        totalUsed: 0,
        lastResetDate: this.getTodayString(),
        bonusCount: 0,
        shareCount: 0,
        inviteCount: 0
      };

      // 处理邀请奖励
      if (inviteRecord) {
        // 更新邀请记录
        const invites = this.loadFromStorage<InviteRecord[]>(this.STORAGE_KEYS.INVITE_RECORDS, []);
        const updatedInvites = invites.map(invite => 
          invite.id === inviteRecord!.id 
            ? { ...invite, inviteeId: user.id, registeredAt: new Date().toISOString(), status: 'completed' as const }
            : invite
        );
        this.saveToStorage(this.STORAGE_KEYS.INVITE_RECORDS, updatedInvites);

        // 给新用户奖励
        usageLimit.bonusCount += 5;
        usageLimit.inviteCount += 5;

        // 给邀请人奖励
        const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
        const updatedLimits = usageLimits.map(limit => 
          limit.userId === inviteRecord!.inviterId 
            ? { ...limit, bonusCount: limit.bonusCount + 5, inviteCount: limit.inviteCount + 5 }
            : limit
        );
        this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, updatedLimits);
      }

      // 保存数据
      this.saveToStorage(this.STORAGE_KEYS.CURRENT_USER, user);
      const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
      usageLimits.push(usageLimit);
      this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);

      // 记录活动
      this.logActivity(user.id, 'register', { email, username, inviteCode });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: '注册失败，请稍后重试' };
    }
  }

  /**
   * 用户登录
   */
  async login(emailOrUsername: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      // 简化版登录验证（实际应该验证密码）
      // 这里模拟登录成功
      const user: User = {
        id: this.generateId(),
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
        username: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
        tier: 'free',
        registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天前注册
        lastLoginAt: new Date().toISOString(),
        profile: {
          nickname: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername
        }
      };

      // 检查是否已有使用记录
      const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
      if (!usageLimits.find(limit => limit.userId === user.id)) {
        const usageLimit: UsageLimit = {
          userId: user.id,
          tier: 'free',
          dailyLimit: this.TIER_LIMITS.free.dailyLimit,
          usedToday: 0,
          totalUsed: 0,
          lastResetDate: this.getTodayString(),
          bonusCount: 0,
          shareCount: 0,
          inviteCount: 0
        };
        usageLimits.push(usageLimit);
        this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);
      }

      this.saveToStorage(this.STORAGE_KEYS.CURRENT_USER, user);
      this.logActivity(user.id, 'login', { emailOrUsername });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: '登录失败，请检查用户名和密码' };
    }
  }

  /**
   * 用户注销
   */
  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.logActivity(user.id, 'login', { action: 'logout' });
    }
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
  }

  /**
   * 检查使用次数限制
   */
  checkUsageLimit(userId?: string): { canUse: boolean; remainingToday: number; nextResetTime: string } {
    if (!userId) {
      // 游客模式
      const guestUsage = this.loadFromStorage<{ date: string; count: number }>(
        this.STORAGE_KEYS.GUEST_USAGE, 
        { date: this.getTodayString(), count: 0 }
      );
      
      if (guestUsage.date !== this.getTodayString()) {
        guestUsage.date = this.getTodayString();
        guestUsage.count = 0;
        this.saveToStorage(this.STORAGE_KEYS.GUEST_USAGE, guestUsage);
      }

      const guestLimit = this.TIER_LIMITS.guest.dailyLimit;
      const remaining = Math.max(0, guestLimit - guestUsage.count);
      
      return {
        canUse: remaining > 0,
        remainingToday: remaining,
        nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }

    const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
    let userLimit = usageLimits.find(limit => limit.userId === userId);

    if (!userLimit) {
      // 创建新的使用记录
      userLimit = {
        userId,
        tier: 'free',
        dailyLimit: this.TIER_LIMITS.free.dailyLimit,
        usedToday: 0,
        totalUsed: 0,
        lastResetDate: this.getTodayString(),
        bonusCount: 0,
        shareCount: 0,
        inviteCount: 0
      };
      usageLimits.push(userLimit);
      this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);
    }

    // 检查是否需要重置每日计数
    if (userLimit.lastResetDate !== this.getTodayString()) {
      userLimit.usedToday = 0;
      userLimit.lastResetDate = this.getTodayString();
      this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);
    }

    const totalAvailable = userLimit.dailyLimit + userLimit.bonusCount;
    const remaining = Math.max(0, totalAvailable - userLimit.usedToday);

    return {
      canUse: remaining > 0,
      remainingToday: remaining,
      nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * 消耗使用次数
   */
  consumeUsage(userId?: string): boolean {
    if (!userId) {
      // 游客模式
      const guestUsage = this.loadFromStorage<{ date: string; count: number }>(
        this.STORAGE_KEYS.GUEST_USAGE, 
        { date: this.getTodayString(), count: 0 }
      );
      
      if (guestUsage.date !== this.getTodayString()) {
        guestUsage.date = this.getTodayString();
        guestUsage.count = 0;
      }

      if (guestUsage.count < this.TIER_LIMITS.guest.dailyLimit) {
        guestUsage.count++;
        this.saveToStorage(this.STORAGE_KEYS.GUEST_USAGE, guestUsage);
        return true;
      }
      return false;
    }

    const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
    const userLimitIndex = usageLimits.findIndex(limit => limit.userId === userId);

    if (userLimitIndex === -1) return false;

    const userLimit = usageLimits[userLimitIndex];
    const { canUse } = this.checkUsageLimit(userId);

    if (canUse) {
      userLimit.usedToday++;
      userLimit.totalUsed++;
      
      // 优先消耗奖励次数
      if (userLimit.bonusCount > 0) {
        userLimit.bonusCount--;
      }

      this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);
      this.logActivity(userId, 'generate', { remainingToday: userLimit.dailyLimit + userLimit.bonusCount - userLimit.usedToday });
      return true;
    }

    return false;
  }

  /**
   * 分享内容
   */
  async shareContent(
    userId: string, 
    shareType: ShareRecord['shareType'], 
    contentId: string, 
    platform: ShareRecord['platform']
  ): Promise<{ success: boolean; bonusAwarded?: boolean; error?: string }> {
    try {
      const user = this.getCurrentUser();
      if (!user || user.id !== userId) {
        return { success: false, error: '用户未登录' };
      }

      // 检查今日分享次数（限制每日分享奖励次数）
      const today = this.getTodayString();
      const shareRecords = this.loadFromStorage<ShareRecord[]>(this.STORAGE_KEYS.SHARE_RECORDS, []);
      const todayShares = shareRecords.filter(record => 
        record.userId === userId && 
        record.sharedAt.startsWith(today) && 
        record.bonusAwarded
      );

      const maxDailyShareBonus = 3; // 每日最多3次分享奖励
      const bonusAwarded = todayShares.length < maxDailyShareBonus;

      // 创建分享记录
      const shareRecord: ShareRecord = {
        id: this.generateId(),
        userId,
        shareType,
        contentId,
        platform,
        sharedAt: new Date().toISOString(),
        bonusAwarded,
        viewCount: 0
      };

      shareRecords.push(shareRecord);
      this.saveToStorage(this.STORAGE_KEYS.SHARE_RECORDS, shareRecords);

      // 如果给予奖励，增加使用次数
      if (bonusAwarded) {
        const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
        const userLimitIndex = usageLimits.findIndex(limit => limit.userId === userId);
        
        if (userLimitIndex !== -1) {
          usageLimits[userLimitIndex].bonusCount += 2; // 分享奖励2次
          usageLimits[userLimitIndex].shareCount += 2;
          this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);
        }
      }

      this.logActivity(userId, 'share', { shareType, platform, bonusAwarded });

      return { success: true, bonusAwarded };
    } catch (error) {
      return { success: false, error: '分享失败，请稍后重试' };
    }
  }

  /**
   * 生成邀请链接
   */
  generateInviteLink(userId: string): { success: boolean; inviteCode?: string; inviteLink?: string; error?: string } {
    try {
      const user = this.getCurrentUser();
      if (!user || user.id !== userId) {
        return { success: false, error: '用户未登录' };
      }

      const inviteCode = this.generateInviteCode();
      const inviteRecord: InviteRecord = {
        id: this.generateId(),
        inviterId: userId,
        inviteCode,
        invitedAt: new Date().toISOString(),
        status: 'pending',
        bonusAwarded: false
      };

      const inviteRecords = this.loadFromStorage<InviteRecord[]>(this.STORAGE_KEYS.INVITE_RECORDS, []);
      inviteRecords.push(inviteRecord);
      this.saveToStorage(this.STORAGE_KEYS.INVITE_RECORDS, inviteRecords);

      const inviteLink = `${window.location.origin}?invite=${inviteCode}`;
      
      this.logActivity(userId, 'invite', { inviteCode });

      return { success: true, inviteCode, inviteLink };
    } catch (error) {
      return { success: false, error: '生成邀请链接失败' };
    }
  }

  /**
   * 获取付费计划
   */
  getPaymentPlans(): PaymentPlan[] {
    return this.PAYMENT_PLANS;
  }

  /**
   * 发起付费
   */
  async initiatePurchase(userId: string, planId: string, paymentMethod: PaymentRecord['paymentMethod']): Promise<{ success: boolean; paymentRecord?: PaymentRecord; error?: string }> {
    try {
      const user = this.getCurrentUser();
      if (!user || user.id !== userId) {
        return { success: false, error: '用户未登录' };
      }

      const plan = this.PAYMENT_PLANS.find(p => p.id === planId);
      if (!plan) {
        return { success: false, error: '付费计划不存在' };
      }

      const paymentRecord: PaymentRecord = {
        id: this.generateId(),
        userId,
        planId,
        amount: plan.price,
        currency: 'CNY',
        status: 'pending',
        paymentMethod,
        transactionId: `TXN_${this.generateId()}`
      };

      const paymentRecords = this.loadFromStorage<PaymentRecord[]>(this.STORAGE_KEYS.PAYMENT_RECORDS, []);
      paymentRecords.push(paymentRecord);
      this.saveToStorage(this.STORAGE_KEYS.PAYMENT_RECORDS, paymentRecords);

      // 模拟支付成功（实际应该对接支付接口）
      setTimeout(() => {
        this.completePurchase(paymentRecord.id);
      }, 2000);

      return { success: true, paymentRecord };
    } catch (error) {
      return { success: false, error: '发起支付失败' };
    }
  }

  /**
   * 完成付费
   */
  private async completePurchase(paymentId: string): Promise<void> {
    try {
      const paymentRecords = this.loadFromStorage<PaymentRecord[]>(this.STORAGE_KEYS.PAYMENT_RECORDS, []);
      const recordIndex = paymentRecords.findIndex(record => record.id === paymentId);
      
      if (recordIndex === -1) return;

      const paymentRecord = paymentRecords[recordIndex];
      const plan = this.PAYMENT_PLANS.find(p => p.id === paymentRecord.planId);
      
      if (!plan) return;

      // 更新支付记录
      paymentRecord.status = 'completed';
      paymentRecord.paidAt = new Date().toISOString();
      paymentRecord.expiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString();
      this.saveToStorage(this.STORAGE_KEYS.PAYMENT_RECORDS, paymentRecords);

      // 升级用户等级
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === paymentRecord.userId) {
        currentUser.tier = plan.tier;
        this.saveToStorage(this.STORAGE_KEYS.CURRENT_USER, currentUser);
      }

      // 更新使用限制
      const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
      const userLimitIndex = usageLimits.findIndex(limit => limit.userId === paymentRecord.userId);
      
      if (userLimitIndex !== -1) {
        usageLimits[userLimitIndex].tier = plan.tier;
        usageLimits[userLimitIndex].dailyLimit = plan.dailyLimit;
        this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);
      }

      this.logActivity(paymentRecord.userId, 'purchase', { planId: plan.id, amount: plan.price });
    } catch (error) {
      console.error('完成支付失败:', error);
    }
  }

  /**
   * 获取用户统计信息
   */
  getUserStats(userId: string): { totalGenerations: number; totalShares: number; totalInvites: number; memberSince: string } {
    const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
    const userLimit = usageLimits.find(limit => limit.userId === userId);
    
    const shareRecords = this.loadFromStorage<ShareRecord[]>(this.STORAGE_KEYS.SHARE_RECORDS, []);
    const userShares = shareRecords.filter(record => record.userId === userId);
    
    const inviteRecords = this.loadFromStorage<InviteRecord[]>(this.STORAGE_KEYS.INVITE_RECORDS, []);
    const userInvites = inviteRecords.filter(record => record.inviterId === userId);
    
    const user = this.getCurrentUser();

    return {
      totalGenerations: userLimit?.totalUsed || 0,
      totalShares: userShares.length,
      totalInvites: userInvites.filter(invite => invite.status === 'completed').length,
      memberSince: user?.registeredAt || new Date().toISOString()
    };
  }

  /**
   * 获取系统统计（管理员功能）
   */
  getSystemStats(): SystemStats {
    const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
    const shareRecords = this.loadFromStorage<ShareRecord[]>(this.STORAGE_KEYS.SHARE_RECORDS, []);
    const inviteRecords = this.loadFromStorage<InviteRecord[]>(this.STORAGE_KEYS.INVITE_RECORDS, []);
    const paymentRecords = this.loadFromStorage<PaymentRecord[]>(this.STORAGE_KEYS.PAYMENT_RECORDS, []);
    
    const today = this.getTodayString();
    const thisMonth = today.substring(0, 7);
    
    const completedPayments = paymentRecords.filter(record => record.status === 'completed');
    const todayRevenue = completedPayments
      .filter(record => record.paidAt?.startsWith(today))
      .reduce((sum, record) => sum + record.amount, 0);
    
    const monthRevenue = completedPayments
      .filter(record => record.paidAt?.startsWith(thisMonth))
      .reduce((sum, record) => sum + record.amount, 0);
    
    const totalRevenue = completedPayments.reduce((sum, record) => sum + record.amount, 0);

    return {
      totalUsers: usageLimits.length,
      dailyActiveUsers: usageLimits.filter(limit => limit.lastResetDate === today).length,
      monthlyActiveUsers: usageLimits.filter(limit => limit.lastResetDate.startsWith(thisMonth)).length,
      totalGenerations: usageLimits.reduce((sum, limit) => sum + limit.totalUsed, 0),
      totalShares: shareRecords.length,
      totalInvites: inviteRecords.filter(invite => invite.status === 'completed').length,
      revenue: {
        today: todayRevenue,
        month: monthRevenue,
        total: totalRevenue
      }
    };
  }

  /**
   * 创建管理员账号（开发用）
   */
  async createAdminAccount(username: string = 'admin', email: string = 'admin@travel-generator.com', password: string = 'admin123'): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 检查是否已存在管理员账号
      const existingUsers = this.loadFromStorage<User[]>('all_users', []);
      const existingAdmin = existingUsers.find(user => user.tier === 'admin' || user.username === username);
      
      if (existingAdmin) {
        // 如果已存在，直接登录
        this.saveToStorage(this.STORAGE_KEYS.CURRENT_USER, existingAdmin);
        return { success: true, user: existingAdmin };
      }

      // 创建管理员用户
      const adminUser: User = {
        id: this.generateId(),
        email,
        username,
        tier: 'admin',
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profile: {
          nickname: '系统管理员'
        }
      };

      // 保存管理员用户
      existingUsers.push(adminUser);
      this.saveToStorage('all_users', existingUsers);
      this.saveToStorage(this.STORAGE_KEYS.CURRENT_USER, adminUser);

      // 初始化管理员使用限制
      const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
      const adminUsageLimit: UsageLimit = {
        userId: adminUser.id,
        tier: 'admin',
        dailyLimit: 999999,
        usedToday: 0,
        totalUsed: 0,
        lastResetDate: this.getTodayString(),
        bonusCount: 0,
        shareCount: 0,
        inviteCount: 0
      };
      usageLimits.push(adminUsageLimit);
      this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);

      this.logActivity(adminUser.id, 'register', { type: 'admin', tier: 'admin' });

      console.log('🔑 管理员账号创建成功:', {
        username: adminUser.username,
        email: adminUser.email,
        tier: adminUser.tier,
        dailyLimit: 999999
      });

      return { success: true, user: adminUser };
    } catch (error) {
      console.error('创建管理员账号失败:', error);
      return { success: false, error: '创建管理员账号失败' };
    }
  }

  /**
   * 升级用户为管理员（开发用）
   */
  async upgradeToAdmin(userId: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: '用户未登录' };
      }

      // 更新用户等级
      currentUser.tier = 'admin';
      currentUser.profile = {
        ...currentUser.profile,
        nickname: currentUser.profile?.nickname || '管理员'
      };
      
      this.saveToStorage(this.STORAGE_KEYS.CURRENT_USER, currentUser);

      // 更新使用限制
      const usageLimits = this.loadFromStorage<UsageLimit[]>(this.STORAGE_KEYS.USAGE_LIMITS, []);
      const userLimitIndex = usageLimits.findIndex(limit => limit.userId === userId);
      
      if (userLimitIndex !== -1) {
        usageLimits[userLimitIndex].tier = 'admin';
        usageLimits[userLimitIndex].dailyLimit = 999999;
        this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);
      } else {
        // 如果不存在，创建新的
        const newUsageLimit: UsageLimit = {
          userId,
          tier: 'admin',
          dailyLimit: 999999,
          usedToday: 0,
          totalUsed: 0,
          lastResetDate: this.getTodayString(),
          bonusCount: 0,
          shareCount: 0,
          inviteCount: 0
        };
        usageLimits.push(newUsageLimit);
        this.saveToStorage(this.STORAGE_KEYS.USAGE_LIMITS, usageLimits);
      }

      this.logActivity(userId, 'upgrade', { newTier: 'admin', upgraded: true });

      console.log('🔑 用户升级为管理员成功:', {
        userId,
        username: currentUser.username,
        newTier: 'admin',
        dailyLimit: 999999
      });

      return { success: true, user: currentUser };
    } catch (error) {
      console.error('升级用户为管理员失败:', error);
      return { success: false, error: '升级失败' };
    }
  }
}

// 导出单例
export const userService = new UserService();
export default userService; 
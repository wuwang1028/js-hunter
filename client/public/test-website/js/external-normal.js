// external-normal.js - 正常的外部JS文件
// 用于测试JS Hunter的基本收集功能

/**
 * 用户管理类
 */
class UserManager {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.apiBaseUrl = 'https://api.example.com/v1';
  }

  /**
   * 用户登录
   * @param {string} username 
   * @param {string} password 
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        this.currentUser = data.user;
        // 存储Token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户信息
   * @param {number} userId 
   */
  async getUserInfo(userId) {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.apiBaseUrl}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return await response.json();
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId, data) {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.apiBaseUrl}/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  }

  /**
   * 登出
   */
  logout() {
    this.currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  /**
   * 检查是否为管理员
   */
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  /**
   * 获取管理员面板数据（隐藏功能）
   */
  async getAdminData() {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized');
    }

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.apiBaseUrl}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return await response.json();
  }
}

/**
 * 支付处理类
 */
class PaymentProcessor {
  constructor() {
    // 敏感信息：支付配置
    this.config = {
      merchantId: 'MERCHANT_12345',
      publicKey: 'pk_live_1234567890abcdef',
      apiEndpoint: 'https://payment-gateway.example.com/api',
    };
  }

  /**
   * 处理支付
   */
  async processPayment(orderData) {
    // 业务逻辑漏洞：价格在客户端计算
    const totalAmount = this.calculateTotal(orderData.items);
    
    const paymentData = {
      amount: totalAmount,
      currency: 'USD',
      orderId: orderData.orderId,
      items: orderData.items,
      merchantId: this.config.merchantId,
    };

    const response = await fetch(`${this.config.apiEndpoint}/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.publicKey,
      },
      body: JSON.stringify(paymentData),
    });

    return await response.json();
  }

  /**
   * 计算总价（客户端计算，存在风险）
   */
  calculateTotal(items) {
    let total = 0;
    items.forEach(item => {
      total += item.price * item.quantity;
      
      // 应用折扣
      if (item.discount) {
        total -= item.discount;
      }
    });
    return total;
  }

  /**
   * 应用优惠券
   */
  applyCoupon(couponCode) {
    // 客户端验证优惠券（不安全）
    const validCoupons = {
      'SAVE10': 0.1,
      'SAVE20': 0.2,
      'FREESHIP': 0,
      'ADMIN50': 0.5, // 内部优惠券
    };

    return validCoupons[couponCode] || 0;
  }
}

/**
 * 数据分析类
 */
class Analytics {
  constructor() {
    this.trackingId = 'UA-123456789-1';
    this.apiKey = 'AIzaSyD_1234567890abcdefghijklmnopqrstuv'; // Google Analytics API Key
    this.endpoint = 'https://analytics.google.com/collect';
  }

  /**
   * 追踪页面浏览
   */
  trackPageView(page) {
    const data = {
      v: '1',
      tid: this.trackingId,
      cid: this.getClientId(),
      t: 'pageview',
      dp: page,
    };

    this.sendData(data);
  }

  /**
   * 追踪事件
   */
  trackEvent(category, action, label) {
    const data = {
      v: '1',
      tid: this.trackingId,
      cid: this.getClientId(),
      t: 'event',
      ec: category,
      ea: action,
      el: label,
    };

    this.sendData(data);
  }

  /**
   * 发送数据
   */
  sendData(data) {
    const params = new URLSearchParams(data);
    fetch(`${this.endpoint}?${params}`, {
      method: 'POST',
    });
  }

  /**
   * 获取客户端ID
   */
  getClientId() {
    let cid = localStorage.getItem('ga_cid');
    if (!cid) {
      cid = this.generateUUID();
      localStorage.setItem('ga_cid', cid);
    }
    return cid;
  }

  /**
   * 生成UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// 初始化
const userManager = new UserManager();
const paymentProcessor = new PaymentProcessor();
const analytics = new Analytics();

// 导出到全局
window.UserManager = UserManager;
window.PaymentProcessor = PaymentProcessor;
window.Analytics = Analytics;
window.userManager = userManager;
window.paymentProcessor = paymentProcessor;
window.analytics = analytics;

console.log('external-normal.js loaded');

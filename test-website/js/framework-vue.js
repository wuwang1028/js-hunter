// framework-vue.js - 模拟Vue.js应用（包含路由和配置）
// 测试JS Hunter对框架代码的识别能力

/**
 * Vue应用配置
 */
const vueAppConfig = {
  name: 'TestApp',
  version: '1.0.0',
  apiBaseUrl: 'https://api.testapp.com/v1',
  
  // 环境配置
  env: {
    production: {
      apiUrl: 'https://api.prod.testapp.com',
      apiKey: 'prod_api_key_1234567890abcdef',
      stripeKey: 'pk_live_51HqJ8KLmN9pQrStUvWxYz0123456789AbCdEf',
    },
    development: {
      apiUrl: 'http://localhost:3000',
      apiKey: 'dev_api_key_test_1234567890',
      stripeKey: 'pk_test_51HqJ8KLmN9pQrStUvWxYz012345678901234567890AbCdEf',
    },
  },
  
  // 当前环境（硬编码为生产环境 - 危险！）
  currentEnv: 'production',
};

/**
 * Vue Router配置
 */
const vueRouterConfig = {
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: 'HomePage',
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'Login',
      component: 'LoginPage',
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: 'DashboardPage',
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: 'ProfilePage',
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: 'AdminPanel',
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: 'AdminUsersPage',
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
    {
      path: '/admin/settings',
      name: 'AdminSettings',
      component: 'AdminSettingsPage',
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
    // 隐藏路由
    {
      path: '/debug',
      name: 'Debug',
      component: 'DebugPanel',
      meta: { requiresAuth: false, hidden: true },
    },
    {
      path: '/internal',
      name: 'Internal',
      component: 'InternalTools',
      meta: { requiresAuth: false, hidden: true },
    },
    {
      path: '/test-payment',
      name: 'TestPayment',
      component: 'PaymentTestPage',
      meta: { requiresAuth: false, hidden: true },
    },
  ],
};

/**
 * Vuex Store配置
 */
const vuexStoreConfig = {
  state: {
    user: null,
    token: null,
    isAuthenticated: false,
    config: vueAppConfig,
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = true;
    },
    
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('auth_token', token);
    },
    
    LOGOUT(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_token');
    },
  },
  
  actions: {
    async login({ commit }, credentials) {
      try {
        const env = vueAppConfig.env[vueAppConfig.currentEnv];
        
        const response = await fetch(`${env.apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': env.apiKey, // 在请求头中暴露API Key
          },
          body: JSON.stringify(credentials),
        });
        
        const data = await response.json();
        
        if (data.success) {
          commit('SET_USER', data.user);
          commit('SET_TOKEN', data.token);
          return { success: true };
        } else {
          return { success: false, error: data.message };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    
    async fetchUserData({ commit, state }) {
      const env = vueAppConfig.env[vueAppConfig.currentEnv];
      
      const response = await fetch(`${env.apiUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'X-API-Key': env.apiKey,
        },
      });
      
      const data = await response.json();
      commit('SET_USER', data.user);
    },
    
    logout({ commit }) {
      commit('LOGOUT');
    },
  },
  
  getters: {
    isAdmin: (state) => {
      return state.user && state.user.role === 'admin';
    },
    
    currentUser: (state) => {
      return state.user;
    },
  },
};

/**
 * API服务
 */
const apiService = {
  baseUrl: vueAppConfig.env[vueAppConfig.currentEnv].apiUrl,
  apiKey: vueAppConfig.env[vueAppConfig.currentEnv].apiKey,
  
  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };
    
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    
    const response = await fetch(url, config);
    return await response.json();
  },
  
  // 用户相关API
  users: {
    getAll: () => apiService.request('/users'),
    getById: (id) => apiService.request(`/users/${id}`),
    create: (data) => apiService.request('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiService.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiService.request(`/users/${id}`, { method: 'DELETE' }),
  },
  
  // 管理员API
  admin: {
    getDashboard: () => apiService.request('/admin/dashboard'),
    getUsers: () => apiService.request('/admin/users'),
    getStats: () => apiService.request('/admin/stats'),
    executeCommand: (cmd) => apiService.request('/admin/execute', { 
      method: 'POST', 
      body: JSON.stringify({ command: cmd }) 
    }),
  },
  
  // 支付API
  payment: {
    createIntent: (amount) => apiService.request('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
    processPayment: (data) => apiService.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
};

/**
 * 认证守卫
 */
const authGuard = {
  // 检查认证
  checkAuth() {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },
  
  // 检查角色
  checkRole(requiredRole) {
    const userStr = localStorage.getItem('user_data');
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.role === requiredRole;
    } catch (e) {
      return false;
    }
  },
  
  // 路由守卫
  beforeEach(to, from, next) {
    if (to.meta.requiresAuth && !this.checkAuth()) {
      next('/login');
      return;
    }
    
    if (to.meta.requiresRole && !this.checkRole(to.meta.requiresRole)) {
      next('/');
      return;
    }
    
    next();
  },
};

/**
 * 工具函数
 */
const utils = {
  // 格式化日期
  formatDate(date) {
    return new Date(date).toLocaleDateString();
  },
  
  // 生成Token（不安全）
  generateToken(userId) {
    const payload = {
      userId: userId,
      timestamp: Date.now(),
      secret: 'client-side-secret-key', // 客户端密钥！
    };
    return btoa(JSON.stringify(payload));
  },
  
  // 验证Token（客户端验证）
  validateToken(token) {
    try {
      const payload = JSON.parse(atob(token));
      return payload.userId && payload.timestamp;
    } catch (e) {
      return false;
    }
  },
};

// 暴露到全局
window.VueApp = {
  config: vueAppConfig,
  router: vueRouterConfig,
  store: vuexStoreConfig,
  api: apiService,
  auth: authGuard,
  utils: utils,
};

console.log('Vue.js app configuration loaded');
console.log('Current environment:', vueAppConfig.currentEnv);
console.log('API URL:', vueAppConfig.env[vueAppConfig.currentEnv].apiUrl);

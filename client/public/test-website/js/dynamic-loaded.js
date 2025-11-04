// dynamic-loaded.js - 动态加载的JS文件
// 测试JS Hunter的动态JS监听功能

console.log('Dynamic script loaded!');

/**
 * 动态加载的配置
 */
const DYNAMIC_CONFIG = {
  // 第三方服务密钥
  twilioAccountSid: 'FAKE_TWILIO_ACCOUNT_SID_FOR_TESTING_ONLY',
  twilioAuthToken: 'your_auth_token_1234567890abcdef',
  sendgridApiKey: 'SG.1234567890abcdefghijklmnopqrstuvwxyz.1234567890abcdefghijklmnopqrstuvwxyz',
  
  // 内部服务
  internalApiKey: 'internal-api-key-do-not-expose-2024',
  webhookSecret: 'whsec_1234567890abcdefghijklmnopqrstuvwxyz',
  
  // 数据库连接
  mongoUri: 'mongodb://admin:SuperSecret123@cluster0.mongodb.net/production',
  postgresUrl: 'postgresql://dbuser:dbpass@localhost:5432/mydb',
};

/**
 * 隐藏的API端点
 */
const HIDDEN_ENDPOINTS = {
  adminPanel: '/api/v2/admin/panel',
  debugConsole: '/api/v2/debug/console',
  internalMetrics: '/api/v2/internal/metrics',
  testingEndpoint: '/api/v2/testing/sandbox',
  backupData: '/api/v2/backup/download',
  systemLogs: '/api/v2/system/logs',
};

/**
 * Feature Flags（功能开关）
 */
const FEATURE_FLAGS_DYNAMIC = {
  enableBetaFeatures: true,
  enableDebugMode: false,
  bypassRateLimit: false,
  skipPaymentValidation: false, // 危险！
  allowDirectSQLQuery: false, // 极度危险！
  disableCSRFProtection: true, // 安全问题
};

/**
 * 动态路由配置
 */
const DYNAMIC_ROUTES = [
  { path: '/admin', component: 'AdminDashboard', requireAuth: true, requireRole: 'admin' },
  { path: '/debug', component: 'DebugPanel', requireAuth: false }, // 无需认证！
  { path: '/internal', component: 'InternalTools', requireAuth: true },
  { path: '/test', component: 'TestingPage', requireAuth: false },
  { path: '/backdoor', component: 'BackdoorAccess', requireAuth: false }, // 后门！
];

/**
 * 加密工具（弱加密）
 */
class WeakCrypto {
  constructor() {
    this.key = 'simple-xor-key-123'; // 硬编码密钥
  }

  // XOR加密（不安全）
  xorEncrypt(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
      );
    }
    return btoa(result);
  }

  // XOR解密
  xorDecrypt(encrypted) {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
      );
    }
    return result;
  }

  // 弱哈希（仅Base64）
  weakHash(data) {
    return btoa(data);
  }
}

/**
 * 会话管理（不安全）
 */
class SessionManager {
  constructor() {
    this.sessionKey = 'user_session_2024';
    this.secretSalt = 'fixed-salt-value'; // 固定盐值
  }

  // 创建会话（客户端生成）
  createSession(userId, role) {
    const session = {
      userId: userId,
      role: role,
      timestamp: Date.now(),
      salt: this.secretSalt,
      signature: this.generateSignature(userId, role),
    };
    
    const sessionData = btoa(JSON.stringify(session));
    localStorage.setItem(this.sessionKey, sessionData);
    return sessionData;
  }

  // 生成签名（弱签名）
  generateSignature(userId, role) {
    return btoa(`${userId}:${role}:${this.secretSalt}`);
  }

  // 验证会话（客户端验证）
  validateSession() {
    const sessionData = localStorage.getItem(this.sessionKey);
    if (!sessionData) return false;

    try {
      const session = JSON.parse(atob(sessionData));
      // 仅检查是否存在，不验证签名
      return !!session.userId;
    } catch (e) {
      return false;
    }
  }

  // 提升权限（危险）
  elevateToAdmin() {
    const session = this.getSession();
    if (session) {
      session.role = 'admin';
      const sessionData = btoa(JSON.stringify(session));
      localStorage.setItem(this.sessionKey, sessionData);
      return true;
    }
    return false;
  }

  // 获取会话
  getSession() {
    const sessionData = localStorage.getItem(this.sessionKey);
    if (!sessionData) return null;
    return JSON.parse(atob(sessionData));
  }
}

/**
 * SQL查询构造器（存在注入风险）
 */
class SQLBuilder {
  constructor() {
    this.table = 'users';
  }

  // 不安全的查询构造
  buildQuery(username, password) {
    // 直接拼接，存在SQL注入
    return `SELECT * FROM ${this.table} WHERE username='${username}' AND password='${password}'`;
  }

  // 不安全的更新
  buildUpdate(userId, field, value) {
    return `UPDATE ${this.table} SET ${field}='${value}' WHERE id=${userId}`;
  }

  // 不安全的删除
  buildDelete(userId) {
    return `DELETE FROM ${this.table} WHERE id=${userId}`;
  }
}

/**
 * 命令执行（极度危险）
 */
class CommandExecutor {
  constructor() {
    this.allowedCommands = ['ls', 'pwd', 'whoami'];
  }

  // 危险：执行系统命令
  async executeCommand(command) {
    // 客户端检查（可绕过）
    if (!this.allowedCommands.includes(command.split(' ')[0])) {
      console.warn('Command not allowed');
      return;
    }

    // 发送到服务器执行
    const response = await fetch('/api/system/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command: command }),
    });

    return await response.json();
  }
}

// 初始化并暴露到全局
window.DYNAMIC_CONFIG = DYNAMIC_CONFIG;
window.HIDDEN_ENDPOINTS = HIDDEN_ENDPOINTS;
window.FEATURE_FLAGS_DYNAMIC = FEATURE_FLAGS_DYNAMIC;
window.DYNAMIC_ROUTES = DYNAMIC_ROUTES;
window.WeakCrypto = WeakCrypto;
window.SessionManager = SessionManager;
window.SQLBuilder = SQLBuilder;
window.CommandExecutor = CommandExecutor;

window.weakCrypto = new WeakCrypto();
window.sessionManager = new SessionManager();
window.sqlBuilder = new SQLBuilder();
window.commandExecutor = new CommandExecutor();

console.log('Dynamic loaded script initialized with secrets and vulnerabilities');

// 自动执行一些危险操作
if (window.location.search.includes('debug=true')) {
  console.log('Debug mode activated!');
  console.log('Config:', DYNAMIC_CONFIG);
  console.log('Hidden Endpoints:', HIDDEN_ENDPOINTS);
}

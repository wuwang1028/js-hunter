// JS Hunter - Built-in Analysis Templates

import type { AnalysisTemplate, AnalysisScenario } from '../types/index';
import { generateUUID } from './utils';

/**
 * 内置分析模板
 */
export const BUILTIN_TEMPLATES: AnalysisTemplate[] = [
  {
    id: generateUUID(),
    name: 'API接口发现',
    description: '提取JavaScript代码中的所有API端点、HTTP方法、参数和认证方式',
    category: 'api-discovery' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `分析以下JavaScript代码，提取所有API端点信息。请以JSON格式输出结果。

要求：
1. 识别所有HTTP请求（fetch、axios、XMLHttpRequest、$.ajax等）
2. 提取完整的API端点信息：
   - HTTP方法（GET/POST/PUT/DELETE/PATCH等）
   - 完整URL或路径
   - 请求参数（query参数、body参数）
   - 请求头（特别是认证相关的header）
   - 响应数据结构（如果能推断）
   - 认证方式（Bearer Token、API Key、Cookie、Basic Auth等）
3. 对于每个端点，提供代码位置（行号和代码片段）
4. 识别API根路径和版本号（如果存在）
5. 识别GraphQL查询和Mutation（如果存在）

输出JSON格式：
\`\`\`json
{
  "apiRoot": "https://api.example.com/v1",
  "endpoints": [
    {
      "method": "GET",
      "path": "/users",
      "fullUrl": "https://api.example.com/v1/users",
      "params": {
        "query": ["page", "limit"],
        "body": null
      },
      "headers": {
        "Authorization": "Bearer {token}",
        "Content-Type": "application/json"
      },
      "authType": "Bearer Token",
      "location": {
        "line": 123,
        "snippet": "axios.get('/users', { params: { page, limit } })"
      }
    }
  ],
  "graphql": {
    "endpoint": "/graphql",
    "queries": [],
    "mutations": []
  }
}
\`\`\`

JavaScript代码：
---
{{CODE}}
---`,
  },

  {
    id: generateUUID(),
    name: '敏感信息扫描',
    description: '扫描JavaScript代码中的API密钥、令牌、密码和其他敏感信息',
    category: 'secret-scan' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `扫描以下JavaScript代码中的敏感信息。请以JSON格式输出结果。

要求：
1. 识别以下类型的敏感信息：
   - API密钥（AWS、Google Cloud、Azure、第三方服务）
   - 访问令牌（JWT、OAuth Token、Session Token）
   - 密码和凭证（硬编码的用户名密码）
   - 数据库连接字符串
   - 私钥和证书
   - 内部域名和IP地址
   - 邮箱地址和手机号
   - 注释中的敏感信息
2. 对每个发现进行风险评估：
   - 类型（api-key、token、password等）
   - 风险等级（high、medium、low）
   - 具体值（如果是密钥，显示前几个字符）
   - 代码位置
   - 风险描述
   - 利用建议
   - 修复建议

输出JSON格式：
\`\`\`json
{
  "findings": [
    {
      "type": "api-key",
      "value": "sk-abc123...",
      "riskLevel": "high",
      "location": {
        "line": 45,
        "snippet": "const API_KEY = 'sk-abc123...';"
      },
      "description": "OpenAI API密钥硬编码在代码中",
      "exploitation": "攻击者可以使用此密钥调用OpenAI API，产生费用",
      "remediation": "将API密钥移至环境变量或密钥管理服务"
    }
  ],
  "summary": {
    "total": 5,
    "high": 2,
    "medium": 2,
    "low": 1
  }
}
\`\`\`

JavaScript代码：
---
{{CODE}}
---`,
  },

  {
    id: generateUUID(),
    name: '认证逻辑分析',
    description: '分析JavaScript代码中的认证和授权逻辑，识别潜在的绕过方法',
    category: 'auth-analysis' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `分析以下JavaScript代码中的认证和授权逻辑。请以JSON格式输出结果。

要求：
1. 识别认证机制：
   - 登录流程
   - Token生成和验证
   - Session管理
   - Cookie处理
   - OAuth/SAML流程
2. 识别授权检查：
   - 权限验证逻辑
   - 角色检查
   - 资源访问控制
   - 路由守卫
3. 识别安全问题：
   - 客户端验证（可绕过）
   - 弱Token生成
   - 不安全的存储（localStorage vs httpOnly cookie）
   - 缺少CSRF保护
   - 会话固定漏洞
4. 提供绕过方法和修复建议

输出JSON格式：
\`\`\`json
{
  "authentication": {
    "loginFlow": "描述登录流程",
    "tokenType": "JWT|Session|Custom",
    "tokenStorage": "localStorage|sessionStorage|cookie",
    "tokenValidation": "客户端|服务端|混合"
  },
  "authorization": {
    "checkLocations": ["路由守卫", "API调用前"],
    "roleSystem": "描述角色系统"
  },
  "vulnerabilities": [
    {
      "type": "client-side-validation",
      "severity": "high",
      "description": "权限检查仅在客户端进行",
      "location": { "line": 89, "snippet": "if (user.role === 'admin') { ... }" },
      "bypass": "修改本地JavaScript或使用浏览器控制台绕过检查",
      "remediation": "将权限检查移至服务端"
    }
  ]
}
\`\`\`

JavaScript代码：
---
{{CODE}}
---`,
  },

  {
    id: generateUUID(),
    name: '加密算法识别',
    description: '识别JavaScript代码中的加密算法、密钥管理和潜在的密码学弱点',
    category: 'crypto-detection' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `识别以下JavaScript代码中的加密和签名算法。请以JSON格式输出结果。

要求：
1. 识别加密算法：
   - 对称加密（AES、DES、3DES等）
   - 非对称加密（RSA、ECC等）
   - 哈希函数（MD5、SHA-1、SHA-256等）
   - 签名算法（HMAC、RSA签名等）
2. 分析密钥管理：
   - 密钥来源（硬编码、生成、派生）
   - 密钥长度
   - IV/Salt的使用
   - 密钥存储方式
3. 识别密码学弱点：
   - 使用弱算法（MD5、DES）
   - 密钥硬编码
   - 可预测的IV/Salt
   - 不安全的随机数生成
   - ECB模式使用
4. 评估实现安全性

输出JSON格式：
\`\`\`json
{
  "algorithms": [
    {
      "type": "symmetric",
      "algorithm": "AES-256-CBC",
      "location": { "line": 56, "snippet": "crypto.createCipheriv('aes-256-cbc', key, iv)" },
      "keySource": "hardcoded|generated|derived",
      "keyLength": 256,
      "ivUsage": "random|fixed|none",
      "security": "secure|weak|vulnerable"
    }
  ],
  "weaknesses": [
    {
      "type": "weak-algorithm",
      "description": "使用MD5哈希算法",
      "severity": "medium",
      "location": { "line": 123 },
      "remediation": "使用SHA-256或更强的哈希算法"
    }
  ]
}
\`\`\`

JavaScript代码：
---
{{CODE}}
---`,
  },

  {
    id: generateUUID(),
    name: '漏洞模式检测',
    description: '检测JavaScript代码中的常见漏洞模式（XSS、注入、原型污染等）',
    category: 'vulnerability-scan' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `检测以下JavaScript代码中的常见漏洞模式。请以JSON格式输出结果。

要求：
1. 检测以下漏洞类型：
   - XSS（innerHTML、dangerouslySetInnerHTML、document.write）
   - 注入（eval、Function构造器、setTimeout/setInterval字符串参数）
   - 原型污染（Object.prototype修改、不安全的merge）
   - CSRF（缺少CSRF令牌）
   - 不安全的随机数（Math.random用于安全场景）
   - 路径遍历
   - 开放重定向
   - PostMessage漏洞
2. 对每个漏洞提供：
   - 漏洞类型
   - 严重程度（critical、high、medium、low）
   - 详细描述
   - 代码位置
   - 利用方法（PoC）
   - CWE编号
   - CVSS评分（如果适用）
   - 修复建议

输出JSON格式：
\`\`\`json
{
  "vulnerabilities": [
    {
      "type": "xss",
      "severity": "high",
      "title": "DOM-based XSS via innerHTML",
      "description": "用户输入直接插入innerHTML，未经过滤",
      "location": {
        "line": 234,
        "snippet": "element.innerHTML = userInput;"
      },
      "exploitation": "攻击者可以注入恶意脚本：<img src=x onerror=alert(1)>",
      "cwe": "CWE-79",
      "cvss": 7.5,
      "remediation": "使用textContent或DOMPurify进行输入过滤"
    }
  ],
  "summary": {
    "total": 8,
    "critical": 1,
    "high": 3,
    "medium": 3,
    "low": 1
  }
}
\`\`\`

JavaScript代码：
---
{{CODE}}
---`,
  },

  {
    id: generateUUID(),
    name: '业务逻辑分析',
    description: '分析JavaScript代码的业务逻辑，识别可能的业务逻辑漏洞',
    category: 'business-logic' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `分析以下JavaScript代码的业务逻辑。请以JSON格式输出结果。

要求：
1. 识别关键业务流程：
   - 支付流程
   - 订单处理
   - 优惠券/折扣计算
   - 库存检查
   - 积分/余额操作
   - 状态机转换
2. 识别业务逻辑漏洞：
   - 价格篡改
   - 数量负数
   - 条件竞争
   - 状态绕过
   - 重复提交
   - 逻辑缺陷
3. 分析客户端验证：
   - 哪些验证可以绕过
   - 哪些应该在服务端进行
4. 提供测试建议

输出JSON格式：
\`\`\`json
{
  "businessFlows": [
    {
      "name": "支付流程",
      "steps": ["选择商品", "计算价格", "提交订单", "支付"],
      "clientValidations": ["价格计算", "库存检查"],
      "serverValidations": ["支付验证"]
    }
  ],
  "vulnerabilities": [
    {
      "type": "price-manipulation",
      "severity": "critical",
      "description": "价格计算在客户端进行，可被篡改",
      "location": { "line": 456 },
      "exploitation": "修改totalPrice变量为0.01，以极低价格购买商品",
      "testSteps": ["1. 拦截请求", "2. 修改price参数", "3. 重放请求"],
      "remediation": "将价格计算移至服务端"
    }
  ]
}
\`\`\`

JavaScript代码：
---
{{CODE}}
---`,
  },

  {
    id: generateUUID(),
    name: '隐藏功能发现',
    description: '发现JavaScript代码中的隐藏功能、调试接口和未公开的路由',
    category: 'hidden-features' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `发现以下JavaScript代码中的隐藏功能和未公开接口。请以JSON格式输出结果。

要求：
1. 识别隐藏功能：
   - 未在UI中显示的路由
   - 调试接口和测试端点
   - 管理功能
   - 开发者工具
   - 注释掉的功能
   - 条件启用的功能（feature flags）
2. 识别特殊路径：
   - /admin、/debug、/test等
   - 隐藏的API端点
   - 内部工具路径
3. 分析访问控制：
   - 这些功能是否有权限检查
   - 如何访问这些功能
4. 评估安全影响

输出JSON格式：
\`\`\`json
{
  "hiddenRoutes": [
    {
      "path": "/admin/users",
      "description": "用户管理后台",
      "accessControl": "仅检查localStorage中的isAdmin标志",
      "location": { "line": 789 },
      "securityImpact": "high",
      "accessMethod": "设置localStorage.setItem('isAdmin', 'true')"
    }
  ],
  "debugEndpoints": [
    {
      "endpoint": "/api/debug/dump",
      "description": "导出调试信息",
      "enabled": "process.env.NODE_ENV === 'development'",
      "location": { "line": 123 }
    }
  ],
  "featureFlags": [
    {
      "name": "enableBetaFeatures",
      "description": "启用测试功能",
      "checkMethod": "localStorage.getItem('beta') === 'true'"
    }
  ],
  "commentedCode": [
    {
      "description": "被注释的管理员重置密码功能",
      "location": { "line": 456 },
      "securityImpact": "medium"
    }
  ]
}
\`\`\`

JavaScript代码：
---
{{CODE}}
---`,
  },

  {
    id: generateUUID(),
    name: '综合安全分析',
    description: '对JavaScript代码进行全面的安全分析，覆盖所有主要安全方面',
    category: 'custom' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `对以下JavaScript代码进行全面的安全分析。请以JSON格式输出结果。

要求：
1. API接口分析
2. 敏感信息扫描
3. 认证授权分析
4. 加密算法评估
5. 漏洞模式检测
6. 业务逻辑分析
7. 隐藏功能发现
8. 整体安全评估和建议

输出JSON格式：
\`\`\`json
{
  "summary": {
    "riskLevel": "high|medium|low",
    "totalFindings": 15,
    "critical": 2,
    "high": 5,
    "medium": 6,
    "low": 2
  },
  "apiEndpoints": [...],
  "secrets": [...],
  "authIssues": [...],
  "cryptoIssues": [...],
  "vulnerabilities": [...],
  "businessLogicIssues": [...],
  "hiddenFeatures": [...],
  "recommendations": [
    "将敏感信息移至环境变量",
    "在服务端进行权限验证",
    "使用更强的加密算法"
  ]
}
\`\`\`

JavaScript代码：
---
{{CODE}}
---`,
  },
];

/**
 * 获取所有内置模板
 */
export function getBuiltinTemplates(): AnalysisTemplate[] {
  return BUILTIN_TEMPLATES;
}

/**
 * 根据场景获取模板
 */
export function getTemplateByScenario(
  scenario: AnalysisScenario
): AnalysisTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.category === scenario);
}

/**
 * 替换模板中的代码占位符
 */
export function fillTemplate(template: string, code: string): string {
  return template.replace(/\{\{CODE\}\}/g, code);
}

  // WebSocket分析模板
  {
    id: generateUUID(),
    name: 'WebSocket通信分析',
    description: '分析WebSocket连接、消息格式、协议和安全性',
    category: 'websocket-analysis' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `分析以下JavaScript代码中的WebSocket通信。请以JSON格式输出结果。

要求：
1. 识别所有WebSocket连接：
   - WebSocket URL和端口
   - 连接参数和协议
   - 连接时机和条件
   - 重连机制
2. 分析消息格式：
   - 发送的消息类型和结构
   - 接收的消息类型和处理
   - 消息序列化方式（JSON、Protocol Buffers、MessagePack等）
3. 安全性分析：
   - 是否使用wss://（加密）
   - 认证机制（Token、Cookie等）
   - 消息签名和验证
   - 潜在的注入风险
4. 协议分析：
   - 自定义协议格式
   - 心跳机制
   - 错误处理
5. 提供代码位置和示例

输出JSON格式：
\`\`\`json
{
  "connections": [
    {
      "url": "wss://example.com/ws",
      "protocol": "custom-protocol-v1",
      "authentication": {
        "type": "Token",
        "location": "query parameter",
        "parameter": "token"
      },
      "messageFormats": {
        "sent": [
          {
            "type": "ping",
            "structure": {"action": "ping", "timestamp": "number"}
          },
          {
            "type": "subscribe",
            "structure": {"action": "subscribe", "channel": "string"}
          }
        ],
        "received": [
          {
            "type": "pong",
            "structure": {"action": "pong", "timestamp": "number"}
          },
          {
            "type": "data",
            "structure": {"channel": "string", "data": "object"}
          }
        ]
      },
      "security": {
        "encrypted": true,
        "vulnerabilities": ["No message validation", "Potential XSS in data handler"]
      },
      "codeLocation": "line 123-156",
      "codeSnippet": "const ws = new WebSocket('wss://...');"
    }
  ],
  "summary": "Found 1 WebSocket connection with custom protocol",
  "recommendations": ["Add message validation", "Implement rate limiting"]
}
\`\`\`

代码：
{{code}}`,
  },

  // GraphQL分析模板
  {
    id: generateUUID(),
    name: 'GraphQL查询分析',
    description: '分析GraphQL查询、Mutation、Schema和安全性',
    category: 'graphql-analysis' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `分析以下JavaScript代码中的GraphQL操作。请以JSON格式输出结果。

要求：
1. 识别GraphQL端点和配置
2. 提取所有Query操作：
   - 查询名称和参数
   - 请求的字段
   - 嵌套深度
   - 变量使用
3. 提取所有Mutation操作：
   - Mutation名称和参数
   - 修改的数据
   - 返回字段
4. 安全性分析：
   - 是否存在深度嵌套攻击风险
   - 是否存在批量查询攻击风险
   - 认证和授权机制
   - 敏感字段暴露
   - 是否启用introspection
5. 识别Fragment和指令使用
6. 提供优化建议

输出JSON格式：
\`\`\`json
{
  "endpoint": "https://api.example.com/graphql",
  "authentication": {
    "type": "Bearer Token",
    "header": "Authorization"
  },
  "queries": [
    {
      "name": "GetUser",
      "variables": {"id": "ID!"},
      "fields": ["id", "name", "email", "posts { id title }"],
      "depth": 2,
      "codeLocation": "line 45-52",
      "security": {
        "issues": ["Exposes email field without auth check"],
        "severity": "medium"
      }
    }
  ],
  "mutations": [
    {
      "name": "UpdateUser",
      "variables": {"id": "ID!", "input": "UserInput!"},
      "modifies": ["User"],
      "codeLocation": "line 78-85",
      "security": {
        "issues": ["No rate limiting", "Missing input validation"],
        "severity": "high"
      }
    }
  ],
  "fragments": ["UserFields", "PostFields"],
  "security": {
    "introspectionEnabled": true,
    "maxDepth": null,
    "maxComplexity": null,
    "vulnerabilities": [
      "Introspection enabled in production",
      "No query depth limit",
      "Potential DoS via nested queries"
    ]
  },
  "recommendations": [
    "Disable introspection in production",
    "Implement query depth limiting",
    "Add query complexity analysis",
    "Implement rate limiting"
  ]
}
\`\`\`

代码：
{{code}}`,
  },

  // 反调试技术分析
  {
    id: generateUUID(),
    name: '反调试技术分析',
    description: '识别代码中的反调试、反分析和保护技术',
    category: 'anti-debug-analysis' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `分析以下JavaScript代码中的反调试和保护技术。请以JSON格式输出结果。

要求：
1. 识别反调试技术：
   - debugger语句
   - console.log检测
   - 时间差检测
   - DevTools检测（窗口大小、toString等）
   - Function.prototype.toString检测
2. 识别反分析技术：
   - 代码混淆
   - 动态代码生成
   - 环境检测
   - 虚拟机检测
3. 识别保护技术：
   - 域名白名单
   - 时间限制
   - 完整性检查
   - 水印和指纹
4. 绕过方法：
   - 针对每种技术提供绕过思路
   - 提供Hook点
   - 提供替换方案
5. 提供代码位置和示例

输出JSON格式：
\`\`\`json
{
  "antiDebug": [
    {
      "type": "debugger-statement",
      "description": "Infinite debugger loop",
      "codeLocation": "line 23",
      "codeSnippet": "setInterval(() => { debugger; }, 100);",
      "severity": "high",
      "bypass": "Replace debugger with empty statement or disable breakpoints"
    },
    {
      "type": "devtools-detection",
      "description": "Detects DevTools by window size",
      "codeLocation": "line 45-52",
      "codeSnippet": "if (window.outerWidth - window.innerWidth > 160) { ... }",
      "severity": "medium",
      "bypass": "Hook window.outerWidth/innerWidth or use separate window"
    },
    {
      "type": "timing-check",
      "description": "Detects debugging by execution time",
      "codeLocation": "line 67",
      "codeSnippet": "const start = Date.now(); ...; if (Date.now() - start > 100) { ... }",
      "severity": "low",
      "bypass": "Hook Date.now() or performance.now()"
    }
  ],
  "antiAnalysis": [
    {
      "type": "environment-check",
      "description": "Checks for Node.js environment",
      "codeLocation": "line 89",
      "codeSnippet": "if (typeof process !== 'undefined') { ... }",
      "severity": "medium",
      "bypass": "Delete process object before loading script"
    },
    {
      "type": "function-toString-check",
      "description": "Detects hooked functions",
      "codeLocation": "line 112",
      "codeSnippet": "if (fetch.toString().indexOf('[native code]') === -1) { ... }",
      "severity": "high",
      "bypass": "Proxy Function.prototype.toString to return native code"
    }
  ],
  "protection": [
    {
      "type": "domain-whitelist",
      "description": "Only works on specific domains",
      "codeLocation": "line 134",
      "codeSnippet": "if (!['example.com', 'test.com'].includes(location.hostname)) { ... }",
      "severity": "high",
      "bypass": "Hook location.hostname or modify hosts file"
    },
    {
      "type": "integrity-check",
      "description": "Checks script integrity",
      "codeLocation": "line 156",
      "codeSnippet": "const hash = sha256(scriptContent); if (hash !== expectedHash) { ... }",
      "severity": "high",
      "bypass": "Patch hash comparison or recalculate expected hash"
    }
  ],
  "summary": "Found 7 protection mechanisms",
  "overallBypass": "Recommended approach: Use Frida or similar tool to hook all detection functions before script execution",
  "hookPoints": [
    "Date.now",
    "performance.now",
    "window.outerWidth/innerWidth",
    "Function.prototype.toString",
    "location.hostname"
  ]
}
\`\`\`

代码：
{{code}}`,
  },

  // 前端路由分析
  {
    id: generateUUID(),
    name: '前端路由分析',
    description: '分析SPA应用的路由配置、权限控制和隐藏路由',
    category: 'route-analysis' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `分析以下JavaScript代码中的前端路由配置。请以JSON格式输出结果。

要求：
1. 识别路由框架（React Router、Vue Router、Angular Router等）
2. 提取所有路由定义：
   - 路径和参数
   - 组件映射
   - 路由守卫
   - 懒加载配置
3. 分析权限控制：
   - 认证要求
   - 角色权限
   - 路由守卫逻辑
4. 发现隐藏路由：
   - 未在导航中显示的路由
   - 管理员路由
   - 调试路由
   - 开发环境路由
5. 安全性分析：
   - 客户端权限绕过风险
   - 敏感路由暴露
   - 路由参数注入

输出JSON格式：
\`\`\`json
{
  "framework": "React Router v6",
  "routes": [
    {
      "path": "/dashboard",
      "component": "Dashboard",
      "requiresAuth": true,
      "roles": ["user", "admin"],
      "lazy": false,
      "codeLocation": "line 23"
    },
    {
      "path": "/admin/*",
      "component": "AdminPanel",
      "requiresAuth": true,
      "roles": ["admin"],
      "lazy": true,
      "hidden": true,
      "codeLocation": "line 45",
      "security": {
        "issues": ["Client-side role check only"],
        "severity": "high"
      }
    },
    {
      "path": "/debug",
      "component": "DebugPanel",
      "requiresAuth": false,
      "hidden": true,
      "environment": "development",
      "codeLocation": "line 67",
      "security": {
        "issues": ["Debug route accessible in production"],
        "severity": "critical"
      }
    }
  ],
  "guards": [
    {
      "name": "authGuard",
      "type": "beforeEach",
      "logic": "Checks localStorage token",
      "codeLocation": "line 89-102",
      "security": {
        "issues": ["Token not validated server-side"],
        "severity": "high"
      }
    }
  ],
  "hiddenRoutes": ["/admin/*", "/debug", "/internal/test"],
  "security": {
    "clientSideAuthOnly": true,
    "vulnerabilities": [
      "All authentication checks are client-side",
      "Debug route exposed in production",
      "Admin routes discoverable"
    ]
  },
  "recommendations": [
    "Implement server-side authorization",
    "Remove debug routes in production build",
    "Obfuscate admin route paths",
    "Add CSRF protection"
  ]
}
\`\`\`

代码：
{{code}}`,
  },

  // 数据流追踪
  {
    id: generateUUID(),
    name: '敏感数据流追踪',
    description: '追踪敏感数据在代码中的流动和处理',
    category: 'data-flow-analysis' as AnalysisScenario,
    isBuiltin: true,
    isPublic: true,
    timestamp: Date.now(),
    prompt: `分析以下JavaScript代码中敏感数据的流动。请以JSON格式输出结果。

要求：
1. 识别敏感数据源：
   - 用户输入（表单、URL参数等）
   - 本地存储（localStorage、sessionStorage、Cookie）
   - API响应
   - 第三方服务
2. 追踪数据流：
   - 数据的读取位置
   - 数据的传递路径
   - 数据的转换和处理
   - 数据的存储位置
   - 数据的发送目标
3. 识别敏感操作：
   - 未加密的传输
   - 明文存储
   - 日志记录
   - 第三方共享
   - DOM显示
4. 安全性分析：
   - XSS风险点
   - 数据泄露风险
   - 不安全的存储
   - 不安全的传输
5. 提供修复建议

输出JSON格式：
\`\`\`json
{
  "sensitiveData": [
    {
      "type": "password",
      "source": "form input #password",
      "flow": [
        {
          "step": 1,
          "action": "read",
          "location": "line 23",
          "code": "const password = document.getElementById('password').value;"
        },
        {
          "step": 2,
          "action": "log",
          "location": "line 25",
          "code": "console.log('Password:', password);",
          "security": {
            "issue": "Password logged to console",
            "severity": "critical"
          }
        },
        {
          "step": 3,
          "action": "send",
          "location": "line 27",
          "code": "fetch('/api/login', { body: JSON.stringify({ password }) });",
          "security": {
            "issue": "Password sent over HTTP",
            "severity": "critical"
          }
        }
      ]
    },
    {
      "type": "api-token",
      "source": "localStorage",
      "flow": [
        {
          "step": 1,
          "action": "read",
          "location": "line 45",
          "code": "const token = localStorage.getItem('token');"
        },
        {
          "step": 2,
          "action": "send",
          "location": "line 47",
          "code": "fetch(url, { headers: { 'Authorization': token } });",
          "security": {
            "issue": "Token sent to third-party domain",
            "severity": "high"
          }
        }
      ]
    }
  ],
  "vulnerabilities": [
    {
      "type": "XSS",
      "description": "User input directly inserted into DOM",
      "location": "line 67",
      "code": "element.innerHTML = userInput;",
      "severity": "critical",
      "fix": "Use textContent or sanitize input"
    },
    {
      "type": "Insecure Storage",
      "description": "Sensitive token stored in localStorage",
      "location": "line 89",
      "code": "localStorage.setItem('token', token);",
      "severity": "high",
      "fix": "Use httpOnly cookie or sessionStorage"
    }
  ],
  "summary": "Found 2 sensitive data flows with 4 critical issues",
  "recommendations": [
    "Never log sensitive data",
    "Always use HTTPS for sensitive data transmission",
    "Sanitize all user inputs before DOM insertion",
    "Use secure storage mechanisms for tokens",
    "Implement Content Security Policy"
  ]
}
\`\`\`

代码：
{{code}}`,
  },
];

/**
 * 获取所有内置模板
 */
export function getBuiltinTemplates(): AnalysisTemplate[] {
  return BUILTIN_TEMPLATES;
}

/**
 * 根据场景获取模板
 */
export function getTemplateByScenario(scenario: AnalysisScenario): AnalysisTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.category === scenario);
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id: string): AnalysisTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

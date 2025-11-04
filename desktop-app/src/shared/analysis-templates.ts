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

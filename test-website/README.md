# JS Hunter Test Website

这是一个专门设计的测试网页，用于验证JS Hunter的各种功能。

## 📋 测试场景覆盖

### 1. JS文件收集测试

| 文件类型 | 文件名 | 测试内容 |
|---------|--------|---------|
| 正常JS | `external-normal.js` | 标准格式的JS代码，包含类、函数、API调用 |
| 压缩JS | `external-minified.js` | 生产环境压缩的代码，包含敏感信息 |
| 混淆JS | `external-obfuscated.js` | 混淆的恶意代码，包含数据窃取功能 |
| 框架JS | `framework-vue.js` | 模拟Vue.js应用，包含路由和配置 |
| 动态JS | `dynamic-loaded.js` | 动态加载的脚本，包含隐藏配置 |
| 内联JS | `index.html` | HTML中的内联脚本 |

### 2. 敏感信息测试

**API密钥泄露：**
- ✅ Stripe API密钥（公钥和私钥）
- ✅ AWS访问密钥
- ✅ Google Maps API密钥
- ✅ Twilio认证令牌
- ✅ SendGrid API密钥
- ✅ 内部API密钥

**凭证泄露：**
- ✅ 数据库连接字符串
- ✅ 管理员密码
- ✅ JWT密钥
- ✅ 加密密钥
- ✅ Webhook密钥

**内部信息：**
- ✅ 内部API URL
- ✅ 数据库主机地址
- ✅ Redis连接信息
- ✅ MongoDB URI

### 3. API端点发现测试

**公开端点：**
- `/api/auth/login`
- `/api/auth/register`
- `/api/users/:id`
- `/api/payments/process`

**隐藏端点：**
- `/api/admin/dashboard`
- `/api/debug/info`
- `/api/internal/stats`
- `/api/system/exec`
- `/api/backup/download`

**隐藏路由：**
- `/admin`
- `/debug`
- `/internal`
- `/test-payment`
- `/backdoor`

### 4. 认证逻辑漏洞测试

**客户端认证：**
- ✅ 仅在前端检查Token
- ✅ Token无签名验证
- ✅ Token可伪造
- ✅ 客户端生成Token
- ✅ 硬编码密钥

**认证绕过：**
- ✅ `checkAuth()` 仅检查Token长度
- ✅ `generateToken()` 使用Base64编码
- ✅ `elevateToAdmin()` 客户端提权

### 5. 业务逻辑漏洞测试

**价格篡改：**
- ✅ 客户端计算总价
- ✅ 价格参数可修改
- ✅ 优惠券客户端验证
- ✅ 折扣逻辑可绕过

**支付绕过：**
- ✅ `bypassPayment` Feature Flag
- ✅ `skipPaymentValidation` 开关
- ✅ 测试优惠券100%折扣

### 6. 加密算法漏洞测试

**弱加密：**
- ✅ Base64伪装成加密
- ✅ XOR简单加密
- ✅ MD5哈希（已弃用）
- ✅ 硬编码加密密钥
- ✅ 固定盐值

### 7. 漏洞模式测试

**XSS漏洞：**
- ✅ `innerHTML` 直接插入
- ✅ 未转义用户输入
- ✅ `displayUserComment()` 函数

**原型污染：**
- ✅ `merge()` 函数未检查 `__proto__`
- ✅ 对象合并漏洞

**SQL注入：**
- ✅ 字符串拼接构造SQL
- ✅ `buildQuery()` 函数
- ✅ 未使用参数化查询

**命令注入：**
- ✅ `executeCommand()` 函数
- ✅ 客户端命令验证可绕过

### 8. 隐藏功能测试

**Feature Flags：**
- ✅ `enableAdminMode`
- ✅ `enableDebugPanel`
- ✅ `bypassPayment`
- ✅ `skipEmailVerification`
- ✅ `allowDirectSQLQuery`
- ✅ `disableCSRFProtection`

**隐藏激活：**
- ✅ URL Hash: `#admin-secret-2024`
- ✅ Query参数: `?debug=true`
- ✅ 特殊路由访问

### 9. 动态代码执行测试

**Eval执行：**
- ✅ `eval()` 调用
- ✅ `Function()` 构造器
- ✅ `setTimeout()` 字符串参数
- ✅ `setInterval()` 字符串参数

**动态加载：**
- ✅ `createElement('script')`
- ✅ 动态插入脚本
- ✅ 运行时加载

### 10. 框架识别测试

**Vue.js特征：**
- ✅ Vue Router配置
- ✅ Vuex Store配置
- ✅ Vue组件路由
- ✅ Vue生命周期

**通用框架特征：**
- ✅ Webpack打包标识
- ✅ 模块化代码
- ✅ 依赖注入

## 🎯 使用方法

### 1. 启动测试服务器

```bash
cd test-website
python3 -m http.server 8000
```

或使用Node.js：

```bash
npx serve .
```

### 2. 访问测试页面

打开浏览器访问：`http://localhost:8000`

### 3. 加载JS Hunter插件

1. 在Chrome中加载JS Hunter扩展
2. 访问测试页面
3. 点击JS Hunter图标
4. 点击"收集所有JS"

### 4. 执行测试操作

点击页面上的测试按钮：
- **加载动态JS** - 测试动态脚本收集
- **执行Eval代码** - 测试Eval拦截
- **测试API调用** - 测试API端点发现
- **测试认证** - 测试认证逻辑分析
- **测试支付逻辑** - 测试业务逻辑漏洞
- **显示隐藏功能** - 测试隐藏功能发现

### 5. 开始AI分析

1. 在JS Hunter中选择分析场景
2. 点击"开始分析"
3. 等待AI分析完成
4. 查看发现的安全问题

## ✅ 预期发现

使用JS Hunter分析此测试网页，应该能发现：

### API接口发现场景
- 10+ 个API端点
- 包含隐藏的管理员端点
- 包含调试和内部端点

### 敏感信息扫描场景
- 15+ 个API密钥
- 5+ 个数据库连接字符串
- 多个硬编码密码
- 内部URL和IP地址

### 认证逻辑分析场景
- 客户端Token生成
- 无签名验证
- 硬编码密钥
- 认证绕过方法

### 加密算法识别场景
- Base64伪装加密
- XOR简单加密
- MD5弱哈希
- 硬编码密钥

### 漏洞模式检测场景
- XSS漏洞
- SQL注入
- 原型污染
- 命令注入

### 业务逻辑分析场景
- 客户端价格计算
- 支付验证绕过
- 优惠券滥用

### 隐藏功能发现场景
- 10+ 个隐藏路由
- Feature Flags
- 调试端点
- 后门访问

### 综合安全分析场景
- 所有上述问题的综合报告
- 风险等级评估
- 修复建议

## 📊 测试检查清单

- [ ] 外部JS文件全部收集（5个文件）
- [ ] 内联JS代码收集
- [ ] 动态加载的JS收集
- [ ] Eval代码拦截
- [ ] API密钥识别（15+个）
- [ ] API端点发现（10+个）
- [ ] 隐藏路由发现（10+个）
- [ ] 认证漏洞识别
- [ ] 业务逻辑漏洞识别
- [ ] 加密算法漏洞识别
- [ ] XSS漏洞识别
- [ ] SQL注入识别
- [ ] Feature Flags发现
- [ ] 框架识别（Vue.js）

## 🔒 安全说明

**警告：** 此测试网页包含故意设计的安全漏洞和敏感信息，仅用于测试目的。

- ❌ 不要在生产环境使用
- ❌ 不要暴露到公网
- ❌ 仅在本地或隔离环境测试
- ✅ 所有密钥都是示例，非真实密钥
- ✅ 所有漏洞都是故意设计的

## 📝 测试报告模板

测试完成后，可以按以下格式记录结果：

```markdown
# JS Hunter 测试报告

## 测试环境
- 日期：YYYY-MM-DD
- JS Hunter版本：v1.0.0
- AI模型：Gemini 2.5 Flash

## 收集统计
- JS文件总数：X
- 代码总大小：X KB
- 收集耗时：X秒

## 分析结果
- 分析场景：X个
- 发现问题：X个
- Critical：X
- High：X
- Medium：X
- Low：X

## 详细发现
（列出所有发现的问题）

## 测试结论
（评估JS Hunter的准确性和完整性）
```

## 🎉 成功标准

如果JS Hunter能够：
1. ✅ 收集所有5个外部JS文件
2. ✅ 收集内联JS代码
3. ✅ 拦截动态加载的JS
4. ✅ 识别出10+个API密钥
5. ✅ 发现10+个API端点
6. ✅ 识别出主要的安全漏洞
7. ✅ 正确分类风险等级
8. ✅ 提供有价值的修复建议

则说明工具功能正常，可以投入实际使用！

# JS Hunter 部署指南

**版本**: v1.0.0  
**最后更新**: 2024-11-03

---

## 目录

1. [快速开始](#快速开始)
2. [浏览器插件部署](#浏览器插件部署)
3. [桌面应用部署](#桌面应用部署)
4. [测试网站部署](#测试网站部署)
5. [配置说明](#配置说明)
6. [故障排除](#故障排除)

---

## 快速开始

JS Hunter提供两个版本：
- **浏览器插件版**: 适合在线渗透测试，实时收集网页JS
- **桌面应用版**: 适合离线代码审计，批量处理本地文件

### 最低要求

**浏览器插件版**:
- Chrome/Edge 88+ 或 Firefox 78+
- 支持Manifest V3

**桌面应用版**:
- Windows 10+, macOS 10.15+, 或 Linux (Ubuntu 20.04+)
- Node.js 18+ (仅开发模式)

---

## 浏览器插件部署

### 方法1: 使用预打包版本（推荐）

1. **下载插件包**
   ```bash
   # 从GitHub Releases下载
   wget https://github.com/wuwang1028/js-hunter/releases/download/v1.0.0/js-hunter-extension-v1.0.0.zip
   
   # 或使用已打包的版本
   unzip js-hunter-extension-v1.0.0.zip
   ```

2. **在Chrome中加载**
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"（右上角开关）
   - 点击"加载已解压的扩展程序"
   - 选择解压后的 `extension` 文件夹

3. **在Firefox中加载**
   - 打开 `about:debugging#/runtime/this-firefox`
   - 点击"临时加载附加组件"
   - 选择 `extension/manifest.json` 文件

### 方法2: 从源码构建

```bash
# 克隆仓库
git clone https://github.com/wuwang1028/js-hunter.git
cd js-hunter

# 运行打包脚本
./build-extension.sh

# 加载 extension 文件夹到浏览器
```

### 插件配置

1. **配置AI API密钥**
   - 点击插件图标打开Popup
   - 点击"设置"按钮
   - 选择AI提供商（推荐Gemini 2.5 Flash）
   - 输入API密钥并保存

2. **推荐的AI提供商**

   **Gemini 2.5 Flash（推荐）**:
   - 上下文: 2M tokens
   - 免费额度: 每天1500次
   - 获取密钥: https://aistudio.google.com/app/apikey
   - 配置示例:
     ```
     Provider: Gemini
     API Key: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     Model: gemini-2.5-flash
     ```

   **DeepSeek V3（高性价比）**:
   - 上下文: 128K tokens
   - 成本: $0.48/M tokens
   - 获取密钥: https://platform.deepseek.com/
   - 配置示例:
     ```
     Provider: DeepSeek
     API Key: sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     Model: deepseek-chat
     ```

   **GPT-4.1 Mini（高性能）**:
   - 上下文: 1M tokens
   - 成本: $0.15/M input, $0.60/M output
   - 获取密钥: https://platform.openai.com/api-keys
   - 配置示例:
     ```
     Provider: OpenAI
     API Key: sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     Model: gpt-4.1-mini
     ```

3. **验证安装**
   - 打开测试网站: https://8000-inry6det4j2om7z686ogt-6234329e.manusvm.computer/
   - 打开DevTools（F12）
   - 切换到"JS Hunter"标签
   - 点击"收集所有JS"
   - 应该看到收集到的JS文件列表

---

## 桌面应用部署

### 方法1: 使用预编译版本（推荐，待实现）

```bash
# Windows
# 下载 js-hunter-setup-1.0.0.exe
# 双击安装

# macOS
# 下载 js-hunter-1.0.0.dmg
# 拖拽到Applications文件夹

# Linux
# 下载 js-hunter-1.0.0.AppImage
chmod +x js-hunter-1.0.0.AppImage
./js-hunter-1.0.0.AppImage
```

### 方法2: 从源码运行（开发模式）

```bash
# 克隆仓库
git clone https://github.com/wuwang1028/js-hunter.git
cd js-hunter/desktop-app

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 或构建生产版本
npm run build
npm run start
```

### 方法3: 打包为可执行文件

```bash
cd desktop-app

# 打包为当前平台
npm run package

# 打包为所有平台
npm run package:all

# 输出目录: desktop-app/dist/
```

### 桌面应用配置

1. **首次启动**
   - 应用会自动创建配置文件: `~/.js-hunter/config.json`
   - 数据库文件: `~/.js-hunter/database.db`

2. **配置AI API**
   - 打开设置页面
   - 配置AI提供商和API密钥（同插件版）

3. **导入JS文件**
   - 点击"导入文件"按钮
   - 选择单个JS文件或整个文件夹
   - 支持递归扫描子目录

---

## 测试网站部署

测试网站用于验证JS Hunter的功能，包含多种JS文件类型和测试场景。

### 本地部署

```bash
cd test-website

# 方法1: 使用Python HTTP服务器
python3 -m http.server 8000

# 方法2: 使用Node.js http-server
npx http-server -p 8000

# 访问: http://localhost:8000
```

### 公网部署（可选）

```bash
# 使用ngrok暴露本地服务
ngrok http 8000

# 或部署到静态托管服务
# - GitHub Pages
# - Netlify
# - Vercel
```

### 测试网站功能

测试网站包含以下测试场景：

1. **外部JS文件**
   - `external-normal.js` - 正常代码
   - `external-minified.js` - 压缩代码
   - `external-obfuscated.js` - 混淆代码
   - `framework-vue.js` - 框架代码
   - `dynamic-loaded.js` - 动态加载代码

2. **内联JS代码**
   - API密钥泄露（9种）
   - 认证逻辑漏洞
   - 业务逻辑漏洞

3. **交互功能**
   - 动态JS加载
   - Eval执行
   - API调用
   - WebSocket连接
   - LocalStorage操作

---

## 配置说明

### 插件配置文件

插件使用Chrome Storage API存储配置，无需手动编辑文件。

**主要配置项**:
```json
{
  "aiProvider": "gemini",
  "apiKey": "YOUR_API_KEY",
  "model": "gemini-2.5-flash",
  "autoCollect": true,
  "maxFileSize": 8388608,
  "analysisTimeout": 30000
}
```

### 桌面应用配置文件

位置: `~/.js-hunter/config.json`

```json
{
  "ai": {
    "provider": "gemini",
    "apiKey": "YOUR_API_KEY",
    "model": "gemini-2.5-flash",
    "temperature": 0.3,
    "maxTokens": 4000
  },
  "analysis": {
    "defaultScenario": "api_discovery",
    "autoAnalyze": false,
    "chunkSize": 100000
  },
  "export": {
    "defaultFormat": "json",
    "outputDir": "~/js-hunter-reports"
  },
  "database": {
    "path": "~/.js-hunter/database.db",
    "maxSize": 1073741824
  }
}
```

### 环境变量（可选）

```bash
# AI API配置
export JS_HUNTER_AI_PROVIDER=gemini
export JS_HUNTER_API_KEY=your_api_key

# 数据库路径
export JS_HUNTER_DB_PATH=/custom/path/database.db

# 日志级别
export JS_HUNTER_LOG_LEVEL=debug

# 代理设置
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

---

## 故障排除

### 常见问题

#### 1. 插件无法加载

**问题**: Chrome提示"无法加载扩展程序"

**解决方案**:
```bash
# 检查manifest.json是否有效
cd extension
cat manifest.json | jq .

# 确保所有必需文件存在
ls -la background/ content/ popup/ devtools/ lib/
```

#### 2. AI分析失败

**问题**: 分析时提示"API调用失败"

**解决方案**:
1. 检查API密钥是否正确
2. 检查网络连接
3. 查看浏览器控制台错误信息
4. 验证API配额是否用完

```javascript
// 在浏览器控制台测试API
fetch('https://generativelanguage.googleapis.com/v1/models', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
}).then(r => r.json()).then(console.log)
```

#### 3. JS文件收集不完整

**问题**: 某些JS文件未被收集

**可能原因**:
- 文件通过动态方式加载（需要等待页面完全加载）
- 文件大小超过限制（默认8MB）
- 文件被CSP策略阻止

**解决方案**:
1. 等待页面完全加载后再收集
2. 调整maxFileSize配置
3. 检查浏览器控制台的CSP错误

#### 4. 桌面应用无法启动

**问题**: 双击应用无反应

**解决方案**:
```bash
# 检查Node.js版本
node --version  # 应该 >= 18.0.0

# 检查依赖安装
cd desktop-app
npm install

# 查看错误日志
npm run dev  # 开发模式查看详细错误
```

#### 5. 数据库错误

**问题**: "Database is locked" 或 "SQLITE_BUSY"

**解决方案**:
```bash
# 关闭所有JS Hunter实例
pkill -f js-hunter

# 删除锁文件
rm ~/.js-hunter/database.db-journal

# 重新启动应用
```

#### 6. 导出功能失败

**问题**: 导出报告时出错

**解决方案**:
1. 检查输出目录权限
2. 确保磁盘空间充足
3. 检查文件名是否包含非法字符

```bash
# 手动创建输出目录
mkdir -p ~/js-hunter-reports
chmod 755 ~/js-hunter-reports
```

### 性能优化

#### 大文件处理

如果分析大型JS文件（>1MB）时性能较慢：

1. **启用分块处理**
   ```json
   {
     "analysis": {
       "chunkSize": 50000,
       "enableChunking": true
     }
   }
   ```

2. **调整超时时间**
   ```json
   {
     "analysis": {
       "timeout": 60000
     }
   }
   ```

3. **使用缓存**
   - 插件会自动缓存分析结果
   - 相同文件不会重复分析

#### 内存优化

如果遇到内存不足：

```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 或在package.json中配置
"scripts": {
  "start": "node --max-old-space-size=4096 dist/main/main.js"
}
```

### 调试技巧

#### 启用调试模式

**浏览器插件**:
```javascript
// 在background/service-worker.ts中
const DEBUG = true;

if (DEBUG) {
  console.log('[JS Hunter Debug]', ...args);
}
```

**桌面应用**:
```bash
# 设置环境变量
export DEBUG=js-hunter:*
npm run dev
```

#### 查看日志

**浏览器插件**:
- 打开 `chrome://extensions/`
- 找到JS Hunter
- 点击"背景页"或"service worker"
- 查看控制台日志

**桌面应用**:
```bash
# 日志文件位置
~/.js-hunter/logs/app.log
~/.js-hunter/logs/error.log

# 实时查看日志
tail -f ~/.js-hunter/logs/app.log
```

---

## 安全建议

### API密钥安全

1. **不要在代码中硬编码API密钥**
2. **使用环境变量存储敏感信息**
3. **定期轮换API密钥**
4. **为不同环境使用不同的密钥**

### 数据安全

1. **本地数据加密**
   ```json
   {
     "security": {
       "encryptDatabase": true,
       "encryptionKey": "your-encryption-key"
     }
   }
   ```

2. **清理敏感数据**
   ```bash
   # 清除所有分析结果
   rm -rf ~/.js-hunter/database.db
   
   # 清除缓存
   rm -rf ~/.js-hunter/cache/
   ```

3. **导出报告脱敏**
   - 导出前检查是否包含敏感信息
   - 使用"脱敏"选项隐藏敏感数据

---

## 更新和维护

### 检查更新

```bash
# 检查最新版本
curl -s https://api.github.com/repos/wuwang1028/js-hunter/releases/latest | jq -r .tag_name

# 或访问
https://github.com/wuwang1028/js-hunter/releases
```

### 升级步骤

**浏览器插件**:
1. 下载新版本的ZIP包
2. 解压到新目录
3. 在 `chrome://extensions/` 中移除旧版本
4. 加载新版本

**桌面应用**:
1. 备份配置和数据库
   ```bash
   cp -r ~/.js-hunter ~/.js-hunter.backup
   ```
2. 安装新版本
3. 恢复配置（如需要）

### 数据迁移

```bash
# 导出旧版本数据
js-hunter export --all --output backup.json

# 安装新版本后导入
js-hunter import --input backup.json
```

---

## 支持和反馈

### 获取帮助

- **GitHub Issues**: https://github.com/wuwang1028/js-hunter/issues
- **文档**: https://github.com/wuwang1028/js-hunter/wiki
- **测试网站**: https://8000-inry6det4j2om7z686ogt-6234329e.manusvm.computer/

### 报告Bug

提交Issue时请包含：
1. 版本号（`js-hunter --version`）
2. 操作系统和浏览器版本
3. 详细的错误信息和日志
4. 复现步骤

### 贡献代码

欢迎提交Pull Request！请参考 `CONTRIBUTING.md`。

---

## 附录

### 目录结构

```
js-hunter/
├── extension/              # 浏览器插件
│   ├── background/        # 后台脚本
│   ├── content/           # 内容脚本
│   ├── popup/             # 弹出窗口
│   ├── devtools/          # 开发者工具
│   ├── options/           # 选项页面
│   ├── lib/               # 核心库
│   └── manifest.json      # 插件配置
├── desktop-app/           # 桌面应用
│   ├── src/
│   │   ├── main/         # 主进程
│   │   └── renderer/     # 渲染进程
│   └── package.json
├── test-website/          # 测试网站
├── docs/                  # 文档
└── README.md
```

### 相关文档

- [README.md](./README.md) - 项目介绍
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 详细使用指南
- [INSTALL.md](./INSTALL.md) - 安装说明
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 测试指南
- [API_VALIDATION_REPORT.md](./API_VALIDATION_REPORT.md) - API验证报告
- [RELEASE_NOTES.md](./RELEASE_NOTES.md) - 发布说明

---

**最后更新**: 2024-11-03  
**文档版本**: 1.0.0

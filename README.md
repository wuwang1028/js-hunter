# JS Hunter - JavaScript Analysis Tool for Penetration Testing

**JS Hunter** 是一个强大的JavaScript分析工具，专为渗透测试人员设计，提供**浏览器插件版**和**桌面应用版**两个版本。

## 🎯 两个版本对比

| 特性 | 浏览器插件版 | 桌面应用版 |
|------|------------|-----------|
| **运行环境** | Chrome/Edge浏览器 | Windows/macOS/Linux |
| **主要用途** | 实时收集和分析网页JS | 批量处理本地JS文件 |
| **JS收集** | ✅ 自动拦截<br>✅ 内联JS<br>✅ 动态JS<br>✅ Eval拦截 | ✅ 文件导入<br>✅ 文件夹批量导入 |
| **AI分析** | ✅ 8种场景<br>✅ 智能分块 | ✅ 8种场景<br>✅ 智能分块<br>✅ 批量分析 |
| **数据存储** | IndexedDB（浏览器） | SQLite（本地文件） |
| **界面** | Popup + DevTools | 独立桌面应用 |
| **导出功能** | JSON/HTML/PDF/Markdown | JSON/HTML/Markdown |
| **高级功能** | - | ✅ 去混淆<br>✅ Source Map<br>✅ CLI模式 |
| **适用场景** | 在线渗透测试 | 离线分析、批量处理 |

## 📦 版本选择建议

### 选择浏览器插件版，如果你：
- ✅ 需要在浏览网站时实时收集JS
- ✅ 想要拦截网络请求中的JS文件
- ✅ 需要捕获eval()等动态代码执行
- ✅ 进行在线渗透测试

### 选择桌面应用版，如果你：
- ✅ 有大量本地JS文件需要分析
- ✅ 需要批量处理整个项目
- ✅ 想要更强大的去混淆功能
- ✅ 需要生成正式的分析报告
- ✅ 进行离线代码审计

### 两者结合使用：
1. 使用**插件版**在浏览器中收集目标网站的JS文件
2. 导出收集到的JS文件
3. 使用**桌面版**进行深度批量分析
4. 生成完整的渗透测试报告

## 🚀 快速开始

### 浏览器插件版

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/js-hunter.git
cd js-hunter

# 2. 加载到Chrome
# 打开 chrome://extensions/
# 开启"开发者模式"
# 点击"加载已解压的扩展程序"
# 选择 extension 文件夹

# 3. 配置API密钥
# 点击插件图标 → 设置 → 填入Gemini API Key
```

详细文档：[extension/README.md](extension/README.md)

### 桌面应用版

```bash
# 1. 进入桌面应用目录
cd desktop-app

# 2. 安装依赖
npm install

# 3. 开发模式运行
npm run dev

# 4. 打包为可执行文件
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

详细文档：[desktop-app/README.md](desktop-app/README.md)

## ✨ 核心特性

### 🎯 智能JS收集（插件版）
- **多策略收集**：自动拦截外部JS、收集内联JS、监听动态JS
- **Eval拦截**：捕获eval()、Function构造器、setTimeout/setInterval动态代码执行
- **去重机制**：基于SHA-256哈希自动去重
- **元数据分析**：自动识别压缩、混淆、框架类型、打包工具

### 📁 批量文件处理（桌面版）
- **灵活导入**：支持单文件、多文件、整个文件夹导入
- **智能过滤**：自动识别JS文件（.js/.mjs/.jsx/.ts/.tsx）
- **递归扫描**：自动扫描子目录（跳过node_modules）
- **项目管理**：按项目组织文件

### 🤖 AI驱动分析（两个版本通用）
- **大上下文支持**：
  - Gemini 2.5 Flash (2M上下文，推荐)
  - DeepSeek V3 (128K上下文，低成本)
  - GPT-4.1 Mini (1M上下文，高性能)
  - 自定义API端点

- **8种分析场景**：
  1. **API接口发现** - 提取所有API端点、参数、认证方式
  2. **敏感信息扫描** - 发现API密钥、令牌、密码、内部域名
  3. **认证逻辑分析** - 识别认证绕过和授权漏洞
  4. **加密算法识别** - 检测弱加密算法和密钥管理问题
  5. **漏洞模式检测** - XSS、注入、原型污染等常见漏洞
  6. **业务逻辑分析** - 发现价格篡改、条件竞争等业务漏洞
  7. **隐藏功能发现** - 找出隐藏路由、调试接口、feature flags
  8. **综合安全分析** - 全面的安全评估和建议

### 🚀 智能分块
- 自动处理超大JS文件
- 智能分块策略
- 结果自动合并

### 💾 强大的数据管理
- **插件版**：IndexedDB本地存储
- **桌面版**：SQLite数据库
- 项目管理
- 自定义分析模板
- 数据导出（JSON/HTML/PDF/Markdown）

## 📋 典型使用场景

### 场景1：在线渗透测试（插件版）

```
1. 访问目标网站
2. 点击JS Hunter插件图标
3. 点击"收集所有JS"
4. 浏览网站的各个功能页面
5. 选择分析场景（API发现、敏感信息扫描等）
6. 点击"开始分析"
7. 查看发现的安全问题
8. 导出分析结果
```

### 场景2：离线代码审计（桌面版）

```
1. 启动JS Hunter Desktop
2. 点击"导入文件夹"
3. 选择目标项目的JS目录
4. 等待文件导入完成
5. 选择要分析的文件
6. 配置分析场景
7. 点击"批量分析"
8. 生成HTML/PDF报告
```

### 场景3：混合使用

```
1. 使用插件版收集目标网站的JS文件
2. 在插件中导出收集到的文件
3. 在桌面版中导入导出的文件
4. 使用桌面版的高级功能进行深度分析
5. 生成完整的渗透测试报告
```

## 🛠️ 安装指南

### 浏览器插件版安装

详见：[INSTALL.md](INSTALL.md)

### 桌面应用版安装

**Windows用户：**
1. 下载 `JS Hunter Setup.exe`
2. 双击运行安装程序
3. 按照向导完成安装

**macOS用户：**
1. 下载 `JS Hunter.dmg`
2. 双击打开
3. 拖动到Applications文件夹

**Linux用户：**
```bash
# AppImage
chmod +x JS-Hunter.AppImage
./JS-Hunter.AppImage

# 或使用deb包
sudo dpkg -i js-hunter.deb
```

## 📖 文档

- [使用指南](USAGE_GUIDE.md) - 详细的使用说明和实战案例
- [安装指南](INSTALL.md) - 插件版安装步骤
- [桌面版README](desktop-app/README.md) - 桌面版开发和打包
- [API文档](docs/API.md) - 开发者文档

## 🔧 开发

### 项目结构

```
js-hunter/
├── extension/              # 浏览器插件版
│   ├── manifest.json       # 插件配置
│   ├── background/         # 后台服务
│   ├── content/            # 内容脚本
│   ├── popup/              # 弹出窗口
│   ├── devtools/           # 开发者工具
│   ├── options/            # 设置页面
│   └── lib/                # 核心库
│
├── desktop-app/            # 桌面应用版
│   ├── src/
│   │   ├── main/           # Electron主进程
│   │   ├── renderer/       # React渲染进程
│   │   └── shared/         # 共享代码
│   └── package.json
│
├── docs/                   # 文档
├── README.md               # 主README
├── USAGE_GUIDE.md          # 使用指南
└── INSTALL.md              # 安装指南
```

### 构建插件版

```bash
# 编译TypeScript（如果修改了TS文件）
npm run build

# 打包为zip
npm run package
```

### 构建桌面版

```bash
cd desktop-app
npm install
npm run package
```

## 🔒 安全性说明

- **API密钥安全**：所有API密钥仅存储在本地
- **数据隐私**：收集的JS文件和分析结果仅存储在本地
- **网络请求**：仅向配置的AI API端点发送请求
- **权限最小化**：仅请求必要的权限

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- 感谢所有开源项目的贡献者
- 特别感谢AI模型提供商（Google、DeepSeek、OpenAI）

## 📞 联系方式

- GitHub Issues: [提交问题](https://github.com/yourusername/js-hunter/issues)
- Email: support@jshunter.com

---

**免责声明**：本工具仅供合法的安全测试使用。使用本工具进行未经授权的测试是违法的。使用者需自行承担使用本工具的一切后果。

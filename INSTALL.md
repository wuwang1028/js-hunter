# JS Hunter 安装指南

## 方式一：直接加载（推荐，无需编译）

### 步骤1：下载项目

```bash
# 克隆仓库
git clone https://github.com/yourusername/js-hunter.git
cd js-hunter
```

或者直接下载ZIP文件并解压。

### 步骤2：加载到Chrome

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"按钮
5. 选择 `js-hunter/extension` 文件夹
6. 安装完成！

### 步骤3：配置API密钥

1. 点击工具栏的JS Hunter图标
2. 点击设置按钮（齿轮图标）
3. 填入Gemini API Key（[获取地址](https://aistudio.google.com/app/apikey)）
4. 点击"保存设置"

### 步骤4：开始使用

1. 访问任意网站
2. 点击JS Hunter图标
3. 点击"收集所有JS"
4. 点击"开始分析"

## 方式二：编译后安装（开发者）

如果你修改了TypeScript代码，需要先编译：

### 步骤1：安装依赖

```bash
cd js-hunter
npm install
```

### 步骤2：编译TypeScript

```bash
# 单次编译
npm run build

# 或者监听文件变化自动编译
npm run watch
```

### 步骤3：加载扩展

按照"方式一"的步骤2-4操作。

## 方式三：打包为.zip文件

### 创建发布包

```bash
# 编译TypeScript
npm run build

# 打包为zip
npm run package
```

生成的 `js-hunter-extension.zip` 可以：
- 分享给其他人
- 提交到Chrome Web Store
- 作为备份保存

### 从.zip安装

1. 解压 `js-hunter-extension.zip`
2. 按照"方式一"的步骤2-4操作

## 验证安装

安装成功后，你应该看到：

1. ✅ Chrome工具栏出现JS Hunter图标（蓝色圆形，带"JS"字样）
2. ✅ 点击图标显示Popup界面
3. ✅ 按F12打开开发者工具，看到"JS Hunter"标签
4. ✅ 右键点击图标 → 选项，打开设置页面

## 常见问题

### Q: 提示"无法加载扩展程序"

**原因**：选择的文件夹不正确

**解决**：确保选择的是 `extension` 文件夹，不是 `js-hunter` 根目录

### Q: 图标显示但点击无反应

**原因**：可能是文件路径问题

**解决**：
1. 检查 `extension/popup/popup.html` 是否存在
2. 检查浏览器控制台是否有错误
3. 尝试重新加载扩展

### Q: TypeScript编译失败

**原因**：缺少依赖或TypeScript版本不兼容

**解决**：
```bash
# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install

# 使用特定版本的TypeScript
npm install typescript@5.3.3 --save-dev
```

### Q: 提示"manifest.json"错误

**原因**：manifest.json格式错误或路径不对

**解决**：
1. 检查 `extension/manifest.json` 是否存在
2. 使用JSON验证工具检查格式
3. 确保JSON中没有注释

## 卸载

### 方法1：从Chrome卸载

1. 访问 `chrome://extensions/`
2. 找到"JS Hunter"
3. 点击"移除"按钮
4. 确认删除

### 方法2：清除所有数据

如果要彻底清除包括数据库：

1. 卸载扩展（方法1）
2. 访问 `chrome://settings/clearBrowserData`
3. 选择"高级" → "所有时间"
4. 勾选"Cookie和其他网站数据"
5. 点击"清除数据"

## 更新

### 更新已安装的扩展

1. 下载最新版本的代码
2. 访问 `chrome://extensions/`
3. 找到"JS Hunter"
4. 点击刷新按钮（圆形箭头图标）

### 保留数据更新

数据存储在浏览器中，更新扩展不会丢失数据。

如果需要备份数据：
1. 打开设置页面
2. 点击"导出数据"
3. 保存JSON文件
4. 更新后导入数据

## 系统要求

- **浏览器**：Chrome 88+ 或 Edge 88+
- **操作系统**：Windows、macOS、Linux
- **网络**：需要访问AI API（Gemini/DeepSeek/OpenAI）
- **存储空间**：建议至少500MB可用空间

## 权限说明

JS Hunter请求以下权限：

| 权限 | 用途 |
|------|------|
| `storage` | 保存配置和数据 |
| `tabs` | 获取当前标签页信息 |
| `activeTab` | 与当前页面交互 |
| `scripting` | 注入content script |
| `downloads` | 导出分析报告 |
| `webRequest` | 拦截JS文件请求 |
| `<all_urls>` | 在所有网站工作 |

所有权限仅用于插件功能，不会上传任何数据到第三方服务器。

## 获取帮助

- **文档**：查看 [README.md](README.md) 和 [USAGE_GUIDE.md](USAGE_GUIDE.md)
- **问题反馈**：[GitHub Issues](https://github.com/yourusername/js-hunter/issues)
- **邮件支持**：support@jshunter.com

## 下一步

安装完成后，建议：

1. 📖 阅读 [使用指南](USAGE_GUIDE.md)
2. 🎯 尝试分析一个简单的网站
3. ⚙️ 根据需要调整设置
4. 💡 查看实战案例学习技巧

祝你使用愉快！🚀

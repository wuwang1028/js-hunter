#!/bin/bash

# JS Hunter Extension Build Script

echo "🔨 Building JS Hunter Extension..."

# 清理旧的构建
rm -rf dist/extension
mkdir -p dist/extension

# 复制文件到dist目录
echo "📦 Copying files..."
cp -r extension/* dist/extension/

# 创建版本信息
echo "📝 Creating version info..."
cat > dist/extension/version.json << 'VEOF'
{
  "version": "1.0.0",
  "buildDate": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "name": "JS Hunter",
  "description": "JavaScript Analysis Tool for Penetration Testing"
}
VEOF

# 打包为zip
echo "📦 Creating zip archive..."
cd dist/extension
zip -r ../js-hunter-extension-v1.0.0.zip . -x "*.ts" -x "tsconfig.json"
cd ../..

echo "✅ Build complete! Package: dist/js-hunter-extension-v1.0.0.zip"
echo "📊 Package size: $(du -h dist/js-hunter-extension-v1.0.0.zip | cut -f1)"

# 显示安装说明
echo ""
echo "📖 Installation Instructions:"
echo "1. Open Chrome/Edge and navigate to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' and select the dist/extension folder"
echo "   OR"
echo "   Extract the zip file and load the extracted folder"

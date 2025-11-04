#!/bin/bash

echo "==================================="
echo "JS Hunter - Package All Versions"
echo "==================================="

# 1. 打包浏览器插件版
echo ""
echo "📦 Packaging Browser Extension..."
cd /home/ubuntu/js-hunter
zip -r js-hunter-extension-v1.0.0.zip extension/ -x "*.ts" -x "*.map" -x "*node_modules*"
echo "✅ Extension packaged: js-hunter-extension-v1.0.0.zip"

# 2. 创建桌面版说明文件
echo ""
echo "📝 Creating Desktop App Build Instructions..."
cat > desktop-app/BUILD.md << 'BUILDMD'
# JS Hunter Desktop - Build Instructions

## Prerequisites

- Node.js 18+
- npm or pnpm

## Build Steps

### 1. Install Dependencies

```bash
cd desktop-app
npm install
```

### 2. Build Application

```bash
# Build for all platforms
npm run package

# Or build for specific platform
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

### 3. Output

Built applications will be in `desktop-app/release/` directory:

- **Windows**: `JS Hunter Setup.exe` (installer) or `JS Hunter.exe` (portable)
- **macOS**: `JS Hunter.dmg`
- **Linux**: `JS Hunter.AppImage` or `js-hunter.deb`

## Development

```bash
npm run dev
```

## Notes

- Windows build requires Windows or Wine
- macOS build requires macOS
- Linux build works on all platforms
BUILDMD

echo "✅ Desktop build instructions created: desktop-app/BUILD.md"

# 3. 创建发布包清单
echo ""
echo "📋 Creating Release Manifest..."
cat > RELEASE.md << 'RELEASEMD'
# JS Hunter v1.0.0 - Release Package

## Package Contents

### 1. Browser Extension (Chrome/Edge)
- **File**: `js-hunter-extension-v1.0.0.zip`
- **Installation**: Extract and load in Chrome/Edge
- **Documentation**: See `INSTALL.md`

### 2. Desktop Application (Windows/macOS/Linux)
- **Source**: `desktop-app/` directory
- **Build Instructions**: See `desktop-app/BUILD.md`
- **Requirements**: Node.js 18+

## Quick Start

### Browser Extension
1. Extract `js-hunter-extension-v1.0.0.zip`
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension` folder

### Desktop Application
1. Navigate to `desktop-app/`
2. Run `npm install`
3. Run `npm run package:win` (or :mac/:linux)
4. Find executable in `release/` folder

## Documentation

- `README.md` - Main documentation
- `USAGE_GUIDE.md` - Detailed usage guide
- `INSTALL.md` - Installation guide
- `desktop-app/README.md` - Desktop app documentation

## Version Information

- **Version**: 1.0.0
- **Release Date**: 2024-11-03
- **License**: MIT

## Support

- GitHub Issues: https://github.com/yourusername/js-hunter/issues
- Email: support@jshunter.com
RELEASEMD

echo "✅ Release manifest created: RELEASE.md"

# 4. 显示摘要
echo ""
echo "==================================="
echo "✅ Packaging Complete!"
echo "==================================="
echo ""
echo "📦 Browser Extension:"
echo "   - js-hunter-extension-v1.0.0.zip"
echo ""
echo "🖥️  Desktop Application:"
echo "   - Source: desktop-app/"
echo "   - Build: See desktop-app/BUILD.md"
echo ""
echo "📄 Documentation:"
echo "   - README.md"
echo "   - USAGE_GUIDE.md"
echo "   - INSTALL.md"
echo "   - RELEASE.md"
echo ""
echo "🎉 Ready to distribute!"
echo "==================================="

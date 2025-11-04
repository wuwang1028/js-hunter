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

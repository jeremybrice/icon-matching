# Parlevel Icon Matching Tool

A desktop application for matching legacy Parlevel icons to modern Streamline SVG icons and generating platform-specific PNG assets for Android and iOS.

## Features

- **Visual Icon Matching** - Side-by-side interface to match legacy icons with 10,000+ Streamline icons
- **Smart Search** - Search icons by name or browse by category
- **Platform Support** - Generate assets for both Android and iOS
- **Custom Sizing** - Auto-detects legacy icon dimensions and generates all density variants
- **Color Customization** - Apply custom colors with outline or solid fill modes
- **Auto Color Detection** - Samples dominant color from legacy icons
- **Batch Export** - Generate all matched icons at once with proper folder structure
- **Progress Tracking** - Save and resume your matching progress

## Output Formats

### Android
Generates drawable folders with density-specific PNGs:
- `drawable-mdpi/` (1x)
- `drawable-hdpi/` (1.5x)
- `drawable-xhdpi/` (2x)
- `drawable-xxhdpi/` (3x)
- `drawable-xxxhdpi/` (4x)

### iOS
Generates `.imageset` folders with:
- `icon.png` (@1x)
- `icon@2x.png` (@2x)
- `icon@3x.png` (@3x)
- `Contents.json`

## Installation

### Download
Get the latest installer from the [Releases](../../releases) page:
- **Windows:** `Parlevel Icon Matching Tool Setup X.X.X.exe`
- **macOS:** `Parlevel Icon Matching Tool-X.X.X.dmg`

### macOS Note
On first launch, right-click the app and select **Open** to bypass Gatekeeper (the app is not signed with an Apple Developer certificate).

## Quick Start

1. **Launch** the application
2. **Select platform** (Android or iOS) at the top
3. **Click a legacy icon** on the left panel
4. **Search or browse** for a replacement icon on the right panel
5. **Click the new icon** to open the configuration modal
6. **Configure** sizes, color, and color mode
7. **Confirm** the match
8. **Repeat** for all icons
9. **Generate PNGs** when finished

## Documentation

See the full [User Guide](USER_GUIDE.md) for detailed instructions.

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
git clone https://github.com/jeremybrice/icon-matching.git
cd icon-matching
npm install
```

### Run Development
```bash
npm start
```

### Build Installers
```bash
# Windows
npm run build:win

# macOS (requires macOS)
npm run build:mac

# Current platform
npm run build
```

### Regenerate Icon Manifests
If you update the icon libraries, regenerate the manifest:
```bash
npm run manifests
```

## Project Structure

```
icon-matching/
├── main.js                 # Electron main process
├── preload.js              # IPC bridge
├── index.html              # Application UI
├── icon-manifests.js       # Generated icon index
├── generate-manifests.js   # Manifest generator script
├── package.json            # Dependencies and build config
├── build/                  # App icons for installers
├── parlevel_stockapp_android_assets/  # Legacy Android icons
├── parlevel_stockapp_ios_assets/      # Legacy iOS icons
└── streamline-ultimate-regular/       # Streamline SVG library
```

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **Sharp** - High-performance image processing
- **electron-builder** - Application packaging

## License

ISC

---

*Built for Parlevel Systems*

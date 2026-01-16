# Parlevel Icon Matching Tool
## User Guide

---

## Table of Contents
1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Interface Overview](#interface-overview)
4. [Matching Icons](#matching-icons)
5. [Configuring Output Settings](#configuring-output-settings)
6. [Generating PNG Assets](#generating-png-assets)
7. [Managing Mappings](#managing-mappings)
8. [Troubleshooting](#troubleshooting)

---

## Installation

### Windows
1. Double-click `Parlevel Icon Matching Tool Setup 1.0.0.exe`
2. Follow the installation wizard
3. Choose your installation directory (or use default)
4. Click **Install**
5. Launch from the Start Menu or Desktop shortcut

### macOS
1. Double-click `Parlevel Icon Matching Tool-1.0.0.dmg`
2. Drag the app to the **Applications** folder
3. **First launch only:** Right-click the app → Select **Open** → Click **Open** in the dialog
   - This is required because the app is not signed with an Apple Developer certificate

---

## Getting Started

1. Launch the **Parlevel Icon Matching Tool**
2. The application opens with two panels:
   - **Left panel:** Legacy Parlevel icons (the icons you want to replace)
   - **Right panel:** Streamline icons (the new icons to use)
3. Select your platform at the top: **Android** or **iOS**

---

## Interface Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Android] [iOS]                              [Progress: 0/82]      │
├─────────────────────────────────┬───────────────────────────────────┤
│                                 │                                   │
│   LEGACY PARLEVEL ICONS         │      STREAMLINE ICONS             │
│                                 │                                   │
│   [Search...]                   │   [Search...]                     │
│                                 │   [Category Filter ▼]             │
│   ┌─────┐ ┌─────┐ ┌─────┐      │                                   │
│   │icon1│ │icon2│ │icon3│      │   ┌─────┐ ┌─────┐ ┌─────┐        │
│   └─────┘ └─────┘ └─────┘      │   │icon1│ │icon2│ │icon3│        │
│                                 │   └─────┘ └─────┘ └─────┘        │
│   ┌─────┐ ┌─────┐ ┌─────┐      │                                   │
│   │icon4│ │icon5│ │icon6│      │   ... (10,000+ icons)             │
│   └─────┘ └─────┘ └─────┘      │                                   │
│                                 │                                   │
├─────────────────────────────────┴───────────────────────────────────┤
│  [Import Mappings] [Export Mappings] [Generate PNGs]                │
└─────────────────────────────────────────────────────────────────────┘
```

### Left Panel (Legacy Icons)
- Shows all Parlevel legacy PNG icons
- **Green border:** Already matched
- **No border:** Not yet matched
- Click an icon to select it for matching

### Right Panel (Streamline Icons)
- Shows 10,000+ Streamline SVG icons
- Use **Search** to find icons by name
- Use **Category Filter** to browse by category
- Click an icon to match it with the selected legacy icon

### Top Bar
- **Platform Toggle:** Switch between Android and iOS
- **Progress Counter:** Shows how many icons have been matched

### Bottom Bar
- **Import/Export:** Save and load your matching progress
- **Generate PNGs:** Create the final PNG assets

---

## Matching Icons

### Step 1: Select a Legacy Icon
1. In the **left panel**, click on a legacy Parlevel icon
2. The icon will be highlighted with a blue border
3. The icon name appears below the panels

### Step 2: Find a Replacement Icon
1. In the **right panel**, search for a suitable replacement:
   - **Search by name:** Type keywords like "arrow", "settings", "user"
   - **Browse by category:** Use the dropdown to filter by category
2. Scroll through results to find the best match

### Step 3: Click to Match
1. Click on the Streamline icon you want to use
2. A **configuration modal** opens (see next section)
3. Configure your output settings
4. Click **Confirm Match**

### Step 4: Repeat
- The legacy icon now shows a **green border** indicating it's matched
- Continue matching remaining icons
- Track progress with the counter at the top

---

## Configuring Output Settings

When you click a Streamline icon to match, a modal appears with these options:

### Preview Section
- **Left:** Shows the legacy Parlevel icon with its dimensions
- **Right:** Shows the Streamline SVG you selected

### Size Selection
- **Chips** appear showing detected sizes based on the legacy icon
- **Android:** mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
- **iOS:** @1x, @2x, @3x
- Click chips to **select/deselect** which sizes to generate
- Selected chips appear highlighted

### Color Options

#### Color Picker
- Click the **color swatch** to open the color picker
- Select any color for the output icons
- The **Auto-detect** button samples the dominant color from the legacy icon

#### Color Mode
- **Outline:** Only colors the lines/strokes of the icon (transparent fill)
- **Solid:** Fills the entire icon with the selected color

| Mode | Best For |
|------|----------|
| Outline | Line icons, icons that should remain transparent |
| Solid | Filled icons, icons that need solid backgrounds |

### Confirm or Cancel
- **Confirm Match:** Saves the match with your settings
- **Cancel:** Closes without saving

---

## Generating PNG Assets

Once you've matched your icons, generate the final PNG files:

### Step 1: Click Generate PNGs
- Click the **Generate PNGs** button at the bottom
- A folder picker dialog opens

### Step 2: Select Output Folder
- Choose where to save the generated files
- A new folder will be created with the assets

### Step 3: Wait for Generation
- The tool processes each matched icon
- Progress is shown during generation
- This may take a few moments depending on the number of icons

### Step 4: Review Output

#### Android Output Structure
```
output/
├── drawable-mdpi/
│   ├── icon_name.png (1x base size)
│   └── ...
├── drawable-hdpi/
│   ├── icon_name.png (1.5x base size)
│   └── ...
├── drawable-xhdpi/
│   ├── icon_name.png (2x base size)
│   └── ...
├── drawable-xxhdpi/
│   ├── icon_name.png (3x base size)
│   └── ...
└── drawable-xxxhdpi/
    ├── icon_name.png (4x base size)
    └── ...
```

#### iOS Output Structure
```
output/
└── IconName.imageset/
    ├── Contents.json
    ├── icon_name.png (@1x)
    ├── icon_name@2x.png (@2x)
    └── icon_name@3x.png (@3x)
```

---

## Managing Mappings

### Saving Your Progress

Your matching progress is **automatically saved** in the browser's local storage. However, you should also export your mappings:

1. Click **Export Mappings**
2. Choose a save location
3. Save as `icon-mappings.json`

### Loading Previous Mappings

1. Click **Import Mappings**
2. Select your previously saved `icon-mappings.json` file
3. All your matches will be restored

### Sharing Mappings

The exported JSON file can be shared with team members:
1. Export your mappings
2. Send the JSON file to colleagues
3. They import it into their instance of the tool

---

## Troubleshooting

### App won't launch (macOS)
**Problem:** "App is damaged" or "unidentified developer" error

**Solution:**
1. Right-click the app
2. Select **Open**
3. Click **Open** in the security dialog
4. The app will launch and be remembered for future use

### Icons appear blurry
**Problem:** Generated PNGs look pixelated

**Solution:**
- Ensure you selected appropriate size multipliers
- The base size is determined by the legacy icon dimensions
- Higher density outputs (xxhdpi, @3x) will be larger and sharper

### Colors not applying correctly
**Problem:** Icon is all one solid color when it should have transparent areas

**Solution:**
- Switch from **Solid** mode to **Outline** mode
- Outline mode only colors the strokes, preserving transparency

### Generated sizes are wrong
**Problem:** Output PNGs don't match expected dimensions

**Solution:**
- The tool uses the legacy icon's dimensions as the base size
- Check that the correct sizes are selected in the modal
- Android densities are multipliers: mdpi=1x, hdpi=1.5x, xhdpi=2x, xxhdpi=3x, xxxhdpi=4x

### Mappings not saving
**Problem:** Progress is lost after closing the app

**Solution:**
- Always **Export Mappings** before closing
- Import them when you reopen the app
- Local storage may be cleared by system cleanup tools

### Can't find a Streamline icon
**Problem:** The icon you need isn't in the library

**Solution:**
- Try different search terms (e.g., "cog" vs "gear" vs "settings")
- Browse categories manually
- The library contains 10,000+ icons across many categories

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + F` | Focus search box |
| `Escape` | Close modal / Clear selection |

---

## Support

For issues or feature requests, contact your administrator or visit the project repository.

---

*Parlevel Icon Matching Tool v1.0.0*

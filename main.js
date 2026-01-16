const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');

// Android density multipliers
const ANDROID_DENSITIES = {
  'mdpi': { folder: 'drawable-mdpi', multiplier: 1 },
  'hdpi': { folder: 'drawable-hdpi', multiplier: 1.5 },
  'xhdpi': { folder: 'drawable-xhdpi', multiplier: 2 },
  'xxhdpi': { folder: 'drawable-xxhdpi', multiplier: 3 },
  'xxxhdpi': { folder: 'drawable-xxxhdpi', multiplier: 4 }
};

// iOS scale multipliers
const IOS_SCALES = {
  '1x': 1,
  '2x': 2,
  '3x': 3
};

/**
 * Apply a color to an SVG by modifying its content
 * @param {string} svgContent - The SVG file content
 * @param {string} hexColor - The color to apply (e.g., '#FF0000')
 * @param {string} mode - 'outline' (stroke only) or 'solid' (fill and stroke)
 */
function applySvgColor(svgContent, hexColor, mode = 'outline') {
  if (!hexColor || hexColor === '#000000') {
    // Default black - no modification needed for most icons
    return svgContent;
  }

  let styleTag;

  if (mode === 'solid') {
    // Solid mode: Fill entire icon with color (fills shapes + outlines)
    styleTag = `<style>path, circle, rect, polygon, line, polyline, ellipse { fill: ${hexColor} !important; stroke: ${hexColor} !important; }</style>`;
  } else {
    // Outline mode (default): Only color the strokes/outlines, preserve transparency
    styleTag = `<style>path, circle, rect, polygon, line, polyline, ellipse { stroke: ${hexColor} !important; }</style>`;
  }

  // Insert style after opening svg tag
  const svgTagEnd = svgContent.indexOf('>');
  if (svgTagEnd !== -1) {
    return svgContent.slice(0, svgTagEnd + 1) + styleTag + svgContent.slice(svgTagEnd + 1);
  }

  return svgContent;
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Parlevel Icon Matching Tool'
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================
// IPC HANDLERS
// ============================================

// Handle folder selection dialog
ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Output Folder for Generated PNGs'
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

// Handle PNG generation
ipcMain.handle('generate-pngs', async (event, { mappings, outputPath, basePath }) => {
  const results = {
    success: [],
    errors: [],
    androidCount: 0,
    iosCount: 0
  };

  try {
    // Process Android mappings
    const androidMappings = Object.entries(mappings.android || {});
    for (const [legacyName, mapping] of androidMappings) {
      try {
        await generateAndroidIcon(legacyName, mapping, outputPath, basePath, results);
        results.androidCount++;
      } catch (err) {
        results.errors.push(`Android/${legacyName}: ${err.message}`);
      }
    }

    // Process iOS mappings
    const iosMappings = Object.entries(mappings.ios || {});
    for (const [legacyName, mapping] of iosMappings) {
      try {
        await generateIosIcon(legacyName, mapping, outputPath, basePath, results);
        results.iosCount++;
      } catch (err) {
        results.errors.push(`iOS/${legacyName}: ${err.message}`);
      }
    }

    results.success.push(`Generated ${results.androidCount} Android icons, ${results.iosCount} iOS icons`);
  } catch (err) {
    results.errors.push(`General error: ${err.message}`);
  }

  return results;
});

// Generate Android icon at selected densities
async function generateAndroidIcon(legacyName, mapping, outputPath, basePath, results) {
  const svgPath = path.resolve(basePath, mapping.streamlinePath);

  // Check if file exists
  if (!await fs.pathExists(svgPath)) {
    throw new Error(`SVG not found: ${svgPath}`);
  }

  // Check if it's an SVG
  if (!svgPath.toLowerCase().endsWith('.svg')) {
    throw new Error(`Not an SVG file: ${svgPath}`);
  }

  // Read SVG content and apply color if specified
  let svgContent = await fs.readFile(svgPath, 'utf-8');
  const outputColor = mapping.outputColor || '#000000';
  const colorMode = mapping.colorMode || 'outline';
  svgContent = applySvgColor(svgContent, outputColor, colorMode);
  const svgBuffer = Buffer.from(svgContent);

  // Use stored base dimensions from legacy icon, fall back to SVG metadata
  let baseWidth = mapping.baseSizeWidth;
  let baseHeight = mapping.baseSizeHeight;

  if (!baseWidth || !baseHeight) {
    // Fallback to SVG metadata if no stored dimensions
    const metadata = await sharp(svgBuffer).metadata();
    baseWidth = metadata.width || 24;
    baseHeight = metadata.height || 24;
  }

  // Get selected sizes (if any specified)
  const selectedSizes = mapping.selectedSizes || [];

  // Determine which densities to generate
  const densitiesToGenerate = selectedSizes.length > 0
    ? Object.entries(ANDROID_DENSITIES).filter(([key]) => selectedSizes.includes(key))
    : Object.entries(ANDROID_DENSITIES); // Generate all if none specified

  // Generate for each selected density
  for (const [density, config] of densitiesToGenerate) {
    const width = Math.round(baseWidth * config.multiplier);
    const height = Math.round(baseHeight * config.multiplier);

    const outputDir = path.join(outputPath, 'android', config.folder);
    const outputFile = path.join(outputDir, `${legacyName}.png`);

    await fs.ensureDir(outputDir);

    await sharp(svgBuffer)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputFile);
  }

  results.success.push(`Android: ${legacyName} (${densitiesToGenerate.length} sizes)`);
}

// Generate iOS icon with imageset
async function generateIosIcon(legacyName, mapping, outputPath, basePath, results) {
  const svgPath = path.resolve(basePath, mapping.streamlinePath);

  // Check if file exists
  if (!await fs.pathExists(svgPath)) {
    throw new Error(`SVG not found: ${svgPath}`);
  }

  // Check if it's an SVG
  if (!svgPath.toLowerCase().endsWith('.svg')) {
    throw new Error(`Not an SVG file: ${svgPath}`);
  }

  // Read SVG content and apply color if specified
  let svgContent = await fs.readFile(svgPath, 'utf-8');
  const outputColor = mapping.outputColor || '#000000';
  const colorMode = mapping.colorMode || 'outline';
  svgContent = applySvgColor(svgContent, outputColor, colorMode);
  const svgBuffer = Buffer.from(svgContent);

  // Use stored base dimensions from legacy icon, fall back to SVG metadata
  let baseWidth = mapping.baseSizeWidth;
  let baseHeight = mapping.baseSizeHeight;

  if (!baseWidth || !baseHeight) {
    // Fallback to SVG metadata if no stored dimensions
    const metadata = await sharp(svgBuffer).metadata();
    baseWidth = metadata.width || 24;
    baseHeight = metadata.height || 24;
  }

  // Create imageset folder
  const imagesetDir = path.join(outputPath, 'ios', `${legacyName}.imageset`);
  await fs.ensureDir(imagesetDir);

  const images = [];

  // Generate for each scale
  for (const [scale, multiplier] of Object.entries(IOS_SCALES)) {
    const width = Math.round(baseWidth * multiplier);
    const height = Math.round(baseHeight * multiplier);

    const filename = scale === '1x'
      ? `${legacyName}.png`
      : `${legacyName}@${scale}.png`;

    const outputFile = path.join(imagesetDir, filename);

    await sharp(svgBuffer)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputFile);

    images.push({
      idiom: 'universal',
      filename: filename,
      scale: scale
    });
  }

  // Write Contents.json
  const contentsJson = {
    images: images,
    info: {
      version: 1,
      author: 'icon-matching-tool'
    }
  };

  await fs.writeJson(
    path.join(imagesetDir, 'Contents.json'),
    contentsJson,
    { spaces: 2 }
  );

  results.success.push(`iOS: ${legacyName}`);
}

// Get the app's base path for resolving relative paths
ipcMain.handle('get-base-path', () => {
  return __dirname;
});

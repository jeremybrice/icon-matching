/**
 * Icon Manifest Generator
 *
 * Scans icon folders and generates JavaScript arrays/objects
 * for embedding in the Icon Matching Tool (index.html)
 *
 * Usage: node generate-manifests.js
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// ============================================
// Android Icons
// ============================================
function generateAndroidManifest() {
    const dir = path.join(BASE_DIR, 'parlevel_stockapp_android_assets', 'drawable-mdpi');

    if (!fs.existsSync(dir)) {
        console.error(`Android directory not found: ${dir}`);
        return [];
    }

    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.png'))
        .sort();

    return files.map(filename => ({
        name: filename.replace('.png', ''),
        filename: filename,
        path: `parlevel_stockapp_android_assets/drawable-mdpi/${filename}`
    }));
}

// ============================================
// iOS Icons
// ============================================
function generateIOSManifest() {
    const dir = path.join(BASE_DIR, 'parlevel_stockapp_ios_assets');

    if (!fs.existsSync(dir)) {
        console.error(`iOS directory not found: ${dir}`);
        return [];
    }

    const items = fs.readdirSync(dir);
    const imagesets = items.filter(item => {
        const itemPath = path.join(dir, item);
        return item.endsWith('.imageset') && fs.statSync(itemPath).isDirectory();
    }).sort();

    const result = [];

    for (const imageset of imagesets) {
        const contentsPath = path.join(dir, imageset, 'Contents.json');

        if (!fs.existsSync(contentsPath)) {
            console.warn(`No Contents.json found in ${imageset}`);
            continue;
        }

        try {
            const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
            const images = contents.images || [];

            // Prefer @2x, then @3x, then @1x, then any
            let selectedImage = images.find(i => i.scale === '2x' && i.filename);
            if (!selectedImage) selectedImage = images.find(i => i.scale === '3x' && i.filename);
            if (!selectedImage) selectedImage = images.find(i => i.scale === '1x' && i.filename);
            if (!selectedImage) selectedImage = images.find(i => i.filename);

            if (selectedImage && selectedImage.filename) {
                result.push({
                    name: imageset.replace('.imageset', ''),
                    imageset: imageset,
                    filename: selectedImage.filename,
                    path: `parlevel_stockapp_ios_assets/${imageset}/${selectedImage.filename}`
                });
            } else {
                console.warn(`No valid image found in ${imageset}`);
            }
        } catch (e) {
            console.warn(`Failed to parse ${contentsPath}: ${e.message}`);
        }
    }

    // Also scan nested folders (Fetch, Invoice, TechTicket, PriceChanges, ReturnedInventory)
    const nestedFolders = ['Fetch', 'Invoice', 'TechTicket', 'PriceChanges', 'ReturnedInventory'];

    for (const folder of nestedFolders) {
        const nestedDir = path.join(dir, folder);
        if (fs.existsSync(nestedDir)) {
            scanNestedIOSFolder(nestedDir, `parlevel_stockapp_ios_assets/${folder}`, result);
        }
    }

    return result;
}

function scanNestedIOSFolder(dir, relativePath, result) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            if (item.endsWith('.imageset')) {
                const contentsPath = path.join(itemPath, 'Contents.json');

                if (fs.existsSync(contentsPath)) {
                    try {
                        const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
                        const images = contents.images || [];

                        let selectedImage = images.find(i => i.scale === '2x' && i.filename);
                        if (!selectedImage) selectedImage = images.find(i => i.scale === '3x' && i.filename);
                        if (!selectedImage) selectedImage = images.find(i => i.scale === '1x' && i.filename);
                        if (!selectedImage) selectedImage = images.find(i => i.filename);

                        if (selectedImage && selectedImage.filename) {
                            result.push({
                                name: item.replace('.imageset', ''),
                                imageset: item,
                                filename: selectedImage.filename,
                                path: `${relativePath}/${item}/${selectedImage.filename}`
                            });
                        }
                    } catch (e) {
                        // Skip problematic files
                    }
                }
            } else {
                // Recurse into subdirectories (like Images/, Colors/)
                scanNestedIOSFolder(itemPath, `${relativePath}/${item}`, result);
            }
        }
    }
}

// ============================================
// Streamline Icons
// ============================================
function generateStreamlineIndex() {
    const baseDir = path.join(BASE_DIR, 'streamline-ultimate-regular');

    if (!fs.existsSync(baseDir)) {
        console.error(`Streamline directory not found: ${baseDir}`);
        return {};
    }

    const index = {};
    let totalIcons = 0;

    const categories = fs.readdirSync(baseDir)
        .filter(item => {
            const itemPath = path.join(baseDir, item);
            return fs.statSync(itemPath).isDirectory();
        })
        .sort();

    for (const category of categories) {
        const categoryPath = path.join(baseDir, category);
        index[category] = {};

        const subcategories = fs.readdirSync(categoryPath)
            .filter(item => {
                const itemPath = path.join(categoryPath, item);
                return fs.statSync(itemPath).isDirectory();
            })
            .sort();

        for (const subcategory of subcategories) {
            const subcategoryPath = path.join(categoryPath, subcategory);

            const svgFiles = fs.readdirSync(subcategoryPath)
                .filter(f => f.endsWith('.svg'))
                .sort();

            if (svgFiles.length > 0) {
                index[category][subcategory] = svgFiles.map(filename => ({
                    name: filename.replace('.svg', ''),
                    filename: filename,
                    path: `streamline-ultimate-regular/${category}/${subcategory}/${filename}`
                }));
                totalIcons += svgFiles.length;
            }
        }
    }

    console.log(`Found ${totalIcons} Streamline icons across ${categories.length} categories`);
    return index;
}

// ============================================
// Main
// ============================================
function main() {
    console.log('Generating icon manifests...\n');

    // Generate manifests
    const androidIcons = generateAndroidManifest();
    console.log(`Android icons: ${androidIcons.length}`);

    const iosIcons = generateIOSManifest();
    console.log(`iOS icons: ${iosIcons.length}`);

    const streamlineIndex = generateStreamlineIndex();
    const categoryCount = Object.keys(streamlineIndex).length;
    console.log(`Streamline categories: ${categoryCount}`);

    // Output to file
    const output = `// Generated by generate-manifests.js on ${new Date().toISOString()}
// Copy this content into index.html

const ANDROID_ICONS = ${JSON.stringify(androidIcons, null, 2)};

const IOS_ICONS = ${JSON.stringify(iosIcons, null, 2)};

const STREAMLINE_INDEX = ${JSON.stringify(streamlineIndex, null, 2)};
`;

    const outputPath = path.join(BASE_DIR, 'icon-manifests.js');
    fs.writeFileSync(outputPath, output, 'utf8');

    console.log(`\nManifests written to: ${outputPath}`);
    console.log('\nSummary:');
    console.log(`  - Android icons: ${androidIcons.length}`);
    console.log(`  - iOS icons: ${iosIcons.length}`);
    console.log(`  - Streamline categories: ${categoryCount}`);
}

main();

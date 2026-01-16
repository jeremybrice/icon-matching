const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Select output folder dialog
  selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),

  // Generate PNGs
  generatePngs: (mappings, outputPath, basePath) =>
    ipcRenderer.invoke('generate-pngs', { mappings, outputPath, basePath }),

  // Get the app's base path
  getBasePath: () => ipcRenderer.invoke('get-base-path'),

  // Check if running in Electron
  isElectron: true
});

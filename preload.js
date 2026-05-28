const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exportVault: (data) => ipcRenderer.invoke('export-vault', data),
  importVault: () => ipcRenderer.invoke('import-vault')
});

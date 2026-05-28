const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f0f13',
      symbolColor: '#ffffff'
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the angular app build output
  mainWindow.loadFile(path.join(__dirname, 'dist/password-manager/browser/index.html'));

  // Open DevTools automatically to help debug
  mainWindow.webContents.openDevTools();

  mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// IPC Handlers for Export and Import
ipcMain.handle('export-vault', async (event, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Password Vault',
    defaultPath: 'password-vault.json',
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });

  if (filePath) {
    try {
      await fs.writeFile(filePath, data, 'utf8');
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'User canceled' };
});

ipcMain.handle('import-vault', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Password Vault',
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });

  if (!canceled && filePaths.length > 0) {
    try {
      const data = await fs.readFile(filePaths[0], 'utf8');
      return { success: true, data };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'User canceled' };
});

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

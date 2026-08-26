const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'GASCONS - Gestion & Contrôle Carburant',
    backgroundColor: '#0f172a', // slate-900
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    // In production package, load dist/index.html
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      mainWindow.loadURL('http://localhost:3000');
    }
  }

  // Windows Menu Configuration
  const menuTemplate = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Imprimer la page courante',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.print(),
        },
        {
          label: 'Actualiser l\'application',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload(),
        },
        { type: 'separator' },
        {
          label: 'Quitter GASCONS',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'resetZoom', label: 'Taille normale (100%)' },
        { role: 'zoomIn', label: 'Agrandir (+)' },
        { role: 'zoomOut', label: 'Réduire (-)' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein Écran' },
      ],
    },
    {
      label: 'Aide & Support',
      submenu: [
        {
          label: 'Documentation & Guide d\'utilisation',
          click: () => shell.openExternal('https://github.com'),
        },
        {
          label: 'À propos de GASCONS Windows',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos de GASCONS',
              message: 'GASCONS v1.0.0 (Édition Windows)',
              detail: 'Application Desktop autonome de Gestion & Contrôle des Consommations de Carburant, Suivi des Cuves et Flotte Véhicules/Engins.\n\nPrise en charge hors-ligne & Impression directe.',
              buttons: ['Fermer'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

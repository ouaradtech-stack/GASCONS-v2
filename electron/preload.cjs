const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  platform: process.platform,
  printVoucher: () => window.print(),
  getVersion: () => '1.0.0',
});

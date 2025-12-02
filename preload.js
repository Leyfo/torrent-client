const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('torrentAPI', {
  addMagnet: (magnet) => ipcRenderer.invoke('add-magnet', magnet),
  getTorrents: () => ipcRenderer.invoke('get-torrents'),
  pauseTorrent: (infoHash) => ipcRenderer.invoke('pause-torrent', infoHash),
  resumeTorrent: (infoHash) => ipcRenderer.invoke('resume-torrent', infoHash),
});

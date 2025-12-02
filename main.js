const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WebTorrent = require('webtorrent');

let mainWindow;
const client = new WebTorrent();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('add-magnet', async (event, magnetURI) => {
  return new Promise((resolve, reject) => {
    const torrent = client.add(magnetURI, { path: path.join(__dirname, 'downloads') });
    torrent.on('done', () => {
      console.log(`Download finalizado: ${torrent.name}`);
    });
    resolve(torrent.infoHash);
  });
});

ipcMain.handle('get-torrents', () => {
  return client.torrents.map(t => ({
    name: t.name,
    progress: (t.progress * 100).toFixed(2),
    infoHash: t.infoHash,
    paused: t.paused || false,
  }));
});

ipcMain.handle('pause-torrent', (event, infoHash) => {
  const torrent = client.get(infoHash);
  if (torrent) {
    torrent.pause(); // WebTorrent permite pausar
    torrent.paused = true;
  }
});

ipcMain.handle('resume-torrent', (event, infoHash) => {
  const torrent = client.get(infoHash);
  if (torrent) {
    torrent.resume();
    torrent.paused = false;
  }
});

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const WebTorrent = require('webtorrent');

let mainWindow;
const client = new WebTorrent();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Adicionar torrent via magnet link
ipcMain.handle('add-magnet', async (event, magnetURI) => {
  return new Promise((resolve, reject) => {
    const torrent = client.add(magnetURI, { path: path.join(__dirname, 'downloads') });
    torrent.on('done', () => console.log(`Download completo: ${torrent.name}`));
    resolve(torrent.infoHash);
  });
});

// Criar torrent a partir de arquivo local
ipcMain.handle('add-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections']
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const files = result.filePaths;

  return new Promise(resolve => {
    client.seed(files, torrent => {
      console.log("Seed iniciado:", torrent.magnetURI);
      resolve({
        name: torrent.name,
        magnet: torrent.magnetURI,
        infoHash: torrent.infoHash
      });
    });
  });
});


// Obter torrents e progresso
ipcMain.handle('get-torrents', () => {
  return client.torrents.map(t => ({
    name: t.name,
    progress: (t.progress * 100).toFixed(2),
    infoHash: t.infoHash,
    paused: t.paused || false,
    files: t.files.map(f => f.name)
  }));
});

// Pausar torrent
ipcMain.handle('pause-torrent', (event, infoHash) => {
  const torrent = client.get(infoHash);
  if (torrent) {
    torrent.pause();
    torrent.paused = true;
  }
});

// Continuar torrent
ipcMain.handle('resume-torrent', (event, infoHash) => {
  const torrent = client.get(infoHash);
  if (torrent) {
    torrent.resume();
    torrent.paused = false;
  }
});

// Obter streaming URL
ipcMain.handle('get-stream-url', (event, infoHash, fileIndex) => {
  const torrent = client.get(infoHash);
  if (!torrent) return null;

  const file = torrent.files[fileIndex];
  if (!file) return null;

  // Retorna path absoluto do arquivo (WebTorrent permite streaming direto)
  return file.createReadStream();
});

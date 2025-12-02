const magnetInput = document.getElementById('magnetInput');
const addMagnetBtn = document.getElementById('addMagnetBtn');
const addFileBtn = document.getElementById('addFileBtn');
const torrentList = document.getElementById('torrentList');

addMagnetBtn.addEventListener('click', async () => {
  const magnet = magnetInput.value;
  if (!magnet) return alert("Insira um magnet link!");
  await window.torrentAPI.addMagnet(magnet);
  magnetInput.value = '';
  updateList();
});

addFileBtn.addEventListener('click', async () => {
  const data = await window.torrentAPI.addFile();
  if (data) {
    alert("Torrent criado!\nMagnet:\n" + data.magnet);
    navigator.clipboard.writeText(data.magnet);
  }
  updateList();
});


async function updateList() {
  const torrents = await window.torrentAPI.getTorrents();
  torrentList.innerHTML = '';
  torrents.forEach((t, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${t.name}</strong>
      <div class="progress-container">
        <div class="progress-bar" style="width:${t.progress}%"></div>
      </div>
      <p>${t.progress}% - ${t.paused ? 'Pausado' : 'Baixando/Semeando'}</p>
      <div class="file-list">${t.files.join('<br>')}</div>
    `;

    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = t.paused ? 'Continuar' : 'Pausar';
    pauseBtn.onclick = async () => {
      if (t.paused) await window.torrentAPI.resumeTorrent(t.infoHash);
      else await window.torrentAPI.pauseTorrent(t.infoHash);
      updateList();
    };

    li.appendChild(pauseBtn);

    // Botão de streaming (abre vídeo/áudio local no player)
    const streamBtn = document.createElement('button');
    streamBtn.textContent = 'Stream';
    streamBtn.onclick = () => {
      const firstFile = t.files[0];
      const videoWin = window.open('', '_blank', 'width=800,height=600');
      videoWin.document.write(`
        <video src="downloads/${firstFile}" controls autoplay style="width:100%; height:100%"></video>
      `);
    };

    li.appendChild(streamBtn);

    torrentList.appendChild(li);
    const copyBtn = document.createElement('button');
copyBtn.textContent = "Copiar Magnet";
copyBtn.onclick = () => {
  navigator.clipboard.writeText(`magnet:?xt=urn:btih:${t.infoHash}`);
  alert("Magnet copiado!");
};
li.appendChild(copyBtn);

  });
}

setInterval(updateList, 3000);
updateList();

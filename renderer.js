const magnetInput = document.getElementById('magnetInput');
const addBtn = document.getElementById('addBtn');
const torrentList = document.getElementById('torrentList');

addBtn.addEventListener('click', async () => {
  const magnet = magnetInput.value;
  if (!magnet) return alert("Insira um magnet link!");
  await window.torrentAPI.addMagnet(magnet);
  magnetInput.value = '';
  updateList();
});

async function updateList() {
  const torrents = await window.torrentAPI.getTorrents();
  torrentList.innerHTML = '';
  torrents.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.name} - ${t.progress}%`;

    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = t.paused ? 'Continuar' : 'Pausar';
    pauseBtn.onclick = async () => {
      if (t.paused) {
        await window.torrentAPI.resumeTorrent(t.infoHash);
      } else {
        await window.torrentAPI.pauseTorrent(t.infoHash);
      }
      updateList();
    };

    li.appendChild(pauseBtn);
    torrentList.appendChild(li);
  });
}

// Atualiza a lista a cada 5s
setInterval(updateList, 5000);
updateList();

const { ipcRenderer } = require('electron');

document.getElementById('select-folder').addEventListener('click', async () => {
  const folderPath = await ipcRenderer.invoke('select-destination');
  document.getElementById('folder-path').innerText = folderPath;
});

document.getElementById('download').addEventListener('click', () => {
  const url = document.getElementById('url').value;
  const savePath = document.getElementById('folder-path').innerText;
  if (url && savePath) {
    ipcRenderer.invoke('download-audio', url, savePath);
  } else {
    document.getElementById('status').innerText = 'Por favor, insira um URL válido e selecione uma pasta';
  }
});

ipcRenderer.on('download-progress', (event, progress) => {
  const percentage = Math.round(progress.percent * 100); 
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = `${percentage}%`;
  progressBar.innerText = `${percentage}%`; 
  document.getElementById('download-stats').innerText = `
    Velocidade: ${(progress.currentKbps / 1024).toFixed(2)} MB/s
    Baixado: ${(progress.transferred /1024 / 1024).toFixed(2)} MB
    Total: ${(progress.total /1024 / 1024).toFixed(2)} MB
    Tempo: ${progress.timemark}
  `;
});

ipcRenderer.on('download-complete', (event, message) => {
  document.getElementById('status').innerText = message;
  document.getElementById('progress-bar').style.width = '0';
  document.getElementById('progress-bar').innerText = ''; 
});

ipcRenderer.on('download-error', (event, message) => {
  document.getElementById('status').innerText = `Erro: ${message}`;
  document.getElementById('progress-bar').style.width = '0';
  document.getElementById('progress-bar').innerText = ''; 
});

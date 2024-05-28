const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

ipcMain.handle('download-audio', async (event, url, savePath) => {
  try {
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    ffmpeg(ytdl(url, { format: audioFormat }))
      .audioBitrate(audioFormat.audioBitrate)
      .save(path.join(savePath, `${info.videoDetails.title}.mp3`))
      .on('progress', (progress) => {
        event.sender.send('download-progress', progress);
      })
      .on('end', () => {
        event.sender.send('download-complete', 'Download completo!');
      });
  } catch (error) {
    event.sender.send('download-error', error.message);
  }
});

ipcMain.handle('select-destination', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

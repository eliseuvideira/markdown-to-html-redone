const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const windows = new Set();

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    return false;
  }
  app.quit();
});

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) {
    createWindow();
  }
});

const getFileFromUser = (win) => {
  const files = dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
    ],
  });

  if (files) {
    openFile(win, files[0]);
  }
};

const openFile = (win, file) => {
  const content = fs.readFileSync(file).toString();
  win.webContents.send('file-opened', file, content);
};

const createWindow = () => {
  let x, y;
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    const [currentX, currentY] = currentWindow.getPosition();
    x = currentX + 10;
    y = currentY + 10;
  }

  let win = new BrowserWindow({ x, y, show: false });

  win.loadURL(`file://${__dirname}/index.html`);

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    windows.delete(win);
    win = null;
  });

  windows.add(win);
  return win;
};

// Exports

module.exports = {
  getFileFromUser,
  createWindow,
};

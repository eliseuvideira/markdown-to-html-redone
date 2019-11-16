const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const windows = new Set();

// app Events

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

app.on('will-finish-launching', () => {
  app.on('open-file', (event, file) => {
    const win = createWindow();
    win.once('ready-to-show', () => {
      openFile(win, file);
    });
  });
});

// Function Definitions

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
  app.addRecentDocument(file);
  win.setRepresentedFilename(file);
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

const saveHTML = (win, content) => {
  const file = dialog.showSaveDialog(win, {
    title: 'Save HTML',
    defaultPath: app.getPath('documents'),
    filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }],
  });
  if (!file) {
    return;
  }
  fs.writeFileSync(file, content);
};

const saveMarkdown = (win, file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(win, {
      title: 'Save Markdown',
      defaultPath: app.getPath('documents'),
      filter: [{ name: 'Markdown Files', extensions: ['md', 'markdown'] }],
    });
  }
  if (!file) {
    return;
  }
  fs.writeFileSync(file, content);
  openFile(win, file);
};

// Exports

module.exports = {
  getFileFromUser,
  createWindow,
  saveHTML,
  saveMarkdown,
  openFile,
};

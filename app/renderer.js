const marked = require('marked');
const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main.js');
const path = require('path');

const win = remote.getCurrentWindow();

let filePath = null;
let originalContent = '';

const viewMarkdown = document.querySelector('#markdown');
const viewHTML = document.querySelector('#html');
const btnNewFile = document.querySelector('#new-file');
const btnOpenFile = document.querySelector('#open-file');
const btnSaveMarkdown = document.querySelector('#save-markdown');
const btnRevert = document.querySelector('#revert');
const btnSaveHTML = document.querySelector('#save-html');
const btnShowFile = document.querySelector('#show-file');
const btnOpenInDefault = document.querySelector('#open-in-default');

// Function Definitions

const markdownToHTML = (markdown) => {
  return marked(markdown, { sanitize: true });
};

const renderMarkdownToHTML = (markdown) => {
  viewHTML.innerHTML = markdownToHTML(markdown);
};

const updateUserInterface = (isEdited) => {
  let title = 'Fire Sale';
  if (filePath) {
    title = `${path.basename(filePath)} - ${title}`;
  }
  if (isEdited) {
    title = `${title} (Edited)`;
  }
  win.setTitle(title);
  win.setDocumentEdited(isEdited);

  btnSaveMarkdown.disabled = !isEdited;
  btnRevert.disabled = !isEdited;
};

const getDraggedFile = (event) => event.dataTransfer.items[0];

const getDroppedFile = (event) => event.dataTransfer.files[0];

const fileTypeIsSupported = (file) => {
  return ['text/plain', 'text/markdown'].includes(file.type);
};

const renderFile = (file, content) => {
  filePath = file;
  originalContent = content;

  viewMarkdown.value = content;
  renderMarkdownToHTML(content);

  updateUserInterface(false);
};

// ipc Events

ipcRenderer.on('file-opened', (event, file, content) => {
  if (win.isDocumentEdited()) {
    const result = remote.dialog.showMessageBox(win, {
      type: 'warning',
      title: 'Overwrite Current Unsaved Changes?',
      message:
        'Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?',
      buttons: ['Yes', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
    });

    if (result === 1) {
      return;
    }
  }

  renderFile(file, content);
});

ipcRenderer.on('file-changed', (event, file, content) => {
  const result = remote.dialog.showMessageBox(win, {
    type: 'warning',
    title: 'Overwrite Current Unsaved Changes?',
    message: 'Another application has changed this file. Load changes?',
    buttons: ['Yes', 'Cancel'],
    defaultId: 0,
    cancelId: 1,
  });
  if (result === 1) {
    return;
  }
  renderFile(file, content);
});

ipcRenderer.on('save-markdown', () => {
  mainProcess.saveMarkdown(win, filePath, viewMarkdown.value);
});

ipcRenderer.on('save-html', () => {
  mainProcess.saveHTML(win, viewHTML.innerHTML);
});

// Adding Event Listeners

document.addEventListener('dragstart', (event) => event.preventDefault());
document.addEventListener('dragover', (event) => event.preventDefault());
document.addEventListener('dragleave', (event) => event.preventDefault());
document.addEventListener('drop', (event) => event.preventDefault());

viewMarkdown.addEventListener('keyup', (event) => {
  const currentContent = event.target.value;
  renderMarkdownToHTML(currentContent);

  updateUserInterface(currentContent !== originalContent);
});

btnNewFile.addEventListener('click', () => {
  mainProcess.createWindow();
});

btnOpenFile.addEventListener('click', () => {
  mainProcess.getFileFromUser(win);
});

btnSaveHTML.addEventListener('click', () => {
  const content = viewHTML.innerHTML;
  mainProcess.saveHTML(win, content);
});

btnSaveMarkdown.addEventListener('click', () => {
  const content = viewMarkdown.value;
  mainProcess.saveMarkdown(win, filePath, content);
});

btnRevert.addEventListener('click', () => {
  viewMarkdown.value = originalContent;
  renderMarkdownToHTML(originalContent);
});

viewMarkdown.addEventListener('dragover', (event) => {
  const file = getDraggedFile(event);
  if (fileTypeIsSupported(file)) {
    viewMarkdown.classList.add('drag-over');
  } else {
    viewMarkdown.classList.add('drag-error');
  }
});

viewMarkdown.addEventListener('dragleave', () => {
  viewMarkdown.classList.remove('drag-over');
  viewMarkdown.classList.remove('drag-error');
});

viewMarkdown.addEventListener('drop', (event) => {
  const file = getDroppedFile(event);
  if (fileTypeIsSupported(file)) {
    mainProcess.openFile(win, file.path);
  } else {
    alert('That file type is not supported');
  }
  viewMarkdown.classList.remove('drag-over');
  viewMarkdown.classList.remove('drag-error');
});

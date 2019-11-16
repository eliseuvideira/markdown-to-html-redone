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

// ipc Events

ipcRenderer.on('file-opened', (event, file, content) => {
  filePath = file;
  originalContent = content;

  viewMarkdown.value = content;
  renderMarkdownToHTML(content);

  updateUserInterface(false);
});

// Adding Event Listeners

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

const marked = require('marked');

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

// Adding Event Listeners

viewMarkdown.addEventListener('keyup', (event) => {
  const currentContent = event.target.value;
  renderMarkdownToHTML(currentContent);
});

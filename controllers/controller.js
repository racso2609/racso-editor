const {ipcRenderer} = require('electron');
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
  let elements = {
    fileName: document.getElementById('file-name'),
    openFileBtn: document.getElementById('open-file-btn'),
    createFileBtn: document.getElementById('create-file-btn'),
    fileTextarea: document.getElementById('text-area'),
    saveFileBtn: document.getElementById('save-file-btn'),
    closeFileBtn: document.getElementById('close-file-btn'),
    tabsSection: document.getElementById('tabs'),
  };
  let fileOpen = 'Not selected';
  let {
    fileName,
    openFileBtn,
    createFileBtn,
    fileTextarea,
    saveFileBtn,
    closeFileBtn,
    tabsSection,
  } = elements;
  const getFilePath = (filePath, length) => {
    return filePath.length <= length
      ? filePath
      : '...' + filePath.slice(filePath.length - length, filePath.length);
  };

  const selectActive = filePath => {
    let tabs = document.getElementsByClassName('tab-item');
    if (!tabs.length) {
      return;
    }
    for (let tab of tabs) {
      tab.removeAttribute('class');
      tab.setAttribute('class', 'tab-item');
    }
    document
      .getElementById(filePath)
      .setAttribute('class', 'tab-item tab-active');
  };
  const handleDocumentChange = (filePath, content = '', disable = false) => {
    fileName.innerHTML = getFilePath(filePath, 30);

    if (!disable) {
      fileTextarea.removeAttribute('disabled');
    } else {
      fileTextarea.setAttribute('disabled', true);
    }
    fileTextarea.value = content;
    fileTextarea.focus();
  };
  //emmit events
  openFileBtn.addEventListener('click', () => {
    ipcRenderer.send('open-document-triggered');
  });
  createFileBtn.addEventListener('click', () => {
    ipcRenderer.send('create-document-triggered');
  });

  fileTextarea.addEventListener('input', e => {
    ipcRenderer.send('content-update', {
      filePath: fileOpen,
      content: e.target.value,
    });
  });

  saveFileBtn.addEventListener('click', () => {
    if (fileName.innerHTML !== 'Not selected') {
      ipcRenderer.send('file-content-updated', {filePath: fileOpen});
    }
  });
  closeFileBtn.addEventListener('click', () => {
    ipcRenderer.send('request-document-close', fileOpen);
  });
  //capture event
  ipcRenderer.on('document-closed', (_, filePath) => {
    let removedTab = document.getElementById(filePath);
    tabsSection.removeChild(removedTab);

    handleDocumentChange('Not selected', '', true);
  });
  ipcRenderer.on('document-opened', (_, {filePath, content}) => {
    handleDocumentChange(filePath, content);
    fileOpen = filePath;
    selectActive(filePath);
  });
  ipcRenderer.on('document-created', (_, filePath) => {
    handleDocumentChange(filePath);
  });

  ipcRenderer.on('changed-tab', (_, filePath) => {
    selectActive(filePath);
  });

  ipcRenderer.on('created-tab', (_, filePath) => {
    let element = document.createElement('div');
    element.setAttribute('class', 'tab-item');
    element.id = filePath;
    element.onclick = () => {
      ipcRenderer.send('change-tab', filePath);
    };
    let p = document.createElement('p');
    p.setAttribute('class', 'tab-text');
    p.appendChild(document.createTextNode(path.parse(filePath).base));
    element.appendChild(p);
    tabsSection.appendChild(element);
  });
});

const {ipcRenderer} = require('electron');
const path = require('path');
const {MultiCompiler} = require('webpack');
const {defaultKeys,commandModeKeys} = require('../editorConfig/shortKeysList');
//let {default} = shortKeys;

window.addEventListener('DOMContentLoaded', () => {
  var myCodeMirror = CodeMirror(document.body, {
    mode: 'javascript',
    autocorrect: true,
    lineNumbers: true,
    disableInput: true,
    keyMap: defaultKeys,
    extraKeys: commandModeKeys,
    showCursorWhenSelecting: true,
    
});

  let elements = {
    fileName: document.getElementById('file-name'),
    openFileBtn: document.getElementById('open-file-btn'),
    createFileBtn: document.getElementById('create-file-btn'),
    saveFileBtn: document.getElementById('save-file-btn'),
    texEditor: myCodeMirror,
    closeFileBtn: document.getElementById('close-file-btn'),
    tabsSection: document.getElementById('tabs'),
  };
  let fileOpen = 'Not selected';
  let {
    fileName,
    openFileBtn,
    createFileBtn,
    saveFileBtn,
    closeFileBtn,
    tabsSection,
    texEditor,
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
    texEditor.setOption('disableInput', disable);
    texEditor.setValue(content);
  };
  //emmit events
texEditor.on('change',()=>{
//console.log('cambie')
//ipcRenderer.send('content-update', {
      //filePath: fileOpen,
      //content: texEditor.getValue(),
    //});
})
  openFileBtn.addEventListener('click', () => {
    ipcRenderer.send('open-document-triggered');
  });
  createFileBtn.addEventListener('click', () => {
    ipcRenderer.send('create-document-triggered');
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
  ipcRenderer.on('document-closed', (_, {filePath, tabsCount, nextTab}) => {
    let removedTab = document.getElementById(filePath);
    tabsSection.removeChild(removedTab);
    if (!tabsCount) {
      handleDocumentChange('Not selected', '', true);
    } else {
      handleDocumentChange(nextTab.filePath, nextTab.content);
    }
  });
ipcRenderer.on('changed-vim-mode',(_)=>{
 myCodeMirror.setOption('extraKeys', myCodeMirror.actualKeys)
})
  ipcRenderer.on('document-opened', (_, {filePath, content}) => {
    handleDocumentChange(filePath, content);
//console.log(content)
    fileOpen = filePath;
    selectActive(filePath);
  });
  ipcRenderer.on('document-created', (_, filePath) => {
    handleDocumentChange(filePath);
  });

  ipcRenderer.on('changed-tab', (_, filePath) => {
//handleDocumentChange(filePath,content)
myCodeMirror.on('change')
selectActive(filePath);

  });

  ipcRenderer.on('created-tab', (_, filePath) => {
    let element = document.createElement('div');
    element.setAttribute('class', 'tab-item');
    element.id = filePath;
    element.onclick = () => {
//myCodeMirror.off('change',()=>console.log('hola'))
      ipcRenderer.send('change-tab', filePath);
    };
    let p = document.createElement('p');
    p.setAttribute('class', 'tab-text');
    p.appendChild(document.createTextNode(path.parse(filePath).base));
    element.appendChild(p);
    tabsSection.appendChild(element);
  });
});

const {BrowserWindow, app, ipcMain, dialog, Notification} = require('electron');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const {extensions} = require('./config');
const Tab = require('./classes/tabs');
const isDevEnv = process.env.NODE_ENV === 'development';

if (isDevEnv) require('electron-reloader')(module);

let win;
let tabs = [];

const showNotification = (title, Message) => {
  new Notification({
    title,
    body: Message,
  }).show();
};
function createTab(filePath, content = '') {
  let existTab = tabs.filter(tab => tab.filePath === filePath)[0];
  if (!existTab) {
    tabs.push(new Tab(filePath, content));
    win.webContents.send('created-tab', filePath);
  } else {
    showNotification('Error', 'This file is already open');
    return false;
  }
  return true;
}

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'controllers/controller.js'),
      //preload: path.join(__dirname, 'editor.js'),
      nativeWindowOpen: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  win.loadFile('./views/index.html');
}

app
  .whenReady()
  .then(createWindow)
  .then(() => (tabs = []));

const openFile = filePath => {
  fs.readFile(filePath, 'utf8', (error, content) => {
    if (error) {
      showNotification('Error', 'Something went wrong');
    } else {
      app.addRecentDocument(filePath);
      if (createTab(filePath, content));
      win.webContents.send('document-opened', {filePath, content});
    }
  });
};
const getTab = filePath => {
  return tabs.filter(tab => tab.filePath === filePath);
};

ipcMain.on('open-document-triggered', () => {
  dialog
    .showOpenDialog({
      properties: ['openFile'],
      filters: [{name: 'text files', extensions}],
    })
    .then(({filePaths}) => {
      const filePath = filePaths[0];

      openFile(filePath);
    });
});
ipcMain.on('create-document-triggered', () => {
  dialog
    .showSaveDialog(win, {
      filters: [{name: 'text files', extensions}],
    })
    .then(({filePath}) => {
      fs.writeFile(filePath, '', error => {
        if (error) {
          showNotification('Error', 'Something went wrong');
        } else {
          app.addRecentDocument(filePath);
          createTab(filePath);
          win.webContents.send('document-created', filePath);
        }
      });
    });
});
ipcMain.on('content-update', (_, {filePath, content}) => {
  let myTabs = getTab(filePath);
  myTabs.forEach(tab => {
    tab.updateContent(content);
  });
});
ipcMain.on('file-content-updated', (_, {filePath}) => {
  let myTab = getTab(filePath)[0];
  myTab.updateFile();
});
ipcMain.on('request-document-close', (_, filePath) => {
  let myTab = getTab(filePath)[0];
  if (!myTab.save) {
    myTab.updateFile();
  }
  tabs = tabs.filter(tab => tab.filePath !== filePath);
  win.webContents.send('document-closed', {filePath,tabsCount: tabs.length,nextTab: tabs[0]});
  if (tabs.length)
    win.webContents.send('document-opened', {
      filePath: tabs[0].filePath,
      content: tabs[0].content,
    });
  openedFilePath = 'Not selected';
});
ipcMain.on('change-tab', (_, filePath) => {
  let myTab = getTab(filePath)[0];

      win.webContents.send('document-opened', {filePath, content: myTab.content});
  win.webContents.send('changed-tab', filePath);
});
ipcMain.on('change-vim-mode',(_)=>{
win.webContents.send('changed-vim-mode')
})

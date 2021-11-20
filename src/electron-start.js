const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { extensions } = require("./BasicConfig/extensions");
const path = require("path");
const url = require("url");
const { openFile } = require("./BasicConfig/files");

require("dotenv").config();

let mainWindow;

const { NODE_ENV, ELECTRON_START_URL } = process.env;
function createWindow() {
    mainWindow = new BrowserWindow();
    console.log(NODE_ENV, ELECTRON_START_URL);
    const startUrl =
        NODE_ENV === "development"
            ? ELECTRON_START_URL
            : url.format({
                  pathname: path.join(__dirname, "/../build/index.html"),
                  protocol: "file",
                  slashes: true,
              });
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

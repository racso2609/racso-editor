const fs = require("fs");

exports.openFile = (filePath, win, app) => {
  fs.readFile(filePath, "utf8", (error, content) => {
    if (error) {
      console.log("Error", "Something went wrong");
    } else {
      app.addRecentDocument(filePath);
      win.webContents.send("document-opened", { filePath, content });
    }
  });
};

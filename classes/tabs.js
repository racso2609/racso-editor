const fs = require('fs');
class Tab {
  constructor(filePath, content) {
    this.filePath = filePath;
    this.content = content;
    this.save = true;
  }

  updateSave(value) {
    this.save = value;
  }

  updateContent(newContent) {
    this.content = newContent;
    this.updateSave(false);
  }

  updateFile() {
    fs.writeFile(this.filePath, this.content, error => {
      if (error) console.log(error);
    });
  }




}

module.exports = Tab;

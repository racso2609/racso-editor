//let actualMode = 'command';

const {ipcRenderer} = require('electron');

let movementTypes = {
  simpleMove: 1,
};
let commandMode = codemirror => {
  console.log('commandMode', codemirror);
  codemirror.setOption('disableInput', true);
  codemirror.setOption('showCursorWhenSelecting', true);
  codemirror.actualMode = 'command';
  codemirror.actualKeys = this.commandModeKeys;
  ipcRenderer.send('change-vim-mode');
};
let editMode = codemirror => {
  console.log('editMode', codemirror);
  codemirror.setOption('disableInput', false);
  codemirror.setOption('showCursorWhenSelecting', false);
  codemirror.actualMode = 'edit';
  codemirror.setOption('cursorActivity', cm => console.log(cm));
  codemirror.actualKeys = this.editModeKeys;
  ipcRenderer.send('change-vim-mode');
};
function move(cm, steps, dir = 0) {
  let cursor = cm.getCursor();
  cm.setCursor({
    ...cursor,
    ch: !dir ? cursor.ch + steps : cursor.ch,
    line: dir ? cursor.line + steps : cursor.line,
  });
}
function getCharactersCursor(cm, cursor, dir = false) {
  let lines = cm.getLine(cursor.line);

  lines = lines.slice(!dir ? 0 : cursor.ch, !dir ? cursor.ch : lines.length);
  lines = lines.split(' ');
  lines = lines[!dir ? lines.length - 1 : 0].length;
  return lines || 1;
}
function deleteChars(cm, completeWord = false, dir = false) {
  let cursor = cm.getCursor();
  let countOfChar = !completeWord ? 1 : getCharactersCursor(cm, cursor, dir);
  //console.log(cursor.ch,countOfChar)
  cm.replaceRange(
    '',
    {line: cursor.line, ch: !dir ? cursor.ch - countOfChar : cursor.ch},
    {line: cursor.line, ch: !dir ? cursor.ch : cursor.ch + countOfChar},
  );
}

exports.defaultKeys = {
  Esc: commandMode,
  Right: function(cm) {
    move(cm, movementTypes.simpleMove);
  },
  Left: function(cm) {
    move(cm, movementTypes.simpleMove * -1);
  },
  Up: function(cm) {
    move(cm, movementTypes.simpleMove * -1, 1);
  },
  Down: function(cm) {
    move(cm, movementTypes.simpleMove, 1);
  },
  'Ctrl-A': function(cm) {
    cm.execCommand('selectAll');
  },
  Backspace: function(cm) {
    if (cm.somethingSelected()) {
      cm.replaceSelection('');
    } else {
      deleteChars(cm);
    }
  },
  'Shift-Backspace': function(cm) {
    deleteChars(cm, true);
  },
  'Ctrl-Backspace': function(cm) {
    deleteChars(cm, true, true);
  },
};
exports.commandModeKeys = {
  I: editMode,
  'Shift-D': function(cm) {
    cm.execCommand('deleteLine');
  },
  U: function(cm) {
    cm.execCommand('undo');
  },
  R: function(cm) {
    cm.execCommand('redo');
  },
};

exports.editModeKeys = {
  Tab: function(cm) {
    var spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
    cm.replaceSelection(spaces);
  },
  'Shift-Left': function(cm) {
    let cursor = cm.getCursor();
    let lines = getCharactersCursor(cm, cursor);

    cm.setSelection(
      {line: cursor.line, ch: cursor.ch - lines},
      {line: cursor.line, ch: cursor.ch},
    );
  },
  'Shift-Right': function(cm) {
    let cursor = cm.getCursor();
    let lines = getCharactersCursor(cm, cursor, true);

    cm.setSelection(
      {line: cursor.line, ch: cursor.ch + lines},
      {line: cursor.line, ch: cursor.ch},
    );
  },
};

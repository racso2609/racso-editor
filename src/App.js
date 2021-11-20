import "./GeneralStyle/styles.scss";
import Editor from "@monaco-editor/react";
import Tabs from "./hooks/ManageTabs";
import { extensions } from "./BasicConfig/extensions";


function App() {
  const { tabs, actualTab, changeTab, content, updateTabValue } = Tabs();

  const handleFileRead = (e, filePath) => {
    const result = e.target.result;
    changeTab(filePath, result)
  };

  const handleFileChosen = (file) => {
    let fileReader = new FileReader();
    fileReader.onloadend = (e) => handleFileRead(e, file.path);
    fileReader.readAsText(file);
  };
  const selectFile = (filePath) => {
    changeTab(filePath, tabs[filePath].value)
  }
  return (
    <>

      <input type="file" onChange={e => handleFileChosen(e.target.files[0])} accept={extensions.join(",")} />

      <div className="content-tab">
        {Object.keys(tabs).map((tabKey) => {
          return (
            <div className="tab" onClick={() => selectFile(tabKey)} name={tabKey}>
              <span className="tab-name">
                {tabKey.split("/")[tabKey.split("/").length - 1]}
              </span>
            </div>
          );
        })}
      </div>

      <Editor
        theme="vs-dark"
        height="100vh"
        language={tabs[actualTab]?.language}
        value={content}
        onChange={(content) => updateTabValue(actualTab, content)}
      />
    </>
  );
}

export default App;

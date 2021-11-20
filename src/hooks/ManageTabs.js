import { useState } from "react";

const Tabs = () => {
  const [tabs, setTabs] = useState({});
  const [actualTab, setActualTab] = useState('');
  const [content, setContent] = useState("")

  const changeTab = (filePath, content) => {
    let extension = filePath.split(".");
    extension = extension[extension.length - 1];
    setTabs({ ...tabs, [filePath]: { value: content, language: extension, status:"save" } })
    setActualTab(filePath)
    setContent(content)
  };
  const updateTabValue = (filePath,content)=>{
    setTabs({ ...tabs, [filePath]: {...tabs[filePath],value: content, status:"unsave"} })
  }

 

  return {
    tabs,
    actualTab,
    changeTab,
    content,
    updateTabValue
  };
};

export default Tabs;


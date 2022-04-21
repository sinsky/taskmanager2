import React, { useState, useEffect, useRef, useCallback, VFC } from "react";
import { googleRuns } from "./Utility";
import { v4 as uuidv4 } from 'uuid';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";

import { MarkdownComponent } from "./MarkdownComponent";
import { Filer } from "./Files";

type locationHash = {
  uid?: string;
  edit?: "true";
}

const markdown = `# My markdown
- list
- [ ] checkbox
## secondary
\`\`\`javascript
const text = "hello wolrd";
console.log(text);
\`\`\`

\`\`\`html
<h1>Hello World</h1>
<div class="container"></div>
\`\`\`

\`\`\`mermaid
graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
\`\`\``;


export const App = () => {
  const [location, setLocation] = useState({});
  useEffect(() => {
    google.script.url.getLocation((loc) => setLocation(loc.parameter));
  }, []);
  useEffect(() => {
    console.log(location);
  }, [location]);

  const [files, setFiles] = useState([]);
  const [activeFileState, setActiveFileState] = useState(null);
  const activeFile = useRef<{ uid?: string, text?: string, name?: string }>({});

  useEffect(() => {
    console.log("file,state,current");
    console.log(files);
    console.log(activeFileState);
    console.log(activeFile.current);
    if (activeFileState !== null) {
      activeFile.current = files[activeFileState];
      setText(files[activeFileState].text);
    }

  }, [activeFileState]);

  const [text, setText] = useState(markdown);
  useEffect(() => {
    if (activeFileState !== null)
      activeFile.current.text = text;
  }, [text]);

  const hiddenFile = (event, index) => {
    event.preventDefault();
    // console.group("start");
    // console.log(activeFileState);
    // console.log(files);
    // console.log(activeFile);
    // console.groupEnd();
    files.splice(index, 1);
    setFiles([...files]);
    if (files.length === 0) {
      console.log("set null");
      setActiveFileState(null);
      activeFile.current = null;
    } else if (files.length >= activeFileState) {
      console.log(`fileの範囲外 file len->${files.length}`);
      setActiveFileState(files.length - 1);
      activeFile.current = { ...files[files.length - 1] };
      setText(files[files.length - 1].text);
    }
    // console.group("end");
    // console.log(activeFileState);
    // console.log(files);
    // console.log(activeFile);
    // console.groupEnd();
  };

  const saveEvent = () => {
    const file = activeFile.current;
    console.log("save event");
    console.log(file);
    googleRuns("setMarkdownText", { uid: file.uid, value: file.text })
      .then((res) => toast.success(`${file.name} is saved`))
      .catch((err) => {
        console.error(err);
        toast.error(`error... please watch log`);
      });
  };
  const mountEvent = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, saveEvent);
  };


  return (
    <section className="flex">
      <aside className="shrink-0">
        <Filer files={files} setFiles={setFiles} setActiveFileState={setActiveFileState} />
      </aside>
      <section className="w-full p-4">
        <div className="h-10">
          <ul className="flex items-center flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
            {files.map((file, index) => {
              const isActiveStyle = index === activeFileState ? " text-blue-600 bg-gray-100 " : " text-gray-600 hover:text-gray-800 hover:bg-gray-50";
              return (
                <li className="mr-2">
                  <button className={"inline-flex items-center p-2 rounded-t-lg border-transparent group " + isActiveStyle} onClick={() => setActiveFileState(index)}>
                    <span>{file.name}</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" onClick={(e) => hiddenFile(e, index)}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </li>
              )
            })}
          </ul>
          {files.map(file => {
            return <>{file.name}</>
          })}
        </div>
        <div className="w-full h-[93vh] flex">
          {
            activeFileState !== null &&
            <>
              <div className="w-1/2">
                <Editor
                  defaultLanguage="markdown"
                  value={text}
                  theme="vs-dark"
                  onChange={(v, e) => setText(v)}
                  options={{ minimap: { enabled: false } }}
                  onMount={mountEvent}
                />
              </div>
              <div className="w-1/2">
                <MarkdownComponent text={text} />
              </div>
            </>
          }
        </div>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </section>
    </section>
  )
}

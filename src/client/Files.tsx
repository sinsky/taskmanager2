import React, { useState, useEffect, useCallback, useRef, VFC } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';
import { googleRuns } from "./Utility";

type DataTypes = {
  type: string;
  name: string;
  uid: string;
  children?: DataTypes[];
}

type ArgsTypes = {
  uid?: string;
  parent?: any;
}

type CreateModalTypes = {
  open: boolean;
  type: string;
  isRoot: boolean;
  isSubmit: boolean;
  args: ArgsTypes;
}

type DeleteModalTypes = {
  open: boolean;
  isSubmit: boolean;
  filename: string;
  args: any;
}

export const Filer = ({ files, setFiles, setActiveFileState }) => {
  const [isLoading, setLoading] = useState(false);
  const [filemap, setFilemap] = useState([]);
  const updateFiles = useCallback(() => {
    setLoading(true);
    googleRuns("getFileStructureData")
      .then((res) => JSON.parse(res.data))
      .then((fileData) => setFilemap(fileData))
      .then(() => setLoading(false))
      .catch((err) => {
        toast.error(err);
        console.error(err);
      });
  }, [filemap]);
  useEffect(updateFiles, []);

  const createModalInitStatus = { open: false, type: "", isRoot: true, isSubmit: false, args: {} };
  const [createModalConfig, setCreateModalConfig] = useState<CreateModalTypes>(createModalInitStatus);
  const closeModal = () => {
    if (!createModalConfig.isSubmit) setCreateModalConfig(createModalInitStatus);
  };
  const createEventModal = (type, isRoot, args: ArgsTypes = {}) => {
    setCreateModalConfig({ open: true, type, isRoot, isSubmit: false, args: { ...args } });
  };
  const createEvent = (name) => {
    const { type, isRoot, args } = createModalConfig;
    const uid = uuidv4();
    const data: DataTypes = {
      type,
      name,
      uid,
    };
    if (type === "foldar") data.children = [];
    if (isRoot) filemap.push({ ...data });
    else args.parent.filter((item) => item.uid === args.uid)[0].children.push(data);
    setFilemap([...filemap]);
    setCreateModalConfig({ ...createModalConfig, isSubmit: true });
    googleRuns("setFileStructureData", { isCreate: true, data: JSON.stringify([...filemap]), type, uid })
      .then((res) => console.log(res))
      .finally(() => closeModal());
  };
  return (
    <section className="w-[20rem] overflow-y-auto">
      <div className="p-4 pr-0 h-screen text-md">
        {isLoading ? (
          <div className="flex justify-center">
            <svg role="status" className="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <div>Root</div>
              <div className="">
                <button type="button" className="rounded-full hover:bg-blue-200 p-1 cursor-pointer focus:ring focus:ring-blue-300" onClick={() => createEventModal("foldar", true)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <ul className="pl-4 select-none">
              <FileExplorer filemap={filemap} setFilemap={setFilemap} createEventModal={createEventModal} files={files} setFiles={setFiles} setActiveFileState={setActiveFileState} />
            </ul>
          </>
        )}
      </div>
      {createModalConfig.open && <CreateModal createModalConfig={createModalConfig} closeHandler={closeModal} createEvent={createEvent} />}
    </section>
  );
};
const CreateModal = ({ createModalConfig, closeHandler, createEvent }) => {
  const { open, type, isSubmit } = createModalConfig;
  const typeString = type === "file" ? "ファイル" : type === "foldar" ? "フォルダ" : "";
  const [name, setName] = useState("");
  const onNameChange = (e) => setName(e.target.value);
  return (
    <div className={(open ? "flex" : "hidden") + " justify-center items-center overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full bg-gray-900/[.8] "}>
      <div className="relative p-4 w-full max-w-md h-full md:h-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex justify-end p-2">
            <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal" onClick={closeHandler}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
          <form
            className="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8"
            onSubmit={(e) => {
              e.preventDefault();
              createEvent(name);
            }}
          >
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">{typeString}の追加</h3>
            <div className="relative z-0 mb-6 w-full group">
              <label>
                <input type="text" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required value={name} onChange={onNameChange} />
                <span className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{typeString}名</span>
              </label>
            </div>
            {isSubmit ? (
              <button type="button" className="flex justify-center w-full text-white bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 items-center cursor-wait">
                <svg role="status" className="inline mr-6 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span className="font-bold text-lg">作製中</span>
              </button>
            ) : (
              <button type="button" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => createEvent(name)}>
                追加する
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
const DeleteModal = ({ deleteModalConfig, closeHandler, deleteEvent }) => {
  const { open, fileName, isSubmit } = deleteModalConfig;

  return (
    <div className={(open ? "flex" : "hidden") + " justify-center items-center overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full bg-gray-900/[.8] "}>
      <div className="relative p-4 w-full max-w-md h-full md:h-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex justify-end p-2">
            <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal" onClick={closeHandler}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
          <form
            className="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8"
            onSubmit={(e) => {
              e.preventDefault();
              deleteEvent();
            }}
          >
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">{fileName}を削除する</h3>
            <div className="relative z-0 mb-6 w-full group">
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                <div className="font-bold text-lg">最終確認</div>
                <div>フォルダの場合、配下のものは全て削除されます。</div>
              </div>
            </div>
            {isSubmit ? (
              <button type="button" className="flex justify-center w-full text-white bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 items-center cursor-wait">
                <svg role="status" className="inline mr-6 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span className="font-bold text-lg">削除中</span>
              </button>
            ) : (
              <button type="button" className="w-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" onClick={deleteEvent}>
                削除する
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
const FileExplorer = ({ filemap, setFilemap, createEventModal, files, setFiles, setActiveFileState }) => {
  const deleteModalInitStatus = { open: false, isSubmit: false, filename: "", args: {} };
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalTypes>(deleteModalInitStatus);
  const closeModal = () => {
    setDeleteModalConfig({ ...deleteModalInitStatus });
  };
  const deleteEventModal = (filename, args = {}) => {
    setDeleteModalConfig({ open: true, isSubmit: false, filename, args: { ...args } });
  };
  const deleteEvent = () => {
    const { args } = deleteModalConfig;
    const removeItem = args.parent.splice(args.index, 1)[0];
    console.log(removeItem);
    const uids = args.type === "file" ? [removeItem.uid] : removeItem.children.map((item) => getMultiArrayUids(item)).flat(Infinity);
    console.log(uids);
    setFilemap([...filemap]);
    setDeleteModalConfig({ ...deleteModalConfig, isSubmit: true });
    googleRuns("setFileStructureData", { isCreate: false, data: JSON.stringify([...filemap]), type: args.type, uids })
      .then((res) => console.log(res))
      .finally(() => closeModal());
  };
  const getMultiArrayUids = (item) => {
    const { type, uid } = item;
    if (type === "file") return uid;
    else return item.children.map((item) => getMultiArrayUids(item));
  };
  return (
    <>
      {filemap.map((item, index) => (
        <FileViewer key={item.uid} index={index} item={item} filemap={filemap} setFilemap={setFilemap} parent={filemap} createEventModal={createEventModal} deleteEventModal={deleteEventModal} files={files} setFiles={setFiles} setActiveFileState={setActiveFileState} />
      ))}
      {deleteModalConfig.open && <DeleteModal deleteModalConfig={deleteModalConfig} closeHandler={closeModal} deleteEvent={deleteEvent} />}
    </>
  );
};
const FileViewer = ({ index, item, filemap, setFilemap, parent, createEventModal, deleteEventModal, files, setFiles, setActiveFileState }) => {
  const { type, name, children, uid } = item;
  const [open, setOpen] = useState(true);
  const clicker = () => setOpen(!open);
  const isFoldar = type === "foldar";
  const addFileEvent = (e) => {
    e.preventDefault();
    createEventModal("file", false, { parent, uid });
  };
  const addFoldarEvent = (e) => {
    e.preventDefault();
    createEventModal("foldar", false, { parent, uid });
  };
  const deleteEvent = (e) => {
    e.preventDefault();
    deleteEventModal(name, { parent, index, type });
  };
  const show = () => {
    if (!files.filter((item) => item.uid === uid).length) {
      googleRuns("getMarkdownText", { uid })
        .then((res) => setFiles([...files, { uid, name, text: res.value }]))
        .then(() => setActiveFileState(files.length));
    } else {
      const activeState = files.findIndex((file) => file.uid === uid);
      console.log(`state: ${activeState}`);
      setActiveFileState(activeState);
    }
  };
  return (
    <>
      {isFoldar ? (
        <li className="p-2 flex justify-between items-center border-t group">
          <div className="flex cursor-pointer p-1" onClick={clicker}>
            <span className="w-6 h-6 text-yellow-500">
              {open ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
              )}
            </span>
            <span className="pl-2">{name}</span>
          </div>
          <div className="hidden group-hover:flex">
            <button type="button" className="rounded-full hover:bg-blue-200 p-1 cursor-pointer focus:ring focus:ring-blue-300" onClick={addFoldarEvent}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              </svg>
            </button>
            <button type="button" className="rounded-full hover:bg-blue-200 p-1 cursor-pointer focus:ring focus:ring-blue-300" onClick={addFileEvent}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
            <button type="button" className="rounded-full hover:bg-blue-200 p-1 cursor-pointer focus:ring focus:ring-blue-300" onClick={deleteEvent}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </li>
      ) : (
        <li className="p-2 flex justify-between items-center border-t group" onClick={show}>
          <div className="flex cursor-pointer p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <span className="pl-2">{name}</span>
          </div>
          <div className="hidden group-hover:flex">
            <button type="button" className="rounded-full hover:bg-blue-200 p-1 cursor-pointer focus:ring focus:ring-blue-300" onClick={deleteEvent}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </li>
      )}

      {children && children.length > 0 && (
        <ul className={"pl-8 transition duration-75 " + (!open && " translate-y-2/4 scale-y-0 h-0")}>
          {children.map((item, index) => (
            <FileViewer key={item.uid} index={index} item={item} filemap={filemap} setFilemap={setFilemap} parent={children} createEventModal={createEventModal} deleteEventModal={deleteEventModal} files={files} setFiles={setFiles} setActiveFileState={setActiveFileState} />
          ))}
        </ul>
      )}
    </>
  );
};

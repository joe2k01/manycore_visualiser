import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useAppContext } from "../App";
import { openFilePickerDialog, startProcessing } from "../utils/loadUtils";
import TwotoneFileOpen from "./icons/TwotoneFileOpen";

const FileLoader: React.FunctionComponent = () => {
  const ctx = useAppContext();

  let unlisten: UnlistenFn | undefined;
  let listenerStarted = false;

  const startFileDropListener = async () => {
    // TODO: Figure out dropping on actual button
    unlisten = await listen("tauri://file-drop", (event) => {
      const filePath = (event.payload as string[])[0];
      if (filePath.endsWith(".xml")) {
        startProcessing(filePath, ctx);
      }
    });
  };

  useEffect(() => {
    if (!listenerStarted) {
      startFileDropListener();
      listenerStarted = true;
    }

    // Unregister Tauri listener when component unmounts
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <button
      className="m-auto max-w-[850px] max-h-[560px] min-w-max w-2/3 h-2/3 flex flex-col rounded-2xl border-3 bg-indigo-100 border-indigo-700 shadow-md shadow-black/50 text-indigo-700 px-2 py-4 lg:py-8 scale-100 translate-y-0 transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:shadow-2xl"
      onClick={() => openFilePickerDialog(ctx)}
    >
      <TwotoneFileOpen
        className="m-auto mb-4 w-1/3 max-w-52"
        width={"33%"}
        height={"100%"}
      />
      <p className="font-roboto font-bold text-center mt-auto lg:text-lg xl:text-xl 2xl:text-2xl w-full">
        Drag input file here or click to open file explorer
      </p>
    </button>
  );
};

export default FileLoader;

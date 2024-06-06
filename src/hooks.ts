import { useRef } from "react";
import { useDispatch } from "react-redux";
import _ from "underscore";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

import { setProgress as setUpProgress } from "./redux/slices/uploadSlice.ts";
import {
  addFile,
  setProgress as setDownProgress,
} from "./redux/slices/downloadSlice.ts";
import { FileProgressType, uploadEventPayload } from "./redux/types.ts";

export const EventListeners = () => {
  const dispatch = useDispatch();
  const downloadProgressListener = useRef<UnlistenFn | null>(null);
  const uploadProgressListener = useRef<UnlistenFn | null>(null);
  const uploadedFileListener = useRef<UnlistenFn | null>(null);

  const updateUploadResult = _.debounce((fileName: string) => {
    dispatch(addFile(fileName));
  }, 500);

  const startListeners = async () => {
    downloadProgressListener.current = await listen<FileProgressType>(
      "download_progress",
      (e) => {
        dispatch(setUpProgress(e.payload));
      },
    );
    uploadProgressListener.current = await listen<FileProgressType>(
      "upload_progress",
      (e) => {
        dispatch(setDownProgress(e.payload));
      },
    );
    uploadedFileListener.current = await listen<uploadEventPayload>(
      "upload-result",
      (e) => {
        updateUploadResult(e.payload.file_name);
      },
    );
  };

  const terminateListeners = () => {
    downloadProgressListener.current?.();
    uploadProgressListener.current?.();
    uploadedFileListener.current?.();
  };

  return [startListeners, terminateListeners];
};

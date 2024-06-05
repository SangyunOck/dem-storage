import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { downloadFileSliceType, fileType, FileProgressType } from "../types.ts";
import { downFiles } from "../../test/mocks.ts";

type sortType = {
  asc: boolean;
  isActive: boolean;
  name: string;
};

type defaultType = {
  value: {
    files: downloadFileSliceType[];
    len: number;
    sortTypes: sortType[];
    sortMethod: (a: downloadFileSliceType, b: downloadFileSliceType) => number;
    searchInput: string;
  };
};

const initState: defaultType = {
  value: {
    files: downFiles,
    len: downFiles.length,
    sortMethod: (a, b) => a.progress - b.progress,
    sortTypes: [
      {
        asc: true,
        isActive: true,
        name: "진행순",
      },
      {
        asc: true,
        isActive: false,
        name: "파일명순",
      },
    ],
    searchInput: "",
  },
};

const downloadSlice = createSlice({
  name: "downloadFiles",
  initialState: initState,
  reducers: {
    addFile: (state, action: PayloadAction<fileType>) => {
      state.value.files.push({
        file: action.payload,
        isCompleted: false,
        isInProgress: false,
        progress: 0,
      });
      state.value.len += 1;
    },
    deleteFile: (state, action: PayloadAction<fileType>) => {
      const { name, path } = action.payload;
      const idx = state.value.files.findIndex(
        (f) => f.file.name == name && f.file.path == path,
      );
      state.value.files.splice(idx, 1);
    },
    changeSortType: (state, action: PayloadAction<string>) => {
      let curAsc = false;
      state.value.sortTypes.forEach((v) => {
        if (v.name == action.payload) {
          const { asc, isActive } = v;
          if (isActive) {
            v.asc = !asc;
            curAsc = !asc;
          }
          v.isActive = true;
        } else {
          v.isActive = false;
        }
      });

      if (action.payload == "진행순") {
        state.value.sortMethod = (a, b) => {
          return curAsc ? a.progress - b.progress : b.progress - a.progress;
        };
      } else if (action.payload == "파일명순") {
        state.value.sortMethod = (a, b) => {
          return curAsc
            ? a.file.name.localeCompare(b.file.name)
            : b.file.name.localeCompare(a.file.name);
        };
      }
    },
    setProgress: (state, action: PayloadAction<FileProgressType>) => {
      const { file, progress } = action.payload;
      const idx = state.value.files.findIndex(
        (item) => item.file.name === file.name && item.file.path === file.path,
      );
      if (idx < 0) return;

      state.value.files[idx].progress = progress;
    },
    changeInput: (state, action: PayloadAction<string>) => {
      state.value.searchInput = action.payload;
    },
    setFiles: (state, action: PayloadAction<downloadFileSliceType[]>) => {
      state.value.files = action.payload;
    },
  },
});

export const {
  addFile,
  setFiles,
  deleteFile,
  changeSortType,
  changeInput,
  setProgress,
} = downloadSlice.actions;
export default downloadSlice.reducer;

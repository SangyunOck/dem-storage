import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { downloadFileSliceType, fileType } from "../types.ts";
import { downFiles } from "../../test/mocks.ts";

type defaultType = {
  value: downloadFileSliceType[];
};

const initState: defaultType = {
  value: downFiles,
};

const downloadSlice = createSlice({
  name: "downloadFiles",
  initialState: initState,
  reducers: {
    addFile: (state, action: PayloadAction<fileType>) => {
      state.value.push({
        file: action.payload,
        isCompleted: false,
        isInProgress: false,
        progress: 0,
      });
    },
    deleteFile: (state, action: PayloadAction<fileType>) => {
      const { name, path } = action.payload;
      let idx = state.value.findIndex(
        (f) => f.file.name == name && f.file.path == path,
      );
      state.value.splice(idx, 1);
    },
  },
});

export const { addFile, deleteFile } = downloadSlice.actions;
export default downloadSlice.reducer;

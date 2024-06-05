import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { FileProgressType, uploadFileSliceType, fileType } from "../types.ts";

type defaultType = {
  value: {
    files: uploadFileSliceType[];
    len: number;
  };
};

const initState: defaultType = {
  value: {
    files: [],
    len: 0,
  },
};

const uploadSlice = createSlice({
  name: "uploadFiles",
  initialState: initState,
  reducers: {
    addFile: (state, action: PayloadAction<fileType>) => {
      state.value.files.push({
        file: action.payload,
        startAt: new Date(),
        isCompleted: false,
        progress: 0,
        isChecked: false,
      });
      state.value.len += 1;
    },
    setProgress: (state, action: PayloadAction<FileProgressType>) => {
      const { file, progress } = action.payload;
      const targetIdx = state.value.files.findIndex(
        (f) => f.file.path == file.path && f.file.name == file.name,
      );
      if (targetIdx < 0) return;

      state.value.files[targetIdx].progress = Math.min(progress, 100);
      if (state.value.files[targetIdx].progress == 100) {
        state.value.files[targetIdx].isCompleted = true;
      }
    },
    addProgress: (state, action: PayloadAction<FileProgressType>) => {
      const { file, progress } = action.payload;
      const targetIdx = state.value.files.findIndex(
        (f) => f.file.path == file.path && f.file.name == file.name,
      );
      if (targetIdx < 0) return;

      state.value.files[targetIdx].progress = Math.min(
        state.value.files[targetIdx].progress + progress,
        100,
      );
      if (state.value.files[targetIdx].progress == 100) {
        state.value.files[targetIdx].isCompleted = true;
      }
    },
    checkOne: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      state.value.files[idx].isChecked = true;
    },
    setFiles: (state, action: PayloadAction<uploadFileSliceType[]>) => {
      state.value.files = action.payload;
    },
    addProgressWithIdx: (
      state,
      action: PayloadAction<{ idx: number; progress: number }>,
    ) => {
      const { idx, progress } = action.payload;
      if (idx < 0) return;

      state.value.files[idx].progress = Math.min(
        state.value.files[idx].progress + progress,
        100,
      );
      if (state.value.files[idx].progress == 100) {
        state.value.files[idx].isCompleted = true;
      }
    },
  },
});

export const {
  addFile,
  setProgress,
  addProgress,
  checkOne,
  setFiles,
  addProgressWithIdx,
} = uploadSlice.actions;
export default uploadSlice.reducer;

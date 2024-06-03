import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { setFileProgress, uploadFileSliceType, fileType } from "../types.ts";

type defaultType = {
  value: uploadFileSliceType[];
};
const initState: defaultType = {
  value: [],
};

const uploadSlice = createSlice({
  name: "uploadFiles",
  initialState: initState,
  reducers: {
    addFile: (state, action: PayloadAction<fileType>) => {
      state.value.push({
        id: state.value.length,
        file: action.payload,
        startAt: new Date(),
        isCompleted: false,
        progress: 0,
        isChecked: false,
      });
    },
    setProgress: (state, action: PayloadAction<setFileProgress>) => {
      state.value[action.payload.id].progress = action.payload.progress;
    },
    addProgress: (state, action: PayloadAction<setFileProgress>) => {
      state.value[action.payload.id].progress += action.payload.progress;
      if (state.value[action.payload.id].progress >= 100) {
        state.value[action.payload.id].progress = 100;
        state.value[action.payload.id].isCompleted = true;
      }
    },
    checkOne: (state, action: PayloadAction<number>) => {
      state.value[action.payload].isChecked = true;
    },
  },
});

export const { addFile, setProgress, addProgress, checkOne } =
  uploadSlice.actions;
export default uploadSlice.reducer;

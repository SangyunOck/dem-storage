import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type setFileProgress = {
  id: number;
  progress: number;
};

export type uploadFileType = {
  file: File;
  id: number;
  startAt: Date;
  isCompleted: boolean;
  progress: number;
};

type defaultType = {
  value: uploadFileType[];
};
const initState: defaultType = {
  value: [],
};

const uploadSlice = createSlice({
  name: "uploadFiles",
  initialState: initState,
  reducers: {
    addFile: (state, action: PayloadAction<File>) => {
      state.value.push({
        id: state.value.length,
        file: action.payload,
        startAt: new Date(),
        isCompleted: false,
        progress: 0,
      });
    },
    deleteFile: (state, action: PayloadAction<number>) => {
      let idx = state.value.findIndex((f) => f.id == action.payload);
      state.value.splice(idx, 1);
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
  },
});

export const { addFile, deleteFile, setProgress, addProgress } =
  uploadSlice.actions;
export default uploadSlice.reducer;

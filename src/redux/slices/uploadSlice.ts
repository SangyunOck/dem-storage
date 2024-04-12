import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type defaultType = {
  value: File[];
};
const initState: defaultType = {
  value: [],
};

const uploadSlice = createSlice({
  name: "uploadFiles",
  initialState: initState,
  reducers: {
    addFile: (state, action: PayloadAction<File>) => {
      state.value.push(action.payload);
    },
    deleteFile: (state, action: PayloadAction<number>) => {
      state.value.splice(action.payload, 1);
    },
  },
});

export const { addFile, deleteFile } = uploadSlice.actions;
export default uploadSlice.reducer;

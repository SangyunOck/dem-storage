import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";

import uploadReducer from "./slices/uploadSlice.ts";
import downloadReducer from "./slices/downloadSlice.ts";
import userReducer from "./slices/userSlice.ts";
import fileListOptionReducer from "./slices/fileListOptionSlice.ts";

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
    download: downloadReducer,
    user: userReducer,
    listOptions: fileListOptionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

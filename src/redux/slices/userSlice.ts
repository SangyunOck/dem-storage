import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { userSliceType, userType } from "../types.ts";

type defaultType = {
  value: userSliceType;
};
const initState: defaultType = {
  value: {
    id: null,
    password: null,
    isAuthenticated: false,
  },
};

const userSlice = createSlice({
  name: "user-info",
  initialState: initState,
  reducers: {
    login: (state, action: PayloadAction<userType>) => {
      state.value.id = action.payload.id;
      state.value.password = action.payload.password;
      state.value.isAuthenticated = true;
    },
    logout: (state) => {
      state.value.id = null;
      state.value.password = null;
      state.value.isAuthenticated = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;

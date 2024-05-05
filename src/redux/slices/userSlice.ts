import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type userType = {
  id: string | null;
  isAuthenticated: boolean;
};

type defaultType = {
  value: userType;
};
const initState: defaultType = {
  value: {
    id: null,
    isAuthenticated: false,
  },
};

const userSlice = createSlice({
  name: "user-info",
  initialState: initState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.value.id = action.payload;
      state.value.isAuthenticated = true;
    },
    logout: (state) => {
      state.value.id = null;
      state.value.isAuthenticated = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;

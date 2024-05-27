import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type sortType = {
  asc: boolean;
  isActive: boolean;
  name: string;
};

type defaultType = {
  value: {
    sortTypes: sortType[];
  };
};
const initState: defaultType = {
  value: {
    sortTypes: [
      {
        asc: false,
        isActive: true,
        name: "최신순",
      },
      {
        asc: false,
        isActive: false,
        name: "파일명순",
      },
    ],
  },
};

const fileListOptionSlice = createSlice({
  name: "fileListOptions",
  initialState: initState,
  reducers: {
    changeSortType: (state, action: PayloadAction<string>) => {
      state.value.sortTypes.forEach((v) => {
        if (v.name == action.payload) {
          const { asc, isActive } = v;
          if (isActive) {
            v.asc = !asc;
          }
          v.isActive = true;
        } else {
          v.isActive = false;
        }
      });
    },
  },
});

export const { changeSortType } = fileListOptionSlice.actions;
export default fileListOptionSlice.reducer;

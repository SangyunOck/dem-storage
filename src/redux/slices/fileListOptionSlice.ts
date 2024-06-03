import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type sortType = {
  asc: boolean;
  isActive: boolean;
  name: string;
};

type defaultType = {
  value: {
    sortTypes: sortType[];
    searchInput: string;
  };
};
const initState: defaultType = {
  value: {
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
    changeInput: (state, action: PayloadAction<string>) => {
      state.value.searchInput = action.payload;
    },
  },
});

export const { changeSortType, changeInput } = fileListOptionSlice.actions;
export default fileListOptionSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

export const menuSlice = createSlice({
  name: "menu",
  initialState: {
    shown: false
  },
  reducers: {
    hideMenu: (state) => {
      if (state.shown) state.shown = false;
    },
    showMenu: (state) => {
      if (!state.shown) state.shown = true;
    },
    toggleMenu: (state) => {
      state.shown = !state.shown;
    }
  }
});

export const { toggleMenu, showMenu, hideMenu } = menuSlice.actions;

export default menuSlice.reducer;

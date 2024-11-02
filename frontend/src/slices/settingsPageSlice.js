import { createSlice } from "@reduxjs/toolkit";

export const settingsPageSlice = createSlice({
  name: "settingsPage",
  initialState: {
    currentCategory: null
  },
  reducers: {
    setCurrentCategoryFromURL: (state) => {
      let categoryName = null;
      try {
        const categoryMatch = decodeURI(document.location.hash).match(
          /^#settings\/(.*)/
        );
        if (categoryMatch) categoryName = categoryMatch[1];
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Hash URL parse error, use the first category
      }
      if (state.currentCategory != categoryName)
        state.currentCategory = categoryName;
    }
  }
});

export const { setCurrentCategoryFromURL } = settingsPageSlice.actions;

export default settingsPageSlice.reducer;

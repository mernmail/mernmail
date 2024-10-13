import { createSlice } from "@reduxjs/toolkit";

let view = "mailbox";
try {
  const initialHash = document.location.hash;
  const viewMatch = decodeURI(initialHash).match(/#([^/]+)/);
  if (viewMatch) {
    view = viewMatch[1];
  }
  // eslint-disable-next-line no-unused-vars
} catch (err) {
  // Leave the view default
}

export const viewSlice = createSlice({
  name: "view",
  initialState: {
    view: view
  },
  reducers: {
    setView: (state, action) => {
      const view = (action.payload || "")
        .replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "")
        .replace(/^[/\\]+/g, "")
        .replace(/[/\\]+$/g, "");
      if (view && state.view != view) {
        state.view = view;
      }
    }
  }
});

export const { setView } = viewSlice.actions;

export default viewSlice.reducer;

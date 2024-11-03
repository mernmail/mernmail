import { createSlice } from "@reduxjs/toolkit";
import { verificationFailed } from "@/slices/authSlice.js";

export const searchContactsSlice = createSlice({
  name: "searchContacts",
  initialState: {
    loading: true,
    results: [],
    isEmptyQuery: false,
    error: null
  },
  reducers: {
    resetLoading: (state) => {
      state.loading = true;
      state.results = [];
      state.isEmptyQuery = false;
      state.error = null;
    },
    setSearchResults: (state, action) => {
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.results !== undefined)
        state.results = action.payload.results;
      if (action.payload && action.payload.isEmptyQuery !== undefined)
        state.isEmptyQuery = action.payload.isEmptyQuery;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
    }
  }
});

export const { resetLoading } = searchContactsSlice.actions;

export function setSearchResults(signal) {
  return async (dispatch, getState) => {
    const state = { error: null };
    let email = getState().auth.email;
    if (email === null) {
      return;
    }
    let searchQuery = "";
    try {
      const searchMatch = decodeURI(document.location.hash).match(
        /^#searchcontacts\/(.*)/
      );
      if (searchMatch) searchQuery = searchMatch[1];
      //eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Hash URL parse error, use the empty search query
    }
    searchQuery = searchQuery
      .replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "")
      .replace(/^[/\\]+/g, "")
      .replace(/[/\\]+$/g, ""); // Sanitize the search query
    let aborted = false;
    if (searchQuery) {
      try {
        const res = await fetch(
          `/api/addressbook/search/${encodeURI(searchQuery)}`,
          {
            method: "GET",
            credentials: "include",
            signal: signal
          }
        );
        if (res.status != 404) {
          const data = await res.json();
          if (res.status == 200) {
            state.results = data.results;
          } else {
            if (res.status == 401) {
              dispatch(verificationFailed());
            }
            state.error = data.message;
          }
        }
      } catch (err) {
        if (err.name == "AbortError") aborted = true;
        state.error = err.message;
      }
    }
    state.isEmptyQuery = !searchQuery;

    if (!aborted) dispatch(searchContactsSlice.actions.setSearchResults(state));
  };
}

export default searchContactsSlice.reducer;

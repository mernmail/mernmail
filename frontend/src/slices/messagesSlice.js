import { createSlice } from "@reduxjs/toolkit";
import { verificationFailed } from "@/slices/authSlice.js";

export const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    loading: true,
    messages: [],
    error: null
  },
  reducers: {
    resetLoading: (state) => {
      state.loading = true;
      state.messages = [];
      state.error = null;
    },
    setMessages: (state, action) => {
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.messages !== undefined)
        state.messages = action.payload.messages;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
    }
  }
});

export const { resetLoading } = messagesSlice.actions;

export function setMessages(signal) {
  return async (dispatch, getState) => {
    const state = { error: null };
    let email = getState().auth.email;
    if (email === null) {
      return;
    }
    let currentMailbox = getState().mailboxes.currentMailbox;
    if (currentMailbox === null) {
      return;
    }
    currentMailbox = currentMailbox
      .replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "")
      .replace(/^[/\\]+/g, "")
      .replace(/[/\\]+$/g, ""); // Sanitize the current mailbox ID
    let aborted = false;
    try {
      const res = await fetch(`/api/receive/mailbox/${currentMailbox}`, {
        method: "GET",
        credentials: "include",
        signal: signal
      });
      const data = await res.json();
      if (res.status == 200) {
        state.messages = data.messages;
      } else {
        if (res.status == 401) {
          dispatch(verificationFailed());
        }
        state.error = data.message;
      }
    } catch (err) {
      if (err.name == "AbortError") aborted = true;
      state.errored = err.message;
    }
    if (!aborted) dispatch(messagesSlice.actions.setMessages(state));
  };
}

export default messagesSlice.reducer;

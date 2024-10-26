import { createSlice } from "@reduxjs/toolkit";
import { verificationFailed } from "@/slices/authSlice.js";

export const messageSlice = createSlice({
  name: "message",
  initialState: {
    loading: true,
    messageData: { messages: [] },
    error: null
  },
  reducers: {
    resetLoading: (state) => {
      state.loading = true;
      state.messageData = { messages: [] };
      state.error = null;
    },
    setMessage: (state, action) => {
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.messageData !== undefined)
        state.messageData = action.payload.messageData;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
    }
  }
});

export const { resetLoading } = messageSlice.actions;

export function loadMessage(signal) {
  return async (dispatch, getState) => {
    const state = { error: null };
    let email = getState().auth.email;
    if (email === null) {
      return;
    }
    let mailboxName = "";
    let messageId = "";
    try {
      const messageMatch = decodeURI(document.location.hash).match(
        /^#message\/((?:(?!\/[^/]*$).)+)\/(.+)/
      );
      if (messageMatch) {
        mailboxName = messageMatch[1];
        messageId = messageMatch[2];
      }
      //eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Hash URL parse error, invalid URL
    }

    mailboxName = mailboxName
      .replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "")
      .replace(/^[/\\]+/g, "")
      .replace(/[/\\]+$/g, ""); // Sanitize the mailbox ID
    messageId = messageId.replace(/\.\./g, ""); // Sanitize the message ID

    let aborted = false;

    if (mailboxName && messageId) {
      try {
        const res = await fetch(
          `/api/receive/message/${encodeURI(mailboxName)}/${encodeURI(messageId)}`,
          {
            method: "GET",
            credentials: "include",
            signal: signal
          }
        );
        const data = await res.json();
        if (res.status == 200) {
          state.messageData = data;
        } else {
          if (res.status == 401) {
            dispatch(verificationFailed());
          }
          state.error = data.message;
        }
      } catch (err) {
        if (err.name == "AbortError") aborted = true;
        state.error = err.message;
      }
    } else {
      state.error = "Invalid message URL";
    }
    if (!aborted) dispatch(messageSlice.actions.setMessage(state));
  };
}

export default messageSlice.reducer;

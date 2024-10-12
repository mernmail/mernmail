import { createSlice, current } from "@reduxjs/toolkit";
import { verificationFailed } from "@/slices/authSlice.js";

export const mailboxesSlice = createSlice({
  name: "mailboxes",
  initialState: {
    loading: true,
    mailboxes: [],
    error: null,
    currentMailbox: null,
    currentMailboxName: null,
    currentMailboxType: "normal"
  },
  reducers: {
    setMailboxes: (state, action) => {
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.mailboxes !== undefined)
        state.mailboxes = action.payload.mailboxes;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
    },
    initCurrentMailbox: (state) => {
      let mailboxName;
      try {
        const mailboxMatch = decodeURI(window.location.hash).match(
          /^#mailbox\/(.*)/
        );
        if (mailboxMatch) mailboxName = mailboxMatch[1];
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Hash URL parse error, use the first mailbox
      }
      let initSelectedBox = current(state.mailboxes)[0];
      const inbox = current(state.mailboxes).find(
        (mailbox) => mailbox.type == "inbox"
      );
      if (inbox) initSelectedBox = inbox;
      if (initSelectedBox || mailboxName) {
        const newCurrentMailboxId = mailboxName || initSelectedBox.id;
        window.location.hash = encodeURI(`#mailbox/${newCurrentMailboxId}`);
        if (state.currentMailbox != newCurrentMailboxId)
          state.currentMailbox = newCurrentMailboxId;
        let currentMailboxName = state.currentMailbox;
        let currentMailboxType = "normal";
        const currentMailboxObject = current(state.mailboxes).find(
          (mailbox) => mailbox.id == state.currentMailbox
        );
        if (currentMailboxObject) {
          currentMailboxName = currentMailboxObject.name;
          currentMailboxType = currentMailboxObject.type;
        }
        state.currentMailboxName = currentMailboxName;
        state.currentMailboxType = currentMailboxType;
      }
    },
    setCurrentMailbox: (state, action) => {
      if (action.payload !== undefined) {
        window.location.hash = encodeURI(`#mailbox/${action.payload}`);
        if (state.currentMailbox != action.payload)
          state.currentMailbox = action.payload;
        let currentMailboxName = state.currentMailbox;
        let currentMailboxType = "normal";
        const currentMailboxObject = current(state.mailboxes).find(
          (mailbox) => mailbox.id == state.currentMailbox
        );
        if (currentMailboxObject) {
          currentMailboxName = currentMailboxObject.name;
          currentMailboxType = currentMailboxObject.type;
        }
        state.currentMailboxName = currentMailboxName;
        state.currentMailboxType = currentMailboxType;
      }
    }
  }
});

export const { initCurrentMailbox, setCurrentMailbox } = mailboxesSlice.actions;

export async function setMailboxes(dispatch, getState) {
  const state = {};
  let credentials = getState().auth.auth;
  if (credentials === null) {
    return;
  }
  try {
    const res = await fetch("/api/receive/mailboxes", {
      method: "GET",
      headers: {
        Authorization:
          credentials.email && credentials.password
            ? "BasicMERNMail " +
              btoa(
                credentials.email.replace(/:/g, "") + ":" + credentials.password
              )
            : undefined
      }
    });
    const data = await res.json();
    if (res.status == 200) {
      state.mailboxes = data.mailboxes;
    } else {
      if (res.status == 401) {
        dispatch(verificationFailed());
      }
      state.error = data.message;
    }
  } catch (err) {
    state.errored = err.message;
  }
  dispatch(mailboxesSlice.actions.setMailboxes(state));
}

export default mailboxesSlice.reducer;

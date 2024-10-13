import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/slices/authSlice.js";
import mailboxesSlice from "@/slices/mailboxesSlice.js";
import messagesSlice from "@/slices/messagesSlice.js";

export default configureStore({
  reducer: {
    auth: authSlice,
    mailboxes: mailboxesSlice,
    messages: messagesSlice
  }
});

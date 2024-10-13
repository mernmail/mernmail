import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/slices/authSlice.js";
import mailboxesSlice from "@/slices/mailboxesSlice.js";
import messagesSlice from "@/slices/messagesSlice.js";
import menuSlice from "@/slices/menuSlice.js";

export default configureStore({
  reducer: {
    auth: authSlice,
    mailboxes: mailboxesSlice,
    messages: messagesSlice,
    menu: menuSlice
  }
});

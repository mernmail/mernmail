import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/slices/authSlice.js";
import mailboxesSlice from "@/slices/mailboxesSlice.js";
import messageSlice from "@/slices/messageSlice.js";
import messagesSlice from "@/slices/messagesSlice.js";
import menuSlice from "@/slices/menuSlice.js";
import viewSlice from "@/slices/viewSlice.js";

export default configureStore({
  reducer: {
    auth: authSlice,
    mailboxes: mailboxesSlice,
    message: messageSlice,
    messages: messagesSlice,
    menu: menuSlice,
    view: viewSlice
  }
});

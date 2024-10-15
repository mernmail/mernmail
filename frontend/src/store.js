import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/slices/authSlice.js";
import mailboxesSlice from "@/slices/mailboxesSlice.js";
import messageSlice from "@/slices/messageSlice.js";
import messagesSlice from "@/slices/messagesSlice.js";
import menuSlice from "@/slices/menuSlice.js";
import viewSlice from "@/slices/viewSlice.js";
import capabilitiesSlice from "@/slices/capabilitiesSlice";

export default configureStore({
  reducer: {
    auth: authSlice,
    capabilities: capabilitiesSlice,
    mailboxes: mailboxesSlice,
    message: messageSlice,
    messages: messagesSlice,
    menu: menuSlice,
    view: viewSlice
  }
});

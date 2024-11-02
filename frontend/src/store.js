import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/slices/authSlice.js";
import capabilitiesSlice from "@/slices/capabilitiesSlice.js";
import mailboxesSlice from "@/slices/mailboxesSlice.js";
import messageSlice from "@/slices/messageSlice.js";
import messagesSlice from "@/slices/messagesSlice.js";
import menuSlice from "@/slices/menuSlice.js";
import searchSlice from "@/slices/searchSlice.js";
import settingsSlice from "@/slices/settingsSlice.js";
import settingsPageSlice from "@/slices/settingsPageSlice.js";
import viewSlice from "@/slices/viewSlice.js";

export default configureStore({
  reducer: {
    auth: authSlice,
    capabilities: capabilitiesSlice,
    mailboxes: mailboxesSlice,
    message: messageSlice,
    messages: messagesSlice,
    menu: menuSlice,
    search: searchSlice,
    settings: settingsSlice,
    settingsPage: settingsPageSlice,
    view: viewSlice
  }
});

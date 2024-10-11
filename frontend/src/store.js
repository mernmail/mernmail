import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/slices/authSlice.js";

export default configureStore({
  reducer: {
    auth: authSlice
  }
});

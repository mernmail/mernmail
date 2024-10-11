import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/slices/authSlice";

export default configureStore({
  reducer: {
    auth: authSlice
  }
});

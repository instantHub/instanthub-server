import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "../features/globalSlice";
import authSlice from "../features/authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "../features/api";
import { adminApiSlice } from "../features/adminApiSlice";
import deductionSlice from "../features/deductionSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    global: globalSlice,
    deductions: deductionSlice,
    [api.reducerPath]: api.reducer,
    [adminApiSlice.reducerPath]: adminApiSlice.reducer,
  },
  // middleware: (getDefault) => getDefault().concat(api.middleware),
  middleware: (getDefault) =>
    getDefault().concat(api.middleware, adminApiSlice.middleware),
});

setupListeners(store.dispatch);

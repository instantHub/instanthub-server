import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "../features/globalSlice";
import userSlice from "../features/userSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api, useCreateCategoryMutation } from "../features/api";

export const store = configureStore({
  reducer: {
    global: globalSlice,
    [api.reducerPath]: api.reducer,
    user: userSlice,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

setupListeners(store.dispatch);

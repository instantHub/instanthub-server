import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminInfo: localStorage.getItem("adminInfo")
    ? JSON.parse(localStorage.getItem("adminInfo"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.adminInfo = action.payload;
      localStorage.setItem("adminInfo", JSON.stringify(action.payload));
      console.log("from authSlice", state.adminInfo);
    },
    logout: (state, action) => {
      // console.log("authSlice logout");
      state.adminInfo = null;
      localStorage.removeItem("adminInfo");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

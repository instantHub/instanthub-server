// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   users: [],
// };

// export const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     getUser: (state, action) => {
//       const newUser = action.payload;
//       // Check if newUser already exists in users array
//       const isDuplicate = state.users.some((user) => user._id === newUser._id);
//       if (!isDuplicate) {
//         state.users.push(newUser);
//       }
//     },
//   },
// });

// // Action creators are generated for each case reducer function
// export const { getUser } = userSlice.actions;

// export default userSlice.reducer;

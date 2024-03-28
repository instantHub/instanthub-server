// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { useGetCategoryQuery } from "./api";

// // Define your API endpoint
// export const fetchCategories = createAsyncThunk(
//   "categories/fetchCategories",
//   async () => {
//     const response = await fetch("http://localhost:8000/api/category"); // Adjust the API endpoint accordingly
//     console.log("response from categorySlice", response.json());
//     return response.json();

//     // NOT WORKING
//     // const { data } = useGetCategoryQuery(); // Adjust the API endpoint accordingly
//     // console.log("response", data.json());
//     // return data.json();
//   }
// );

// const initialState = {
//   categoriesList: [],
//   status: "idle",
//   error: null,
// };

// // Define the categories slice
// const categoriesSlice = createSlice({
//   name: "categories",
//   //   initialState: {
//   //     categoriesList: [],
//   //     status: "idle",
//   //     error: null,
//   //   },
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCategories.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(fetchCategories.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.categories = action.payload;
//       })
//       .addCase(fetchCategories.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message;
//       });
//   },
// });

// // export const { getUser } = userSlice.actions;

// export default categoriesSlice.reducer;

// // Export the action creator
// export const selectAllCategories = (state) => state.categories.categoriesList;
// // console.log("selectAllCategories", selectAllCategories);

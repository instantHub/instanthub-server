import { createSlice } from "@reduxjs/toolkit";
import { addDeductions } from "./deductionSlice";

const initialState = {
  deductions: [],
};

export const laptopDeductionsList = createSlice({
  name: "laptopDeductionsList",
  initialState,
  reducers: {
    addFirst: (state, action) => {
      console.log("addFirst Reducer", action.payload);

      state.deductions[0] = action.payload;
    },
    addSecond: (state, action) => {
      console.log("addSecond Reducer");
      state.deductions[1] = action.payload;
    },
    addThird: (state, action) => {
      console.log("addThird Reducer");
      state.deductions[2] = action.payload;
    },
    addRest: (state, action) => {
      console.log("addRest Reducer", action.payload);
      //   state.deductions.push(action.payload);
      //   state.deductions = [...state.deductions, action.payload];

      // Check if action.payload already exists in deductions
      const isExisting = state.deductions.some((condition) => {
        return condition.conditionName === action.payload.conditionName;
      });
      if (!isExisting) {
        state.deductions.push(action.payload);
      }
    },

    clearLaptopDeductionsList: (state, action) => {
      console.log("clearLaptopDeductions reducer");

      return {
        ...state,
        deductions: [],
      };
    },
  },
});

export const {
  addFirst,
  addSecond,
  addThird,
  addRest,
  clearLaptopDeductionsList,
} = laptopDeductionsList.actions;
export default laptopDeductionsList.reducer;

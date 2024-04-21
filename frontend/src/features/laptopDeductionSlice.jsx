import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toBeDeducted: 0,
  processor: {},
  hardDisk: {},
  ram: {},
  deductions: [],
};

export const laptopDeductionSlice = createSlice({
  name: "laptopDeductions",
  initialState,
  reducers: {
    addProcessor: (state, action) => {
      console.log("addProcessor Reducer");
      state.processor = {
        conditionLabel: action.payload.conditionLabel,
        priceDrop: action.payload.priceDrop,
      };
    },
    addHardDisk: (state, action) => {
      console.log("addHardDisk Reducer");
      state.hardDisk = {
        conditionLabel: action.payload.conditionLabel,
        priceDrop: action.payload.priceDrop,
      };
    },
    addRam: (state, action) => {
      console.log("addRam Reducer");
      state.ram = {
        conditionLabel: action.payload.conditionLabel,
        priceDrop: action.payload.priceDrop,
      };
    },

    addLaptopDeductions: (state, action) => {
      console.log("addLaptopDeductions Reducer");
      console.log(action.payload);

      // Check if action.payload already exists in deductions
      const isExisting = state.deductions.some((condition) => {
        return condition.conditionLabel === action.payload.conditionLabel;
      });
      if (!isExisting) {
        return {
          ...state,
          toBeDeducted: state.toBeDeducted + action.payload.priceDrop,
          deductions: [...state.deductions, action.payload],
        };
      }
    },
    removeLaptopDeductions: (state, action) => {
      console.log("removeLaptopDeductions reducer");

      // Check if action.payload already exists in deductions
      const isExisting = state.deductions.some((condition) => {
        return condition.conditionLabel === action.payload.conditionLabel;
      });

      if (isExisting) {
        // Filter out the item from the deductions array if it exists
        const updatedDeductions = state.deductions.filter(
          (condition) =>
            condition.conditionLabel !== action.payload.conditionLabel
        );

        return {
          ...state,
          toBeDeducted: state.toBeDeducted - Number(action.payload.priceDrop),
          deductions: updatedDeductions,
        };
      }
    },
    clearLaptopDeductions: (state, action) => {
      console.log("clearLaptopDeductions reducer");

      return {
        ...state,
        processor: {},
        hardDisk: {},
        ram: {},
        toBeDeducted: 0,
        deductions: [],
      };
    },
  },
});

export const {
  addProcessor,
  addHardDisk,
  addRam,
  addLaptopDeductions,
  removeLaptopDeductions,
  clearLaptopDeductions,
} = laptopDeductionSlice.actions;
export default laptopDeductionSlice.reducer;

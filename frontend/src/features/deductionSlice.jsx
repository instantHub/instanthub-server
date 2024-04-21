import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productName: "",
  productImage: "",
  productCategory: "",
  productAge: {},
  getUpTo: {
    variantName: "",
    price: undefined,
  },
  toBeDeducted: 0,
  deductions: [],
};

export const deductionSlice = createSlice({
  name: "deductions",
  initialState,
  reducers: {
    setGetUpto: (state, action) => {
      console.log("setGetUpto reducer");
      // console.log(
      //   action.payload.productName,
      //   action.payload.productImage,
      //   action.payload.variantName,
      //   action.payload.price
      // );
      const { productName, productImage, productCategory, variantName, price } =
        action.payload;
      return {
        ...state,
        productName,
        productImage,
        productCategory,
        getUpTo: {
          variantName,
          price,
        },
      };
    },
    addDeductions: (state, action) => {
      console.log("addDeduction Reducer");
      console.log(action.payload);

      // Check if action.payload already exists in deductions
      const isExisting = state.deductions.some((condition) => {
        return condition.conditionLabel === action.payload.conditionLabel;
      });
      if (!isExisting) {
        return {
          ...state,
          toBeDeducted: state.toBeDeducted + Number(action.payload.priceDrop),
          deductions: [...state.deductions, action.payload],
        };
      }
    },
    addProductAge: (state, action) => {
      console.log("addProductAge reducer");
      return {
        ...state,
        productAge: {
          conditionLabel: action.payload.conditionLabel,
          priceDrop: action.payload.priceDrop,
        },
      };
    },
    removeDeductions: (state, action) => {
      console.log("removeDeductions reducer");

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
    clearDeductions: (state, action) => {
      return {
        ...state,
        toBeDeducted: 0,
        productAge: {},
        deductions: [],
      };
    },
  },
});

export const {
  setGetUpto,
  addDeductions,
  addProductAge,
  clearDeductions,
  removeDeductions,
} = deductionSlice.actions;
export default deductionSlice.reducer;

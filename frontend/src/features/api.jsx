import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import {user} from '../../../backend/routes/management'

console.log("env", import.meta.env.VITE_APP_BASE_URL);

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    // baseUrl: "http://localhost:8000/",
  }),
  // reducerPath: "adminApi",
  reducerPath: "API",
  tagTypes: ["User", "Conditions", "ConditionLabels"],
  endpoints: (build) => ({
    getUser: build.query({
      query: (id) => `api/user/${id}`,
      providesTags: ["User"],
    }),
    getCategory: build.query({
      // query: () => "/api/category?_sort=name&_order=desc",
      query: () => "/api/category",
    }),
    createCategory: build.mutation({
      query: (catData) => ({
        url: `api/category/add-category`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: catData,
      }),
    }),
    uploadFileHandler: build.mutation({
      query: (data) => ({
        url: "/api/upload",
        method: "POST",
        body: data,
      }),
    }),
    getAllBrand: build.query({
      query: () => `/api/brand`,
    }),
    getBrand: build.query({
      query: (catId) => `/api/brand/${catId}`,
    }),
    createBrand: build.mutation({
      query: (data) => ({
        url: "/api/brand/add-brand",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
    }),
    getAllProducts: build.query({
      query: () => `/api/products`,
    }),
    getProducts: build.query({
      query: (brandId) => `/api/products/${brandId}`,
    }),
    getProductDetails: build.query({
      query: (prodId) => `/api/products/product-details/${prodId}`,
    }),
    getProductQuestions: build.query({
      query: (prodId) => `/api/products/product/product-questions/${prodId}`,
    }),
    createProduct: build.mutation({
      query: (data) => ({
        url: "/api/products/add-product",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
    }),
    getConditions: build.query({
      query: () => `/api/questions/conditions`,
      providesTags: ["Conditions"],
    }),
    createConditions: build.mutation({
      query: (data) => ({
        url: "/api/questions/add-conditions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
      invalidatesTags: ["Conditions"],
    }),
    updateCondition: build.mutation({
      query: ({ conditionId, data }) => ({
        url: `/api/questions/update-condition/${conditionId}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteCondition: build.mutation({
      query: ({ category, conditionId }) => ({
        url: `/api/questions/delete-condition?category=${category}&conditionId=${conditionId}`,
        method: "DELETE",
        // body: data,
      }),
      invalidatesTags: ["ConditionLabels"],
    }),
    getConditionLabels: build.query({
      query: () => `/api/questions/conditionlabels`,
      providesTags: ["ConditionLabels"],
    }),
    createConditionLabels: build.mutation({
      query: (data) => ({
        url: "/api/questions/add-conditionlabel",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
      invalidatesTags: ["ConditionLabels"],
    }),
    updateConditionLabel: build.mutation({
      query: ({ conditionLabelId, data }) => ({
        url: `/api/questions/update-conditionlabel/${conditionLabelId}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteConditionLabel: build.mutation({
      query: ({ category, conditionLabelId }) => ({
        url: `/api/questions/delete-conditionlabel?category=${category}&conditionLabelId=${conditionLabelId}`,
        method: "DELETE",
        // body: data,
      }),
      invalidatesTags: ["ConditionLabels"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUploadFileHandlerMutation,
  useGetAllBrandQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useCreateProductMutation,
  useGetAllProductsQuery,
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetProductQuestionsQuery,
  useGetConditionsQuery,
  useCreateConditionsMutation,
  useUpdateConditionMutation,
  useDeleteConditionMutation,
  useGetConditionLabelsQuery,
  useCreateConditionLabelsMutation,
  useUpdateConditionLabelMutation,
  useDeleteConditionLabelMutation,
} = api;

// useGetAllQuestionsQuery,
// useGetQuestionsQuery,
// useCreateQuestionMutation,
// useUpdateQuestionMutation,

// getAllQuestions: build.query({
//   query: () => `/api/questions`,
// }),
// getQuestions: build.query({
//   query: (questionsId) => `/api/questions/${questionsId}`,
// }),
// createQuestion: build.mutation({
//   query: (data) => ({
//     url: "/api/questions/add-questions",
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: data,
//   }),
// }),
// updateQuestion: build.mutation({
//   query: ({ questionId, data }) => ({
//     url: `/api/questions/update-condition/${conditionId}`,
//     method: "PUT",
//     body: data,
//   }),
// }),

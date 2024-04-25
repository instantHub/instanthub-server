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
  tagTypes: [
    "User",
    "CreateBrands",
    "Brands",
    "Categories",
    "Products",
    "Conditions",
    "ConditionLabels",
    "Orders",
    "Sliders",
    "Series",
  ],
  endpoints: (build) => ({
    getCategory: build.query({
      // query: () => "/api/category?_sort=name&_order=desc",
      query: () => "/api/category",
      providesTags: ["Categories"],
    }),
    uploadCategoryImage: build.mutation({
      query: (data) => ({
        url: "/api/upload/categories",
        method: "POST",
        body: data,
      }),
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
      invalidatesTags: ["Categories"],
    }),
    updateCategory: build.mutation({
      query: ({ catId, data }) => ({
        url: `/api/category/update-category/${catId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: build.mutation({
      query: (catId) => ({
        url: `/api/category/delete-category/${catId}`,
        method: "DELETE",
        // body: data,
      }),
      invalidatesTags: ["Categories"],
    }),
    uploadFileHandler: build.mutation({
      query: (data) => ({
        url: "/api/upload",
        method: "POST",
        body: data,
      }),
    }),
    uploadBrandImage: build.mutation({
      query: (data) => ({
        url: "/api/upload/brands",
        method: "POST",
        body: data,
      }),
    }),
    getAllBrand: build.query({
      query: () => `/api/brand`,
      providesTags: ["Brands"],
    }),
    getBrand: build.query({
      query: (catId) => `/api/brand/${catId}`,
      // providesTags: ["Brands"],
      providesTags: ["CreateBrands", "Brands"],
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
      invalidatesTags: ["Brands"],
    }),
    updateBrand: build.mutation({
      query: ({ brandId, data }) => ({
        url: `/api/brand/update-brand/${brandId}`,
        method: "PUT",
        // credentials: "include",
        body: data,
      }),
      invalidatesTags: ["Brands"],
    }),
    deleteBrand: build.mutation({
      query: (brandId) => ({
        url: `/api/brand/delete-brand/${brandId}`,
        method: "DELETE",
        // body: data,
      }),
      invalidatesTags: ["Brands"],
    }),
    // getAllProducts: build.query({
    //   query: ({ search, limit }) => ({
    //     url: `/api/products?search=${search}`,
    //     method: "GET",
    //     // params: search,
    //   }),
    //   providesTags: ["Products"],
    // }),
    // getAllProducts: build.query({
    //   query: ({ search, limit }) => {
    //     const params = { search };
    //     if (limit) {
    //       params.limit = limit;
    //     }
    //     return {
    //       url: `/api/products`,
    //       method: "GET",
    //       params,
    //     };
    //   },
    //   providesTags: ["Products"],
    // }),
    getAllProducts: build.query({
      query: ({ page, limit, search }) => ({
        url: `/api/products`,
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["Products"],
    }),
    getProducts: build.query({
      query: ({ brandId, search }) => ({
        url: `/api/products/${brandId}?search=${search}`,
      }),
      providesTags: ["Products"],
    }),
    getProductDetails: build.query({
      query: (prodId) => `/api/products/product-details/${prodId}`,
      providesTags: ["Products"],
    }),
    getProductQuestions: build.query({
      query: (prodId) => `/api/products/product/product-questions/${prodId}`,
      providesTags: ["Products"],
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
      providesTags: ["Products"],
    }),
    uploadProductImage: build.mutation({
      query: (data) => ({
        url: "/api/upload/products",
        method: "POST",
        body: data,
      }),
    }),
    updateProduct: build.mutation({
      query: ({ productId, data }) => ({
        url: `/api/products/update-product/${productId}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    updatePriceDrop: build.mutation({
      query: ({ productId, data }) => ({
        url: `/api/products/update-pricedrop/${productId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation({
      query: (productId) => ({
        url: `/api/products/delete-product/${productId}`,
        method: "DELETE",
        // body: data,
      }),
      invalidatesTags: ["Products"],
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
      invalidatesTags: ["Conditions"],
    }),
    deleteCondition: build.mutation({
      query: ({ category, conditionId }) => ({
        url: `/api/questions/delete-condition?category=${category}&conditionId=${conditionId}`,
        method: "DELETE",
        // body: data,
      }),
      invalidatesTags: ["Conditions"],
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
    uploadConditionLabelsImage: build.mutation({
      query: (data) => ({
        url: "/api/upload/condition-labels",
        method: "POST",
        body: data,
      }),
    }),
    updateConditionLabel: build.mutation({
      query: ({ conditionLabelId, data }) => ({
        url: `/api/questions/update-conditionlabel/${conditionLabelId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConditionLabels"],
    }),
    deleteConditionLabel: build.mutation({
      query: ({ category, conditionLabelId }) => ({
        url: `/api/questions/delete-conditionlabel?category=${category}&conditionLabelId=${conditionLabelId}`,
        method: "DELETE",
        // body: data,
      }),
      invalidatesTags: ["ConditionLabels"],
    }),
    getOrdersList: build.query({
      query: () => `/api/orders`,
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation({
      query: (data) => ({
        url: "/api/orders/create-order",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    uploadCustomerProofImage: build.mutation({
      query: (data) => ({
        url: "/api/upload/customer-proof",
        method: "POST",
        body: data,
      }),
    }),
    orderReceived: build.mutation({
      query: (data) => ({
        url: `/api/orders/order-received`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: build.mutation({
      query: (orderId) => ({
        url: `/api/orders/delete-order/${orderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
    getSlidersList: build.query({
      query: () => `/api/sliders`,
      providesTags: ["Sliders"],
    }),
    createSlider: build.mutation({
      query: (data) => ({
        url: "/api/sliders/create-slider",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
      invalidatesTags: ["Sliders"],
    }),
    uploadSliderImage: build.mutation({
      query: (data) => ({
        url: "/api/upload/sliders",
        method: "POST",
        body: data,
      }),
    }),
    updateSlider: build.mutation({
      query: ({ sliderId, data }) => ({
        url: `/api/sliders/update-slider/${sliderId}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
      invalidatesTags: ["Sliders"],
    }),
    deleteSlider: build.mutation({
      query: (sliderId) => ({
        url: `/api/sliders/delete-slider/${sliderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sliders"],
    }),
    getAllSeries: build.query({
      query: () => `/api/series`,
      providesTags: ["Series"],
    }),
    getBrandSeries: build.query({
      query: (brandId) => `/api/series/${brandId}`,
      // providesTags: ["Brands"],
      providesTags: ["Series"],
    }),
    createSeries: build.mutation({
      query: (data) => ({
        url: "/api/series/create-series",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
      invalidatesTags: ["Series"],
    }),
    updateSeries: build.mutation({
      query: ({ seriesId, data }) => ({
        url: `/api/series/update-series/${seriesId}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
      invalidatesTags: ["Series"],
    }),
    deleteSeries: build.mutation({
      query: (seriesId) => ({
        url: `/api/series/delete-series/${seriesId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Series"],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useUploadCategoryImageMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadFileHandlerMutation,
  useUploadBrandImageMutation,
  useGetAllBrandQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useCreateProductMutation,
  useUploadProductImageMutation,
  useUpdateProductMutation,
  useGetAllProductsQuery,
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetProductQuestionsQuery,
  useUpdatePriceDropMutation,
  useDeleteProductMutation,
  useGetConditionsQuery,
  useCreateConditionsMutation,
  useUpdateConditionMutation,
  useDeleteConditionMutation,
  useGetConditionLabelsQuery,
  useCreateConditionLabelsMutation,
  useUploadConditionLabelsImageMutation,
  useUpdateConditionLabelMutation,
  useDeleteConditionLabelMutation,
  useGetOrdersListQuery,
  useCreateOrderMutation,
  useUploadCustomerProofImageMutation,
  useOrderReceivedMutation,
  useDeleteOrderMutation,
  useGetSlidersListQuery,
  useCreateSliderMutation,
  useUploadSliderImageMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
  useGetAllSeriesQuery,
  useGetBrandSeriesQuery,
  useCreateSeriesMutation,
  useUpdateSeriesMutation,
  useDeleteSeriesMutation,
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

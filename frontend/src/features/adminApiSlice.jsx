import { api } from "./api";

// const ADMIN_URL = "http://localhost:8000/api";
const ADMIN_URL = "/api";

export const adminApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/auth`,
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }),
    }),
    adminProfile: builder.query({
      query: () => ({
        url: `${ADMIN_URL}/admin-profile`,
        method: "GET",
        credentials: "include",
        // body: data,
      }),
    }),
    updateAdmin: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/update-admin`,
        method: "PUT",
        credentials: "include",
        body: data,
      }),
    }),
    adminLogout: builder.mutation({
      query: () => ({
        url: `${ADMIN_URL}/logout`,
        method: "POST",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useAdminProfileQuery,
  useUpdateAdminMutation,
  useAdminLogoutMutation,
} = adminApiSlice;

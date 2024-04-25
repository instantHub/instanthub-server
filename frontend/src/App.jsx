import { useState } from "react";
import "./App.css";
import {
  createBrowserRouter as Router,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";
// Client side
import ClientLayout from "./components/Layout";
import ClientHome from "./pages/home/Home";
import ClientNavbar from "./components/Navbar";
import ClientBrands from "./pages/brands/Brands";
import ClientProducts from "./pages/products/Products";
import ClientProductDetail from "./pages/products/ProductDetail";
import ClientProductDeductions from "./pages/products/ProductQuestions";
import ClientProductFinalPrice from "./pages/products/ProductFinalPrice";

// Admin side
import PrivateRoute from "./admin/components/PrivateRoute";
import AdminSignIn from "./admin/pages/signIn & signup/SignIn";
import AdminSignUp from "./admin/pages/signIn & signup/SignUp";
import UpdateAdminProfile from "./admin/components/UpdateAdmin";
import AdminDashboard from "./admin/pages/dashboard/Dashboard";
import AdminProducts from "./admin/pages/products/Products";
import AdminCreateProducts from "./admin/pages/products/CreateProducts";
import AdminUpdateProduct from "./admin/pages/products/UpdateProduct";
import AdminBrands from "./admin/pages/brands/Brands";
import AdminBrandsList from "./admin/pages/brands/BrandsList";
import AdminUpdateBrand from "./admin/pages/brands/UpdateBrand";
import AdminCreateBrand from "./admin/pages/brands/CreateBrand";
import AdminCategories from "./admin/pages/categories/CategoriesList";
import AdminCreateCategory from "./admin/pages/categories/CreateCategory";
import AdminCategoriesList from "./admin/pages/categories/CategoriesList";
import AdminUpdateCategory from "./admin/pages/categories/UpdateCategory";
import AdminCreateSeries from "./admin/pages/series/CreateSeries";
import AdminUpdateSeries from "./admin/pages/series/UpdateSeries";
import AdminSeriesList from "./admin/pages/series/SeriesList";
import AdminCreateConditions from "./admin/pages/questions/CreateCondtions";
import AdminUpdateCondition from "./admin/pages/questions/UpdateCondition";
import AdminUpdateConditionLabel from "./admin/pages/questions/UpdateConditionLabel";
import AdminProductsList from "./admin/pages/products/ProductsList";
import AdminProductQuestions from "./admin/pages/products/ProductQuestionsList";
import AdminConditionsList from "./admin/pages/questions/ConditionsList";
import AdminConditionLabelsList from "./admin/pages/questions/ConditionLabelsList";
import AdminCreateSlider from "./admin/pages/sliders/CreateSlider";
import AdminSlidersList from "./admin/pages/sliders/SlidersList";
import AdminUpdateSlider from "./admin/pages/sliders/UpdateSlider";
import AdminOrdersList from "./admin/pages/orders/OrdersList";

import Admin from "./admin/Admin";
import AdminLayout from "./admin/pages/layout/Layout";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const router = Router([
    {
      path: "/",
      // element: <ClientNavbar />,
      element: <ClientLayout />,
      children: [
        {
          index: true,
          element: <ClientHome />,
        },
        {
          path: "/categories/brands/:catId",
          element: <ClientBrands />,
        },
        {
          path: "/categories/brands/products/:brandId",
          element: <ClientProducts />,
        },
        {
          path: "/categories/brands/productDetails/:prodId",
          element: <ClientProductDetail />,
        },
        {
          path: "/sell/deductions",
          element: <ClientProductDeductions />,
          // children: [
          //   {
          //     path: "finalPrice",
          //     element: <ClientProductFinalPrice />,
          //   },
          // ],
        },
        {
          path: "/sell/deductions/finalPrice",
          element: <ClientProductFinalPrice />,
        },
      ],
    },
    {
      path: "/admin/login",
      element: <AdminSignIn />,
    },
    {
      path: "/admin/signup",
      // element: <AdminSignUp />, // Undo for new admin registration
      element: <Navigate to="/admin/login" replace />,
    },
    {
      path: "",
      element: <PrivateRoute />,
      children: [
        {
          path: "/admin",
          element: <Admin />,
          children: [
            {
              index: true,
              element: <Navigate to="/admin/dashboard" replace />,
            },
            {
              path: "/admin/dashboard",
              element: <AdminDashboard />,
            },
            {
              path: "/admin/update-profile",
              element: <UpdateAdminProfile />,
            },
            {
              path: "/admin/products",
              element: <AdminProducts />,
            },
            {
              path: "/admin/productsList",
              element: <AdminProductsList />,
            },
            {
              path: "/admin/add-products",
              element: <AdminCreateProducts />,
            },
            {
              path: "/admin/update-product/:productId",
              element: <AdminUpdateProduct />,
            },
            {
              path: "/admin/products/product-questions/:productId",
              element: <AdminProductQuestions />,
            },
            {
              path: "/admin/categories",
              element: <AdminCategories />,
            },
            {
              path: "/admin/add-category",
              element: <AdminCreateCategory />,
            },
            {
              path: "/admin/categories-list",
              element: <AdminCategoriesList />,
            },
            {
              path: "/admin/update-category/:catId",
              element: <AdminUpdateCategory />,
            },
            {
              path: "/admin/brands",
              element: <AdminBrands />,
            },
            {
              path: "/admin/add-brands",
              element: <AdminCreateBrand />,
            },
            {
              path: "/admin/brands-list",
              element: <AdminBrandsList />,
            },
            {
              path: "/admin/update-brand/:brandId",
              element: <AdminUpdateBrand />,
            },
            {
              path: "/admin/add-series",
              element: <AdminCreateSeries />,
            },
            {
              path: "/admin/series-list",
              element: <AdminSeriesList />,
            },
            {
              path: "/admin/update-series/:seriesId",
              element: <AdminUpdateSeries />,
            },
            {
              path: "/admin/questions",
              element: <AdminCreateConditions />,
            },
            {
              path: "/admin/conditionsList",
              element: <AdminConditionsList />,
            },
            {
              path: "/admin/conditionLabelsList",
              element: <AdminConditionLabelsList />,
            },
            {
              path: "/admin/updateCondition/:conditionId",
              element: <AdminUpdateCondition />,
            },
            {
              path: "/admin/updateConditionLabel/:conditionLabelId",
              element: <AdminUpdateConditionLabel />,
            },
            {
              path: "/admin/add-sliders",
              element: <AdminCreateSlider />,
            },
            {
              path: "/admin/sliders-list",
              element: <AdminSlidersList />,
            },
            {
              path: "/admin/update-sliders/:sliderId",
              element: <AdminUpdateSlider />,
            },
            {
              path: "/admin/orders",
              element: <AdminOrdersList />,
            },
          ],
        },
      ],
    },
    // {
    //   path: "/admin",
    //   element: <Admin />,
    //   children: [
    //     {
    //       index: true,
    //       element: <Navigate to="/admin/dashboard" replace />,
    //     },
    //     {
    //       path: "/admin/dashboard",
    //       element: <AdminDashboard />,
    //     },
    //     {
    //       path: "/admin/products",
    //       element: <AdminProducts />,
    //     },
    //     {
    //       path: "/admin/productsList",
    //       element: <AdminProductsList />,
    //     },
    //     {
    //       path: "/admin/add-products",
    //       element: <AdminCreateProducts />,
    //     },
    //     {
    //       path: "/admin/products/product-questions/:productId",
    //       element: <AdminProductQuestions />,
    //     },
    //     {
    //       path: "/admin/categories",
    //       element: <AdminCategories />,
    //     },
    //     {
    //       path: "/admin/add-category",
    //       element: <AdminCreateCategory />,
    //     },
    //     {
    //       path: "/admin/brands",
    //       element: <AdminBrands />,
    //     },
    //     {
    //       path: "/admin/add-brands",
    //       element: <AdminCreateBrand />,
    //     },
    //     {
    //       path: "/admin/brands-list",
    //       element: <AdminBrandsList />,
    //     },
    //     {
    //       path: "/admin/update-brand/:brandId",
    //       element: <AdminUpdateBrand />,
    //     },
    //     {
    //       path: "/admin/questions",
    //       element: <AdminCreateConditions />,
    //     },
    //     {
    //       path: "/admin/conditionsList",
    //       element: <AdminConditionsList />,
    //     },
    //     {
    //       path: "/admin/conditionLabelsList",
    //       element: <AdminConditionLabelsList />,
    //     },
    //     {
    //       path: "/admin/updateCondition/:conditionId",
    //       element: <AdminUpdateCondition />,
    //     },
    //     {
    //       path: "/admin/updateConditionLabel/:conditionLabelId",
    //       element: <AdminUpdateConditionLabel />,
    //     },
    //     {
    //       path: "/admin/orders",
    //       element: <AdminOrdersList />,
    //     },
    //   ],
    // },
  ]);
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;

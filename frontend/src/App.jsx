import { useState } from "react";
import "./App.css";
import {
  createBrowserRouter as Router,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";
import ElectronicsComponent from "./pages/brands/ElectronicsComponent";
// Client side
import ClientHome from "./pages/home/Home";
import ClientNavbar from "./components/navbar/Navbar";
import ClientBrands from "./pages/brands/Brands";
import ClientProducts from "./pages/products/Products";
import ClientProductDetail from "./pages/products/ProductDetail";

// Admin side
import AdminDashboard from "./admin/pages/dashboard/Dashboard";
import AdminProducts from "./admin/pages/products/Products";
import AdminCreateProducts from "./admin/components/CreateProducts";
import AdminBrands from "./admin/pages/brands/Brands";
import AdminCreateBrand from "./admin/components/CreateBrand";
import AdminCategories from "./admin/pages/categories/Categories";
import AdminCreateCategory from "./admin/components/CreateCategory";
import AdminCreateQuestions from "./admin/components/CreateQuestions";
import AdminQuestionsList from "./admin/pages/questions/QuestionsList";

import Admin from "./admin/Admin";
import AdminLayout from "./admin/pages/layout/Layout";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const router = Router([
    {
      path: "/",
      element: <ClientNavbar />,
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
          // path: "/categories/brands/products/:brandId",
          path: "/categories/brands/products/:brandId",
          element: <ClientProducts />,
        },
        {
          path: "/categories/brands/productDetails/:prodId",
          element: <ClientProductDetail />,
        },
        // {
        //   path: "/test",
        //   element: <ElectronicsComponent />,
        // },
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
    //       element: <Dashboard />,
    //       children: [
    //         {
    //           path: "/admin/dashboard/products",
    //           element: <Products />,
    //         },
    //       ],
    //     },
    //   ],
    // },
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
          path: "/admin/products",
          element: <AdminProducts />,
        },
        {
          path: "/admin/add-products",
          element: <AdminCreateProducts />,
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
          path: "/admin/brands",
          element: <AdminBrands />,
        },
        {
          path: "/admin/add-brands",
          element: <AdminCreateBrand />,
        },
        {
          path: "/admin/questions",
          element: <AdminCreateQuestions />,
        },
        {
          path: "/admin/questionsList",
          element: <AdminQuestionsList />,
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;

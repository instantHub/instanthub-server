import { useState } from "react";
import "./App.css";
import Home from "./pages/home/Home";
import {
  createBrowserRouter as Router,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Brands from "./pages/brands/Brands";
import ElectronicsComponent from "./pages/brands/ElectronicsComponent";
import Admin from "./admin/Admin";
import Dashboard from "./admin/pages/dashboard/Dashboard";
import AdminLayout from "./admin/pages/layout/Layout";
import Products from "./admin/pages/products/Products";
import AddProducts from "./admin/components/AddProducts";
import CreateCategory from "./admin/components/CreateCategory";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const router = Router([
    {
      path: "/",
      element: <Navbar />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "/brands/:brandname",
          element: <Brands />,
        },
        {
          path: "/test",
          element: <ElectronicsComponent />,
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
          element: <Dashboard />,
        },
        {
          path: "/admin/products",
          element: <Products />,
        },
        {
          path: "/admin/add-products",
          element: <AddProducts />,
        },
        {
          path: "/admin/add-category",
          element: <CreateCategory />,
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

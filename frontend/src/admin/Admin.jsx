import React from "react";
import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import Layout from "./pages/layout/Layout";

const Admin = () => {
  return (
    <>
      <Layout />
    </>
  );
};

export default Admin;

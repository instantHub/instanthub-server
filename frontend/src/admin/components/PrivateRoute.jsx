import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { adminInfo } = useSelector((state) => state.auth);
  return adminInfo ? <Outlet /> : <Navigate to={"/admin/login"} replace />;
};

export default PrivateRoute;

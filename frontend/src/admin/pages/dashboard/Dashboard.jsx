import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  console.log("dashboard");

  const dispatch = useDispatch();

  return (
    <>
      <div>
        {/* {isLoading ? <h1>Loading...</h1> : <h3>bjhb {data.name}</h3>} */}
        <h3>Dashboard</h3>
      </div>
      <Outlet />
    </>
  );
};

export default Dashboard;

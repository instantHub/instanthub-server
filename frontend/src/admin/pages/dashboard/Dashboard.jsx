import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";

import { useGetUserQuery } from "../../../features/api";
import { getUser } from "../../../features/userSlice";

const Dashboard = () => {
  // const userData = useSelector((state) => state.user);
  console.log("dashboard");

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.global.userId);
  const { data, isLoading } = useGetUserQuery(userId);

  return (
    <>
      <div>
        {/* <h2>{JSON.stringify(userData)}</h2> */}
        <hr />
        {/* {!isLoading &&
        data.map((d) => {
          <h3>bjhb {d}</h3>;
        })} */}

        {isLoading ? <h1>Loading...</h1> : <h3>bjhb {data.name}</h3>}
      </div>
      <Outlet />
    </>
  );
};

export default Dashboard;

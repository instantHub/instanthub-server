import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import {
  useGetCategoryQuery,
  useGetAllBrandQuery,
  useGetAllProductsQuery,
  useGetOrdersListQuery,
} from "../../../features/api";

const Dashboard = () => {
  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoryQuery();
  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandQuery();
  const { data: productsData, isLoading: productsLoading } =
    useGetAllProductsQuery({ search: "" });
  const { data: ordersData, isLoading: ordersLoading } =
    useGetOrdersListQuery();

  let ordersPending = undefined;
  let ordersReceived = 0;

  useEffect(() => {
    if (!ordersLoading) {
      ordersPending = ordersData.filter((order) => {
        console.log(order.status.toLowerCase());

        order.status == "pending";
      });
      // ordersData.map((order) => {
      //   console.log(order.status.toLowerCase());
      //   if (order.status.toLowerCase() === "pending") {
      //     ordersPending = ordersPending + 1;
      //   } else if (order.status.toLowerCase() === "received") {
      //     ordersReceived = ordersReceived + 1;
      //   }
      // });
    }
  }, [ordersData]);

  console.log(ordersPending);

  const dispatch = useDispatch();

  return (
    <>
      <div className="grid grid-cols-4 mx-10 my-20 gap-2 items-center">
        {/* {isLoading ? <h1>Loading...</h1> : <h3>bjhb {data.name}</h3>} */}
        {!categoryLoading && (
          <div className="bg-orange-500 text-center text-white pt-4">
            <div className="text-start pl-4 my-2 text-lg">
              Total {categoryData.length} Categories
            </div>
            <div className="py-2 text-center bg-orange-600">
              <h1 className="">More Info</h1>
            </div>
          </div>
        )}

        {!brandsLoading && (
          <div className="bg-green-500 text-center text-white pt-4 ">
            <div className="text-start pl-4 my-2 text-lg">
              Total {brandsData.length} Brands
            </div>
            <div className="py-2 text-center bg-green-600">
              <h1 className="">More Info</h1>
            </div>
          </div>
        )}

        {!productsLoading && (
          <div className="bg-blue-500 text-center text-white pt-4 ">
            <div className="text-start pl-4 my-2 text-lg">
              Total {productsData.totalProducts} Products
            </div>
            <div className="py-2 text-center bg-blue-600">
              <h1 className="">More Info</h1>
            </div>
          </div>
        )}
        {!ordersLoading && (
          <>
            <div className="bg-yellow-500 text-center text-white pt-4 ">
              <div className="text-start pl-4 my-2 text-lg">
                Total {ordersData.length} Orders
              </div>
              <div className="py-2 text-center bg-yellow-600">
                <h1 className="">More Info</h1>
              </div>
            </div>
            <div className="bg-emerald-500 text-center text-white pt-4 ">
              <div className="text-start pl-4 my-2 text-lg">
                Total {ordersPending} Orders Pending
              </div>
              <div className="py-2 text-center bg-emerald-600">
                <h1 className="">More Info</h1>
              </div>
            </div>
            <div className="bg-cyan-500 text-center text-white pt-4 ">
              <div className="text-start pl-4 my-2 text-lg">
                Total {ordersReceived} Orders Received / Completed
              </div>
              <div className="py-2 text-center bg-cyan-600">
                <h1 className="">More Info</h1>
              </div>
            </div>
          </>
        )}
      </div>
      <Outlet />
    </>
  );
};

export default Dashboard;

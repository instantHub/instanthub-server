import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useGetCategoryQuery,
  useGetAllBrandQuery,
  useDeleteBrandMutation,
  useGetOrdersListQuery,
} from "../../../features/api";
import { Link } from "react-router-dom";

const OrdersList = () => {
  const { data: ordersData, isLoading: ordersLoading } =
    useGetOrdersListQuery();

  if (!ordersLoading) {
    console.log(ordersData);
  }

  const [selectedCondition, setSelectedCondition] = useState("");

  const handleConditionChange = (e) => {
    setSelectedCondition(e.target.value);
  };

  const handleDelete = async (brandId) => {
    console.log("handledelete", brandId);
    await deleteBrand(brandId);
  };

  return (
    //Products based on the Category selected
    <div className="p-4 bg-black">
      <h2 className="text-white text-lg font-bold mb-4">Orders Table</h2>
      <div className="mb-4">
        <h1>Orders List</h1>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-white bg-gray-800">Customer Name</th>
            <th className="px-4 py-2 text-white bg-gray-800">Product</th>
            <th className="px-4 py-2 text-white bg-gray-800">Email</th>
            <th className="px-4 py-2 text-white bg-gray-800">Phone</th>
            <th className="px-4 py-2 text-white bg-gray-800">Address</th>
            <th className="px-4 py-2 text-white bg-gray-800">OfferPrice</th>
            <th className="px-4 py-2 text-white bg-gray-800">Status</th>
            <th className="px-4 py-2 text-white bg-gray-800">Update Order</th>
            <th className="px-4 py-2 text-white bg-gray-800">Delete Order</th>
          </tr>
        </thead>

        <tbody className="text-center">
          {/* Products when Category is selected */}
          {!ordersLoading &&
            ordersData.map((order, index) => (
              <tr
                key={`${order._id}-${index}`}
                className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
              >
                {/* <td className="px-4 py-2">{product.category.name}</td> */}
                <td className="px-4 py-2">{order.customerName}</td>
                <td className="px-4 py-2">{order.productId.name}</td>
                <td className="px-4 py-2">{order.email}</td>
                <td className="px-4 py-2">{order.phone}</td>
                <td className="px-4 py-2">{order.address}</td>
                <td className="px-4 py-2">{order.offerPrice}</td>
                <td className="px-4 py-2">{order.status}</td>

                <td className="px-4 py-2">
                  <Link to={``}>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Order Received
                    </button>
                  </Link>
                </td>
                <td>
                  <button className="bg-red-600 text-white px-3 py-1 rounded-md">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersList;

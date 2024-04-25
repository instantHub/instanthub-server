import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  useGetAllSeriesQuery,
  useDeleteSeriesMutation,
} from "../../../features/api";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const SeriesList = () => {
  const { data: seriesData, isLoading: seriesLoading } = useGetAllSeriesQuery();
  const [deleteSeries] = useDeleteSeriesMutation();

  if (!seriesLoading) {
    console.log(seriesData);
  }

  const handleDelete = async (seriesId, e) => {
    e.preventDefault();
    console.log("delete series", seriesId);
    const deletedSeries = await deleteSeries(seriesId);
    toast.success(deletedSeries.message);
  };

  return (
    <>
      <div className="flex mt-[5%] w-[80%] mx-auto">
        <div className="grow">
          <div className="flex justify-between items-center">
            <h1 className="bold text-[1.4rem] mb-2">Series List</h1>
          </div>
          <div className="bg-white border rounded-md shadow-lg">
            <form className="flex flex-col gap-4 p-5 ">
              <div className="flex gap-2 items-center">
                <h1 className="text-xl opacity-75">Series</h1>
              </div>
              <hr />

              <table className="w-full">
                <thead>
                  <tr className="border">
                    <th className="px-4 py-2 text-black">Series Name</th>
                    <th className="px-4 py-2 text-black">Category & Brand</th>
                    <th className="px-4 py-2 text-black">Update</th>
                    <th className="px-4 py-2 text-black">Delete</th>
                  </tr>
                </thead>

                <tbody className="text-center border">
                  {!seriesLoading &&
                    seriesData.map((series, index) => (
                      <tr key={index}>
                        <td>{series.name}</td>
                        <td className="flex flex-col">
                          <div>
                            <span className="text-sm opacity-70">
                              Category:
                            </span>{" "}
                            {series.category.name}
                          </div>
                          <div>
                            <span className="text-sm opacity-70">Brand: </span>
                            {series.brand.name}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <Link to={`/admin/update-series/${series.id}`}>
                            <button className="bg-blue-500 flex mx-auto items-center gap-1 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                              Edit <FaEdit />
                            </button>
                          </Link>
                        </td>
                        <td>
                          <button
                            onClick={(e) => handleDelete(series.id, e)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md"
                          >
                            <MdDeleteForever className="text-2xl" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesList;

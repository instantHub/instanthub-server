import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  useGetSlidersListQuery,
  useDeleteSliderMutation,
} from "../../../features/api";

const SlidersList = () => {
  const { data: slidersList, isLoading: slidersLoading } =
    useGetSlidersListQuery();
  const [deleteSlider] = useDeleteSliderMutation();

  if (!slidersLoading) {
    console.log(slidersList);
  }

  const handleDelete = async (sliderId) => {
    console.log("delete slider", sliderId);
    const deletedSlider = await deleteSlider(sliderId);
    toast.success(deletedSlider.message);
  };

  return (
    <>
      <div className="flex mt-[5%] w-[80%] mx-auto">
        <div className="grow">
          <div className="flex justify-between items-center">
            <h1 className="bold text-[1.4rem] mb-2">Sliders List</h1>
          </div>
          <div className="bg-white border rounded-md shadow-lg">
            <form className="flex flex-col gap-4 p-5 ">
              <div className="flex gap-2 items-center">
                <h1 className="text-xl opacity-75">Sliders</h1>
              </div>
              <hr />

              <table className="w-full">
                <thead>
                  <tr className="border">
                    <th className="px-4 py-2 text-black">Slider Image</th>
                    <th className="px-4 py-2 text-black">Update</th>
                    <th className="px-4 py-2 text-black">Delete</th>
                  </tr>
                </thead>

                <tbody className="text-center border">
                  {!slidersLoading &&
                    slidersList.map((slider, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <img
                            src={
                              import.meta.env.VITE_APP_BASE_URL + slider.image
                            }
                            alt="CAT"
                            className="w-[480px] h-[150px] mx-auto "
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Link to={`/admin/update-sliders/${slider.id}`}>
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                              Edit
                            </button>
                          </Link>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(slider.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md"
                          >
                            Delete
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

export default SlidersList;

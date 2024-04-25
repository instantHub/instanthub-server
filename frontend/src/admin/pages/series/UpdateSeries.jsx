import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useGetAllSeriesQuery,
  useUpdateSeriesMutation,
} from "../../../features/api";
import { toast } from "react-toastify";

const UpdateSeries = () => {
  const { seriesId } = useParams();
  const { data: seriesData, isLoading: seriesLoading } = useGetAllSeriesQuery();
  const [updateSeries] = useUpdateSeriesMutation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [seriesName, setSeriesName] = useState("");

  const navigate = useNavigate();

  // Selecting slider which needs to update
  useEffect(() => {
    if (!seriesLoading) {
      const series = seriesData.filter((series) => series.id === seriesId);
      setSelectedCategory(series[0].category);
      setSelectedBrand(series[0].brand);
      setSeriesName(series[0].name);
    }
  }, [seriesData]);
  //   console.log("Series To Update", selectedCategory, selectedBrand, seriesName);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const series = {
      name: seriesName,
      category: selectedCategory.id,
      brand: selectedBrand.id,
    };

    // console.log("sliderData", sliderData);
    try {
      const seriesUpdated = await updateSeries({
        seriesId: seriesId,
        data: series,
      }).unwrap();

      if (
        !seriesUpdated.success &&
        seriesUpdated.data === "Duplicate SeriesName"
      ) {
        // setErrorMessage(response.data);
        toast.error(seriesUpdated.message);
        return;
      }

      console.log("Series created", seriesUpdated);
      toast.success("Series Updated successfull..!");

      navigate("/admin/add-series");
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  return (
    <div>
      {selectedCategory && seriesName && (
        <div className="mt-[5%] w-[80%] mx-auto grow">
          <div className="flex justify-between items-center">
            <h1 className="bold text-[1.4rem] mb-2">Update Series</h1>
            <div className="py-3 px-2 text-center">
              <Link to={`/admin/series-list`}>
                <button
                  type="submit"
                  className="border text-white bg-blue-600 rounded-md px-4 py-1 cursor-pointer  hover:bg-blue-700"
                >
                  Back
                </button>
              </Link>
            </div>
          </div>
          <div className="bg-white border rounded-md shadow-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 ">
              <div className="flex gap-2 items-center">
                <h1 className="text-xl opacity-75">Update Series </h1>
              </div>
              <hr />

              <div className="grid grid-cols-2 gap-2 w-full max-lg:grid-cols-1">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <div>
                      <span className="text-sm opacity-70">Category:</span>{" "}
                      {selectedCategory.name}
                    </div>
                    <div>
                      <span className="text-sm opacity-70">Brand:</span>{" "}
                      {selectedBrand.name}
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name=""
                      value={seriesName}
                      className="border rounded px-2 py-1"
                      onChange={(e) => setSeriesName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="py-3 px-2 text-center">
                <button
                  type="submit"
                  className="border text-white bg-green-600 rounded-md px-4 py-1 cursor-pointer hover:bg-white hover:text-green-600"
                >
                  Update Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateSeries;

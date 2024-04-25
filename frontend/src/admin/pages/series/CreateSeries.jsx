import React, { useState, useEffect } from "react";
import {
  useCreateSeriesMutation,
  useGetAllBrandQuery,
  useGetCategoryQuery,
} from "../../../features/api";
import { toast } from "react-toastify";
import SeriesList from "./SeriesList";

const CreateSeries = () => {
  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoryQuery();
  const { data: BrandData, isLoading: BrandLoading } = useGetAllBrandQuery();
  const [createSeries] = useCreateSeriesMutation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [seriesName, setSeriesName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(selectedCategory, selectedBrand, seriesName);

    const seriesData = {
      category: selectedCategory,
      brand: selectedBrand,
      name: seriesName,
    };

    try {
      const seriesCreated = await createSeries(seriesData).unwrap();
      // productId = product.id;
      console.log(seriesCreated);
      if (
        !seriesCreated.success &&
        seriesCreated.data === "Duplicate SeriesName"
      ) {
        // setErrorMessage(response.data);
        toast.error(seriesCreated.message);
        return;
      }

      console.log("Series created", seriesCreated);
      toast.success("Series created successfull..!");
      //   setSelectedCategory("");
      //   setSelectedBrand("");
      //   setSeriesName("");
    } catch (error) {
      toast.error(error);
      console.log("Error: ", error);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between items-center mt-10">
        <h1 className="bold text-[1.4rem] mb-2">Add / Create Series</h1>

        <div className="bg-white border rounded-md shadow-lg w-[50%] max-2sm:w-[90%]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4  p-5 ">
            <div>
              <h2 className="">Add/Create Series for the Product</h2>
            </div>
            <hr />

            <div className="flex justify-around items-center content-center gap-4">
              <div className="flex flex-col">
                <label htmlFor="category">Select Category :</label>
                <select
                  id="category"
                  name="category"
                  className="border rounded-sm p-2"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {!categoryLoading &&
                    categoryData.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        name="category"
                        className=""
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                        }}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="productType">Select Brand :</label>
                <select
                  id="productType"
                  name="productType"
                  className="border rounded-sm p-2"
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {!BrandLoading &&
                    BrandData.map((brand) => {
                      if (selectedCategory == brand.category.id) {
                        return (
                          <option
                            key={brand.id}
                            value={brand.id}
                            name="category"
                            className=""
                          >
                            {brand.name}
                          </option>
                        );
                      }
                    })}
                </select>
              </div>

              {/* <div className="flex gap-2">
      <label htmlFor="productName">Product : </label>
      <span name="productName" className="opacity-50">
        ProductName
      </span>
    </div> */}
            </div>

            {/* <div className="flex flex-col">
      <label htmlFor="selectSeries">Series List:</label>
      <select
        id="selectSeries"
        name="selectSeries"
        className="border rounded-sm p-2"
        required
      >
        <option value="">Select Series</option>
      </select>
    </div> */}

            <div className="flex gap-4 items-center mx-auto">
              <div className="flex flex-col">
                {/* <label htmlFor="seriesName" className="text-[12px]">
      Series Not Found?
    </label> */}
                <label htmlFor="seriesName">Enter New Series Name :</label>
                <input
                  type="text"
                  id="seriesName"
                  value={seriesName}
                  className=" border p-2 rounded-lg"
                  placeholder="Series Name"
                  onChange={(e) => setSeriesName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="px-2">
              <button
                type="submit"
                className="border border-gray-950 bg-blue-500 rounded-md p-1 w-[20%] cursor-pointer hover:bg-white"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <div>
        <SeriesList />
      </div>
    </>
  );
};

export default CreateSeries;

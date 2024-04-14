import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useGetCategoryQuery,
  useGetAllBrandQuery,
  useDeleteBrandMutation,
} from "../../../features/api";
import { Link } from "react-router-dom";

const BrandsList = () => {
  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandQuery();

  const { data: categoryData, isLoading: categoryDataLoading } =
    useGetCategoryQuery();
  const [deleteBrand, { isLoading: deleteLoading }] = useDeleteBrandMutation();

  if (!brandsLoading) {
    // console.log(brandsData);
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
      <h2 className="text-white text-lg font-bold mb-4">Brands Table</h2>
      <div className="mb-4">
        <label htmlFor="condition" className="text-white mr-2">
          Select Category:
        </label>
        <select
          id="condition"
          onChange={handleConditionChange}
          value={selectedCondition}
          className="p-2 rounded bg-gray-300 text-gray-800"
        >
          <option value="">Select</option>
          {!categoryDataLoading &&
            categoryData.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            {!selectedCondition && (
              <th className="px-4 py-2 text-white bg-gray-800">Category</th>
            )}
            <th className="px-4 py-2 text-white bg-gray-800">Brand</th>
            <th className="px-4 py-2 text-white bg-gray-800">Product IMG</th>
            <th className="px-4 py-2 text-white bg-gray-800">Edit/Update</th>
            <th className="px-4 py-2 text-white bg-gray-800">Delete</th>
          </tr>
        </thead>

        <tbody className="text-center">
          {/* Products when Category is selected */}
          {!brandsLoading &&
            brandsData
              .filter((brand) => brand.category.id === selectedCondition)
              .map((brand, index) => (
                <tr
                  key={`${brand._id}-${index}`}
                  className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                >
                  {/* <td className="px-4 py-2">{product.category.name}</td> */}
                  <td className="px-4 py-2">{brand.name}</td>

                  <td className="px-4 py-2">
                    <img
                      src={"http://localhost:8000" + brand.image}
                      alt="BrandImg"
                      className="w-[60px] h-[60px] mx-auto "
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Link to={``}>
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Edit
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

          {/* Products when Category not selected */}
          {!brandsLoading &&
            !selectedCondition &&
            brandsData
              //   .filter((product) => product.category.id != selectedCondition)
              .map((brand, index) => (
                <tr
                  key={`${brand._id}-${index}`}
                  className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                >
                  {/* {categoryData &&
                    categoryData.map((cat) => {
                      cat.id == brand.category && (
                        <td className="px-4 py-2">{cat.name}</td>
                      );
                    })} */}

                  <td className="px-4 py-2">{brand.category.name}</td>
                  <td className="px-4 py-2">{brand.name}</td>

                  <td className="px-4 py-2">
                    <img
                      src={"http://localhost:8000" + brand.image}
                      alt="CAT"
                      className="w-[60px] h-[60px] mx-auto "
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Link to={`/admin/update-brand/${brand.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Edit
                      </button>
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md"
                    >
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

export default BrandsList;

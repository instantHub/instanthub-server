import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useGetCategoryQuery,
  useGetAllBrandQuery,
  useDeleteBrandMutation,
} from "../../../features/api";
import { Link } from "react-router-dom";

const CategoriesList = () => {
  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandQuery();

  const { data: categoryData, isLoading: categoryDataLoading } =
    useGetCategoryQuery();
  const [deleteBrand, { isLoading: deleteLoading }] = useDeleteBrandMutation();

  if (!categoryDataLoading) {
    console.log(categoryData);
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
      <h2 className="text-white text-lg font-bold mb-4">Categories Table</h2>

      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-white bg-gray-800">Category</th>
            <th className="px-4 py-2 text-white bg-gray-800">Brands</th>
            <th className="px-4 py-2 text-white bg-gray-800">Category IMG</th>
            <th className="px-4 py-2 text-white bg-gray-800">Edit/Update</th>
            <th className="px-4 py-2 text-white bg-gray-800">Delete</th>
          </tr>
        </thead>

        <tbody className="text-center">
          {/* Products when Category not selected */}
          {!categoryDataLoading &&
            categoryData
              //   .filter((product) => product.category.id != selectedCondition)
              .map((category, index) => (
                <tr
                  key={`${category._id}-${index}`}
                  className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                >
                  {/* {categoryData &&
                    categoryData.map((cat) => {
                      cat.id == brand.category && (
                        <td className="px-4 py-2">{cat.name}</td>
                      );
                    })} */}

                  <td className="px-4 py-2">{category.name}</td>
                  {/* {category.brands.map((brand) => {
                    <td className="px-4 py-2">{category.brand.name}</td>;
                  })} */}

                  <td className="px-4 py-2 grid grid-cols-2">
                    {category.brands.map((brand) => (
                      <h3>{brand.name}</h3>
                    ))}
                  </td>

                  <td className="px-4 py-2">
                    <img
                      src={"http://localhost:8000" + category.image}
                      alt="CAT"
                      className="w-[60px] h-[60px] mx-auto "
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Link to={`/admin/update-category/${category.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Edit
                      </button>
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(category.id)}
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

export default CategoriesList;

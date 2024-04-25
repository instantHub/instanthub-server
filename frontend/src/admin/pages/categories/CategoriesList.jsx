import React, { useState, useEffect } from "react";
import {
  useGetCategoryQuery,
  useGetAllBrandQuery,
  useDeleteCategoryMutation,
} from "../../../features/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const CategoriesList = () => {
  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandQuery();

  const { data: categoryData, isLoading: categoryDataLoading } =
    useGetCategoryQuery();
  const [deleteCategory] = useDeleteCategoryMutation();

  if (!categoryDataLoading) {
    console.log(categoryData);
  }

  const [selectedCondition, setSelectedCondition] = useState("");

  const handleConditionChange = (e) => {
    setSelectedCondition(e.target.value);
  };

  const handleDelete = async (catId) => {
    console.log("deleteCategory", catId);
    const deletedCategory = await deleteCategory(catId);
    toast.success(deletedCategory.message);
  };

  return (
    //Products based on the Category selected
    <div className="p-4 ">
      <h2 className="text-black text-lg font-bold mb-4">Categories Table</h2>

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
                  <td className="px-4 py-2">{category.name}</td>
                  {/* Brands list */}
                  {category.brands.length != 0 ? (
                    <td className="px-4 py-2 grid grid-cols-2 text-sm">
                      {category.brands.map((brand) => (
                        <h3
                          key={`${category}-${brand.name}-${brand.id}`}
                          className="py-1"
                        >
                          {brand.name}
                        </h3>
                      ))}
                    </td>
                  ) : (
                    <td className="px-4 py-2 text-xs text-red-700 opacity-70">
                      Brands <br />
                      not available
                    </td>
                  )}

                  <td className="px-4 py-2">
                    <img
                      src={import.meta.env.VITE_APP_BASE_URL + category.image}
                      alt="CAT"
                      className="w-[60px] h-[60px] mx-auto "
                    />
                  </td>
                  <td className="flex justify-center px-4 py-2">
                    <Link to={`/admin/update-category/${category.id}`}>
                      <button className="bg-blue-500 flex items-center gap-1 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Edit <FaEdit/>
                      </button>
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                      <MdDeleteForever className="text-2xl"/>
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

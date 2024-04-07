import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useGetAllProductsQuery,
  useGetCategoryQuery,
} from "../../../features/api";
import { Link } from "react-router-dom";

const ProductsList = () => {
  const { data: productsData, isLoading: productsDataLoading } =
    useGetAllProductsQuery();
  const { data: categoryData, isLoading: categoryDataLoading } =
    useGetCategoryQuery();

  if (!productsDataLoading) {
    // console.log(productsData);
  }

  const [selectedCondition, setSelectedCondition] = useState("");

  const handleConditionChange = (e) => {
    setSelectedCondition(e.target.value);
  };

  return (
    // Completed List of Questions
    // <div className="flex flex-col gap-2 items-center p-4">
    //   <h2 className="text-white text-lg font-bold mb-4">Question Table</h2>
    //   <table className="w-full">
    //     <thead className="p-3 ">
    //       <tr className="bg-slate-400 ">
    //         <th className="px-4 py-2 text-white bg-gray-800">Category</th>
    //         <th className="px-4 py-2 text-white bg-gray-800">Condition Name</th>
    //         <th className="px-4 py-2 text-white bg-gray-800">Question Name</th>
    //         <th className="px-4 py-2 text-white bg-gray-800">Price Drop</th>
    //         <th className="px-4 py-2 text-white bg-gray-800">Options</th>
    //         <th className="px-4 py-2 text-white bg-gray-800">Edit/Update</th>
    //       </tr>
    //     </thead>
    //     <tbody className="">
    //       {!questionsLoading &&
    //         questions.map((question) =>
    //           question.conditions.map((condition) =>
    //             condition.questions.map((q, index) => (
    //               <tr
    //                 key={`${question._id}-${condition.conditionName}-${index}`}
    //               >
    //                 <td className="px-4 py-2">{question.category.name}</td>
    //                 <td className="px-4 py-2">{condition.conditionName}</td>
    //                 <td className="px-4 py-2">{q.questionName}</td>
    //                 <td className="px-4 py-2">{q.priceDrop}</td>
    //                 <td className="px-4 py-2">{q.options.join(", ")}</td>
    //                 <td>
    //                   <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    //                     Edit
    //                   </button>
    //                 </td>
    //               </tr>
    //             ))
    //           )
    //         )}
    //     </tbody>
    //   </table>
    // </div>

    //Products based on the Category selected
    <div className="p-4 bg-black">
      <h2 className="text-white text-lg font-bold mb-4">Products Table</h2>
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
            categoryData.map(
              (category) => (
                //   question.map((question) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              )
              //   ))
            )}
        </select>
      </div>
      <table className="w-full">
        <thead>
          {/* {selectedCondition ? (
            <tr>
              <th className="px-4 py-2 text-white bg-gray-800">Brand</th>
              <th className="px-4 py-2 text-white bg-gray-800">Product Name</th>
              <th className="px-4 py-2 text-white bg-gray-800">Variants</th>
              <th className="px-4 py-2 text-white bg-gray-800">Product IMG</th>
              <th className="px-4 py-2 text-white bg-gray-800">Edit/Update</th>
            </tr>
          ) : (
            <tr>
              <th className="px-4 py-2 text-white bg-gray-800">Category</th>
              <th className="px-4 py-2 text-white bg-gray-800">Brand</th>
              <th className="px-4 py-2 text-white bg-gray-800">Product Name</th>
              <th className="px-4 py-2 text-white bg-gray-800">Variants</th>
              <th className="px-4 py-2 text-white bg-gray-800">Product IMG</th>
              <th className="px-4 py-2 text-white bg-gray-800">Edit/Update</th>
            </tr>
          )} */}

          <tr>
            {!selectedCondition && (
              <th className="px-4 py-2 text-white bg-gray-800">Category</th>
            )}
            <th className="px-4 py-2 text-white bg-gray-800">Brand</th>
            <th className="px-4 py-2 text-white bg-gray-800">Product Name</th>
            <th className="px-4 py-2 text-white bg-gray-800">Variants</th>
            <th className="px-4 py-2 text-white bg-gray-800">Product IMG</th>
            <th className="px-4 py-2 text-white bg-gray-800">Edit/Update</th>
            <th className="px-4 py-2 text-white bg-gray-800">Questions</th>
          </tr>
        </thead>

        <tbody className="text-center">
          {/* Products when Category is selected */}
          {!productsDataLoading &&
            productsData
              .filter((product) => product.category.id === selectedCondition)
              .map((product, index) => (
                <tr
                  key={`${product._id}-${index}`}
                  className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                >
                  {/* <td className="px-4 py-2">{product.category.name}</td> */}
                  <td className="px-4 py-2">{product.brand.name}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">
                    {product.variants.map((variant, i) => (
                      <ul>
                        <li>{variant.name}</li>
                      </ul>
                    ))}
                  </td>
                  <td className="px-4 py-2">
                    <img
                      src={"http://localhost:8000" + product.image}
                      alt="CAT"
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
                  <td className="px-4 py-2">
                    {product.questions && <h2>Tagged</h2>}
                  </td>
                </tr>
              ))}

          {/* Products when Category not selected */}
          {!productsDataLoading &&
            !selectedCondition &&
            productsData
              //   .filter((product) => product.category.id != selectedCondition)
              .map((product, index) => (
                <tr
                  key={`${product._id}-${index}`}
                  className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                >
                  <td className="px-4 py-2">{product.category.name}</td>
                  <td className="px-4 py-2">{product.brand.name}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">
                    {product.variants.map((variant, i) => (
                      <ul>
                        <li>{variant.name}</li>
                      </ul>
                    ))}
                  </td>
                  <td className="px-4 py-2">
                    <img
                      src={"http://localhost:8000" + product.image}
                      alt="CAT"
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
                  <td className="px-4 py-2">
                    {product.questions && (
                      <Link
                        to={`/admin/products/product-questions/${product.questions}/${product.id}`}
                      >
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          validate
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsList;

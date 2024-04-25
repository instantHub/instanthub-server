import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useGetAllProductsQuery,
  useGetCategoryQuery,
  useDeleteProductMutation,
} from "../../../features/api";
import { Link } from "react-router-dom";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const ProductsList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: productsData,
    error,
    isLoading: productsDataLoading,
  } = useGetAllProductsQuery({
    page,
    limit,
    search: search,
  });

  if (productsData) {
    console.log(productsData);
  }

  const { data: categoryData, isLoading: categoryDataLoading } =
    useGetCategoryQuery();
  const [deleteProduct, { isLoading: deleteLoading }] =
    useDeleteProductMutation();

  const [selectedCondition, setSelectedCondition] = useState("");
  console.log(search);

  const handleConditionChange = (e) => {
    setSelectedCondition(e.target.value);
  };

  const handleDelete = async (productId) => {
    console.log("handledelete", productId);
    await deleteProduct(productId);
  };

  useEffect(() => {
    if (productsData) {
      if (page == 0) {
        setPage(1);
      } else if (page > productsData.totalPages) {
        setPage(productsData.totalPages);
      }
    }
  }, [page, productsData]);

  return (
    //Products based on the Category selected
    <>
      {/* Products based on the Category selected */}
      <div className="p-4 ">
        {/* Search */}
        <div className=" my-4 flex gap-2 items-center">
          <div>
            <input
              type="search"
              name=""
              id=""
              placeholder="Search a product"
              className="px-2 text-sm py-1 rounded border"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <button className="bg-green-600 px-2 rounded text-sm py-1 text-white">
              Search
            </button>
          </div>
        </div>

        <h2 className="text-black text-lg font-bold mb-4">Products Table</h2>
        <div className="grid grid-cols-2 mb-4">
          <div>
            <label htmlFor="condition" className=" mr-2">
              Select Category:
            </label>
            <select
              id="condition"
              onChange={handleConditionChange}
              value={selectedCondition}
              className="p-2 rounded bg-gray-700 text-white"
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
          <div className="">
            {!productsDataLoading && (
              <h1 className="text-lg border-b-[1px] w-fit">
                Page {productsData.page}
              </h1>
            )}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {!selectedCondition && (
                <th className="px-4 py-2 text-white bg-gray-800">Category</th>
              )}
              <th className="px-4 py-2 text-white bg-gray-800">Brand</th>
              <th className="px-4 py-2 text-white bg-gray-800">Product Name</th>
              <th className="px-4 py-2 text-white bg-gray-800">Variants</th>
              <th className="px-4 py-2 text-white bg-gray-800">Product IMG</th>
              <th className="px-4 py-2 text-white bg-gray-800">Edit/Update</th>
              <th className="px-4 py-2 text-white bg-gray-800">Delete</th>
              <th className="px-4 py-2 text-white bg-gray-800">Questions</th>
            </tr>
          </thead>

          <tbody className="text-center">
            {/* Products when Category is selected */}
            {!productsDataLoading &&
              productsData.products
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
                      <ul>
                        {product.variants.map((variant, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <label
                              htmlFor="variantName"
                              className="text-xs text-gray-500"
                            >
                              Variant Name
                            </label>
                            <li key={i} className="" name="variantName">
                              {variant.name}
                            </li>
                          </div>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2">
                      <img
                        src={import.meta.env.VITE_APP_BASE_URL + product.image}
                        alt="CAT"
                        className="w-[60px] h-[60px] mx-auto "
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Link to={`/admin/update-product/${product.id}`}>
                        <button className="bg-blue-500 flex items-center gap-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          Edit <FaEdit className="text-lg" />
                        </button>
                      </Link>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-md"
                      >
                        <MdDeleteForever className="text-2xl" />
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      {product.deductions && (
                        <Link
                          to={`/admin/products/product-questions/${product.id}`}
                        >
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            validate
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}

            {/* Products when Category not selected */}
            {!productsDataLoading &&
              !selectedCondition &&
              productsData.products
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
                      <ul>
                        {product.variants.map((variant, i) => (
                          <div key={i} className="flex gap-2 justify-center">
                            <div className="">
                              <label
                                htmlFor="variantName"
                                className="text-xs text-gray-500"
                              >
                                Variant Name
                              </label>
                              <li key={i} className="" name="variantName">
                                {variant.name}
                              </li>
                            </div>
                            <div>
                              <label
                                htmlFor="variantName"
                                className="text-xs text-gray-500"
                              >
                                Variant Price
                              </label>
                              <li key={i} className="" name="variantName">
                                {variant.price}
                              </li>
                            </div>
                          </div>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2">
                      <img
                        // src={"http://localhost:8000" + product.image}
                        src={import.meta.env.VITE_APP_BASE_URL + product.image}
                        alt="CAT"
                        className="w-[60px] h-[60px] mx-auto "
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Link to={`/admin/update-product/${product.id}`}>
                        <button className="bg-blue-500 flex items-center gap-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          Edit <FaEdit className="text-lg" />
                        </button>
                      </Link>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-md"
                      >
                        <MdDeleteForever className="text-2xl" />
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      {product.deductions && (
                        <Link
                          to={`/admin/products/product-questions/${product.id}`}
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
        {/* Pagination controls */}
        <div className="flex flex-col gap-2 justify-center mt-2">
          <div className="flex gap-2 justify-center mt-2">
            {!productsDataLoading && productsData.page > 1 && (
              <button
                onClick={() => setPage((prevPage) => prevPage - 1)}
                className="bg-blue-700 flex items-center gap-1 text-white px-2 py-1 rounded"
              >
                <FaAngleLeft />
                Previous
              </button>
            )}
            {/* {!productsDataLoading && productsData.products.length != 0 && ( */}
            {!productsDataLoading &&
              productsData.page !== productsData.totalPages && (
                <button
                  onClick={() => setPage((prevPage) => prevPage + 1)}
                  className="bg-blue-700 flex items-center gap-1 text-white px-2 py-1 rounded"
                >
                  Next
                  <FaAngleRight />
                </button>
              )}
            {/* )} */}
          </div>
          {!productsDataLoading && (
            <div className="text-center text-lg">
              Total {productsData.totalPages} Pages
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsList;

// import React, { useState } from "react";
// import {
//   useGetAllProductsQuery,
//   useGetCategoryQuery,
//   useDeleteProductMutation,
// } from "../../../features/api";
// import { Link } from "react-router-dom";

// const ProductsList = () => {
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(3);
//   const [searchTerm, setSearchTerm] = useState("");

//   const { data, error, isLoading } = useGetAllProductsQuery({
//     page,
//     limit,
//     search: searchTerm,
//   });

//   const [deleteProduct, { isLoading: deleteLoading }] =
//     useDeleteProductMutation();

//   const handleDelete = async (productId) => {
//     console.log("handledelete", productId);
//     await deleteProduct(productId);
//   };

//   console.log(data);

//   const handleSearch = () => {
//     // Fetch products with the updated search term
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div className="px-2">
//       <div className=" my-4 flex gap-2 items-center">
//         <div>
//           <input
//             type="search"
//             name=""
//             id=""
//             placeholder="Search a product"
//             className="px-2 text-sm py-1 rounded border"
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div>
//           <button className="bg-green-600 px-2 rounded text-sm py-1 text-white">
//             Search
//           </button>
//         </div>
//       </div>
//       <table>
//         <thead>
//           <tr>
//             <th className="px-4 py-2 text-white bg-gray-800">Category</th>
//             <th className="px-4 py-2 text-white bg-gray-800">Brand</th>
//             <th className="px-4 py-2 text-white bg-gray-800">Product Name</th>
//             <th className="px-4 py-2 text-white bg-gray-800">Variants</th>
//             <th className="px-4 py-2 text-white bg-gray-800">Product IMG</th>
//             <th className="px-4 py-2 text-white bg-gray-800">Edit/Update</th>
//             <th className="px-4 py-2 text-white bg-gray-800">Delete</th>
//             <th className="px-4 py-2 text-white bg-gray-800">Questions</th>
//             {/* Add more headers as needed */}
//           </tr>
//         </thead>
//         <tbody>
//           {!isLoading &&
//             data.products.map((product, index) => (
//               // <tr key={product.id}>
//               <tr
//                 key={`${product._id}-${index}`}
//                 className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
//               >
//                 <td>{product.category.name}</td>
//                 <td>{product.brand.name}</td>
//                 <td>{product.name}</td>
//                 <td className="px-4 py-2">
//                   <ul>
//                     {product.variants.map((variant, i) => (
//                       <div key={i} className="flex gap-2 justify-center">
//                         <div className="">
//                           <label
//                             htmlFor="variantName"
//                             className="text-xs text-gray-500"
//                           >
//                             Variant Name
//                           </label>
//                           <li key={i} className="" name="variantName">
//                             {variant.name}
//                           </li>
//                         </div>
//                         <div>
//                           <label
//                             htmlFor="variantName"
//                             className="text-xs text-gray-500"
//                           >
//                             Variant Price
//                           </label>
//                           <li key={i} className="" name="variantName">
//                             {variant.price}
//                           </li>
//                         </div>
//                       </div>
//                     ))}
//                   </ul>
//                 </td>
//                 <td className="px-4 py-2">
//                   <img
//                     src={"http://localhost:8000" + product.image}
//                     alt="CAT"
//                     className="w-[60px] h-[60px] mx-auto "
//                   />
//                 </td>
//                 <td className="px-4 py-2">
//                   <Link to={``}>
//                     <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//                       Edit
//                     </button>
//                   </Link>
//                 </td>
//                 <td>
//                   <button
//                     onClick={() => handleDelete(product.id)}
//                     className="bg-red-600 text-white px-3 py-1 rounded-md"
//                   >
//                     Delete
//                   </button>
//                 </td>
//                 <td className="px-4 py-2">
//                   {product.deductions && (
//                     <Link
//                       to={`/admin/products/product-questions/${product.id}`}
//                     >
//                       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//                         validate
//                       </button>
//                     </Link>
//                   )}
//                 </td>

//                 {/* <td>{product.price}</td> */}
//                 {/* Add more columns as needed */}
//               </tr>
//             ))}
//         </tbody>
//       </table>
//       {/* Pagination controls */}
//       <div className="flex gap-2">
//         <button onClick={() => setPage((prevPage) => prevPage - 1)}>
//           Previous
//         </button>
//         <button onClick={() => setPage((prevPage) => prevPage + 1)}>
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductsList;

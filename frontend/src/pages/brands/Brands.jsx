import React, { useEffect, useState } from "react";
import brands from "../../data/brands.json";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useGetCategoryQuery, useGetBrandQuery } from "../../features/api";
import { FaAngleRight } from "react-icons/fa";

const Brands = () => {
  const { catId } = useParams();
  console.log("catID", catId);

  const { data: getCategories, isLoading: categoryLoading } =
    useGetCategoryQuery();
  const { data, isLoading } = useGetBrandQuery(catId);
  console.log("brand api data", data);

  // Finding Category Name
  let category = { name: "", id: "" };
  if (!categoryLoading) {
    console.log(getCategories);
    getCategories.map((cat) => {
      if (catId == cat.id) {
        category = { name: cat.name, id: cat.id };
      }
    });
    console.log(category.name);
  }

  // useEffect(() => {});

  return (
    <>
      <div className="mt-20 w-4/5 mx-auto">
        <div className="mx-0 mb-6">
          {!isLoading && (
            <div className="flex items-center gap-1">
              <h1 className="flex items-center opacity-60 gap-1">
                <Link to={"/"}>Home</Link>
                <FaAngleRight />
              </h1>
              <span>{category.name}</span>
            </div>
            // <h1>
            //   <Link to={"/"}>Home</Link> / {category.name}s
            // </h1>
          )}
          <hr className="text-black mt-1" />
        </div>

        {isLoading ? (
          // <h1 className="text-5xl text-black opacity-40 mx-auto">Loading...</h1>
          <div className="flex flex-col justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-evenly gap-6">
            {!data.length == 0 ? (
              data.map((brand, i) => (
                <Link to={`/categories/brands/products/${brand.id}`} key={i}>
                  <div
                    key={i}
                    className="w-28 p-4 h-28 flex cursor-pointer border border-[#E27D60] rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                  >
                    <img
                      src={import.meta.env.VITE_APP_BASE_URL + brand.image}
                      alt="CAT"
                      className="items-center justify-center"
                    />
                    {/* <p className="size-4 pt-1">{brand.name}</p> */}
                  </div>
                </Link>
              ))
            ) : (
              <h1>No Data Available</h1>
            )}
          </div>
        )}

        <div></div>
      </div>
    </>
  );
};

export default Brands;

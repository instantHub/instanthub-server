import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetCategoryQuery } from "../../features/api";
import AllBrandsList from "../brands/AllBrandsList";

const Categories = () => {
  const { data, isLoading } = useGetCategoryQuery();

  return (
    <div className="mt-20 mx-auto">
      <div className="w-4/5 mx-auto">
        <div className="mx-0 mb-6">
          <h1 className="text-2xl pb-6">
            Ready to sell?{" "}
            <span className="text-3xl text-cyan-500 font-semibold">
              Let's turn your stuff into cash!
            </span>
          </h1>
          {/* <hr className="text-black mt-1" /> */}
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-evenly gap-6 ">
            {data.map((category, i) => (
              <Link to={`/categories/brands/${category.id}`} key={i}>
                <div
                  key={i}
                  // border-[#E27D60]
                  className="w-28 p-4 h-32 flex bg-white cursor-pointer border border-[#000] rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                >
                  {/* {console.log("from categories component ", category)} */}
                  <img
                    src={import.meta.env.VITE_APP_BASE_URL + category.image}
                    alt="CAT"
                    className="justify-center"
                  />
                  {/* <p className="size-4 pt-1">{category.name}</p> */}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-16 pt-8 pb-16 bg-cyan-50 px-[10%]">
        <AllBrandsList />
      </div>
    </div>
  );
};

export default Categories;

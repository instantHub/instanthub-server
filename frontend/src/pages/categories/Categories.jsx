import React, { useEffect } from "react";
import data from "../../../data.json";
import { Link } from "react-router-dom";
import { useGetCategoryQuery } from "../../features/api";

const Categories = () => {
  const { data, isLoading } = useGetCategoryQuery();

  // useEffect(() => {}, [data]);

  return (
    <div className="mt-20 w-4/5 mx-auto">
      <div className="mx-0 mb-6">
        <h1>Home / Our Categories</h1>
        <hr className="text-black mt-1" />
      </div>

      {/* <div className="flex flex-wrap justify-evenly gap-6">
        {data.map((category, i) => (
          <Link to={`/brands/${category.catTitle}`}>
            <div
              key={i}
              className="w-28 p-4 cursor-pointer border border-[#E27D60] rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
            >
              <img src={category.catImg} alt="CAT" className="" />
              <p className="size-4 pt-1">{category.catTitle}</p>
            </div>
          </Link>
        ))}
      </div> */}

      {isLoading ? (
        <h1>Loading</h1>
      ) : (
        <div className="flex flex-wrap justify-evenly gap-6">
          {data.map((category, i) => (
            <Link to={`/brands/${category.name}`}>
              <div
                key={i}
                // border-[#E27D60]
                className="w-28 p-4 bg-white cursor-pointer border border-[#000] rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
              >
                {console.log("from categories component ", category)}
                <img
                  src={"http://localhost:8000" + category.image}
                  alt="CAT"
                  className=""
                />
                <p className="size-4 pt-1">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div></div>
    </div>
  );
};

export default Categories;

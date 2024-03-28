import React, { useEffect } from "react";
import brands from "../../data/brands.json";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useGetCategoryQuery, useGetBrandQuery } from "../../features/api";

const Brands = () => {
  const { catId } = useParams();
  console.log("catID", catId);

  const { data, isLoading } = useGetBrandQuery(catId);
  console.log("brand api data", data);

  useEffect(() => {});

  return (
    <>
      <div>
        <h2>BRANDS</h2>
      </div>

      <div className="mt-20 w-4/5 mx-auto">
        <div className="mx-0 mb-6">
          <h1>
            Home / <Link to={`/`}>Categories</Link> - {catId} / Brands
          </h1>
          <hr className="text-black mt-1" />
        </div>

        {isLoading ? (
          <h1 className="text-5xl text-black opacity-40 mx-auto">Loading...</h1>
        ) : (
          <div className="flex flex-wrap justify-evenly gap-6">
            {!data.length == 0 ? (
              data.map((brand, i) => (
                <Link to={`/brands/${brand.name}`} key={i}>
                  <div
                    key={i}
                    className="w-28 p-4 cursor-pointer border border-[#E27D60] rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                  >
                    <img
                      src={"http://localhost:8000" + brand.image}
                      alt="CAT"
                      className=""
                    />
                    <p className="size-4 pt-1">{brand.name}</p>
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

import React from "react";
import brands from "../../data/brands.json";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useGetCategoryQuery } from "../../features/api";

const Brands = () => {
  const { data, isLoading } = useGetCategoryQuery();

  console.log(brands);

  const { brandname } = useParams();
  let cat = [];
  console.log("brandName", brandname);
  //   const cat = data[0];
  //   const categories = cat[0];
  //   console.log("categories", categories);

  //   console.log("cat", cat.map(d=>console.log(d)));

  return (
    <>
      <div>
        <h2>BRANDS</h2>
        {brands.map((d, i) => {
          console.log(d);
        })}
        {console.log("object", cat)}
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </div>

      <div className="mt-20 w-4/5 mx-auto">
        <div className="mx-0 mb-6">
          <h1>
            Home / <Link to={`/`}>Categories</Link> - {brandname} / Brands
          </h1>
          <hr className="text-black mt-1" />
        </div>

        {isLoading ? (
          <h1>Loading</h1>
        ) : (
          <div className="flex flex-wrap justify-evenly gap-6">
            {data.map((category, i) => (
              <Link to={`/brands/${category.name}`}>
                <div
                  key={i}
                  className="w-28 p-4 cursor-pointer border border-[#E27D60] rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                >
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
    </>
  );
};

export default Brands;

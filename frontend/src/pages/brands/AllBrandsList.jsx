import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useGetCategoryQuery, useGetAllBrandQuery } from "../../features/api";

const AllBrandsList = () => {
  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandQuery();

  const [showAllBrands, setShowAllBrands] = useState(false);

  const handleShowMoreBrands = () => {
    setShowAllBrands(true);
  };

  const handleShowLessBrands = () => {
    setShowAllBrands(false);
  };

  if (!brandsLoading) {
    console.log(brandsData);
  }
  return (
    <div>
      <div className="my-10">
        <h1 className="text-2xl flex gap-2 items-center border-b-[1px] border-b-cyan-300 w-fit">
          Explore{" "}
          {!brandsLoading && (
            <span className="text-4xl font-semibold text-cyan-500">
              {brandsData.length}
            </span>
          )}{" "}
          leading Brands across our Categories.
        </h1>
      </div>
      <div>
        {brandsLoading ? (
          // <h1 className="text-5xl text-black opacity-40 mx-auto">Loading...</h1>
          <div className="flex flex-col justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            <span>Loading...</span>
          </div>
        ) : (
          //   <div className="flex flex-wrap justify-center gap-2 w-[80%]">
          //     {!brandsData.length == 0 ? (
          //       brandsData.map((brand, i) => (
          //         <Link to={`/categories/brands/products/${brand.id}`} key={i}>
          //           <div className="  w-32 p-4 h-[136px] flex flex-col cursor-pointer border border-cyan-500 rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500">
          //             <div key={i}>
          //               <img
          //                 src={"http://localhost:8000" + brand.image}
          //                 alt="CAT"
          //                 className="items-center justify-center"
          //               />
          //               {/* <p className="size-4 pt-1">{brand.name}</p> */}
          //             </div>
          //             <div className="text-center opacity-60">
          //               <h1>{brand.category.name}</h1>
          //             </div>
          //           </div>
          //         </Link>
          //       ))
          //     ) : (
          //       <h1>No Data Available</h1>
          //     )}
          //   </div>

          <div className="flex justify-center flex-wrap items-center h-full">
            <div className="grid  grid-cols-6 justify-center gap-2 w-[80%] max-lg:grid-cols-4 max-sm:grid-cols-2 max-md:grid-cols-3">
              {!brandsData.length == 0 ? (
                <>
                  {brandsData
                    .slice(0, showAllBrands ? brandsData.length : 5)
                    .map((brand, i) => (
                      <Link
                        to={`/categories/brands/products/${brand.id}`}
                        key={i}
                        className=""
                      >
                        <div className="w-32 p-4 h-[136px] bg-white flex flex-col cursor-pointer border border-cyan-500 rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500">
                          <div key={i}>
                            <img
                              src={
                                import.meta.env.VITE_APP_BASE_URL + brand.image
                              }
                              alt="CAT"
                              className="items-center justify-center"
                            />
                          </div>
                          <div className="text-center opacity-60">
                            <h1>{brand.category.name}</h1>
                          </div>
                        </div>
                      </Link>
                    ))}
                  {!showAllBrands && brandsData.length > 5 && (
                    <button
                      onClick={handleShowMoreBrands}
                      className="w-fit px-2  h-fit my-auto cursor-pointer border border-cyan-500 rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                    >
                      Show More...
                    </button>
                  )}
                  {showAllBrands && (
                    <button
                      onClick={handleShowLessBrands}
                      className="w-fit px-2  h-fit my-auto cursor-pointer border border-cyan-500 rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                    >
                      Show Less..
                    </button>
                  )}
                </>
              ) : (
                <h1>No Data Available</h1>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBrandsList;

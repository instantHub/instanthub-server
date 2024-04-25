import React, { useEffect, useState } from "react";
import {
  useGetBrandQuery,
  useGetProductsQuery,
  useGetCategoryQuery,
  useGetAllProductsQuery,
  useGetBrandSeriesQuery,
} from "../../features/api";
import { useParams, Link } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import ProductSeries from "../series/ProductSeries";
import { FaAngleRight } from "react-icons/fa6";

const Products = () => {
  const { brandId } = useParams();
  const { data: getCategories, isLoading: categoryLoading } =
    useGetCategoryQuery();
  const { data: brandSeries, isLoading: seriesLoading } =
    useGetBrandSeriesQuery(brandId);
  const [showSeries, setShowSeries] = useState(false);
  const [seriesSelected, setSeriesSelected] = useState("");

  const [search, setSearch] = useState("");

  // Get Products by Brand
  const {
    data: productsData,
    isLoading: productsLoading,
    isSuccess: productsLoaded,
    isError,
  } = useGetProductsQuery({ brandId, search });

  // Get all Products
  // const {
  //   data: products,
  //   isLoading: productsLoading,
  //   isSuccess: productsLoaded,
  //   isError,
  // } = useGetAllProductsQuery(search);
  // console.log("products", products);

  // let productsData = undefined;

  // if (!productsLoading) {
  //   productsData = products.filter((product) => product.brand.id == brandId);
  //   console.log("productsData", productsData);
  // }

  // Finding Category of the Product
  let category = { name: "", id: "" };
  if (!categoryLoading && !productsLoading && productsData.length > 0) {
    getCategories.map((cat) => {
      if (productsData[0].category == cat.id) {
        category = { name: cat.name, id: cat.id };
      }
    });
  }
  //   console.log(category);

  let { data: brandData, isLoading: brandLoading } = useGetBrandQuery(
    category.id
  );

  if (!brandLoading) {
    // console.log("brandData", brandData);
  }
  // Finding Brand of the Product
  let brand = { name: "", id: "" };
  if (!categoryLoading && !productsLoading && !brandLoading) {
    brandData.map((brandDetail) => {
      if (brandDetail.id == brandId) {
        brand = { name: brandDetail.name, id: brandDetail.id };
      }
    });
    // console.log("brandname", brand.name);
  }
  console.log("showSeries", showSeries);
  const handleSeries = (seriesId) => {
    setShowSeries(!showSeries);
    setSeriesSelected(seriesId);
    console.log(seriesId);
  };

  return (
    <>
      {/* <ProductSeries brandId={brandId} /> */}

      {/*  */}
      <div className="mt-10">
        <div className="mx-10 grid grid-cols-6 max-md:grid-cols-4 max-sm:grid-cols-3 sm:gap-x-12 sm:gap-y-8 rounded-xl sm:rounded-none ring-0 ring-transparent shadow sm:shadow-none mt-4 sm:mt-0">
          {!seriesLoading && brandSeries.length !== 0
            ? brandSeries.map((series, i) => (
                <>
                  <div
                    key={i}
                    className="col-span-1 max-h-44 sm:max-h-56 sm:rounded-lg border-b border-r border-solid sm:border-0"
                  >
                    <button
                      onClick={() => handleSeries(series.id)}
                      // value={series.id}
                      // to={`/categories/brands/productDetails/${series.id}`}
                      key={i}
                      className="w-full h-full"
                    >
                      <div
                        key={i}
                        className={`${
                          showSeries && series.id === seriesSelected
                            ? "bg-cyan-200"
                            : "bg-gray-200"
                        } flex flex-col items-center justify-center cursor-pointer w-full h-full  p-2 sm:p-4 sm:min-w-full rounded-0 sm:rounded-xl sm:ring-0 sm:ring-transparent sm:shadow sm:max-h-56 sm:max-w-44 hover:shadow-xl transition ease-in-out duration-500`}
                      >
                        <span className="text-center mt-2 flex-1 line-clamp-3 flex horizontal items-center justify-center h-9 sm:h-full sm:w-full sm:max-h-12">
                          <div className="text-[14.5px] font-[500] leading-7">
                            {series.name}
                          </div>
                        </span>
                      </div>
                    </button>
                  </div>
                </>
              ))
            : null}
        </div>
      </div>

      {/*  */}

      <div className="mt-10 w-4/5 mx-auto">
        {/* Search Bar */}
        <div className=" my-4 flex justify-end gap-2 items-center">
          <div className="flex pl-4 items-center border rounded">
            <BsSearch className="text-black" />
            <input
              type="search"
              name=""
              id=""
              placeholder="Search a product"
              className="px-2 text-sm py-1 outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <button className="bg-green-600 pl-1 pr-2 rounded text-sm py-1 text-white">
              Search
            </button>
          </div>
        </div>

        <div className="mx-0 mb-6">
          <div className="flex items-center gap-1">
            <h1 className="flex items-center opacity-60 gap-1">
              <Link to={"/"}>Home</Link>
              <FaAngleRight />
              <Link to={`/categories/brands/${category.id}`}>
                {category.name}
              </Link>
              <FaAngleRight />
            </h1>
            {brand.name}
          </div>
          <hr className="text-black mt-1" />
        </div>

        {productsLoading ? (
          <div className="flex flex-col justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-6 max-md:grid-cols-4 max-sm:grid-cols-3 sm:gap-x-12 sm:gap-y-8 rounded-xl sm:rounded-none ring-0 ring-transparent shadow sm:shadow-none mt-4 sm:mt-0">
            {!productsData.length == 0 ? (
              !showSeries ? (
                productsData.map((product, i) => (
                  <>
                    <div
                      key={i}
                      className="col-span-1 max-h-44 sm:max-h-56 sm:rounded-lg border-b border-r border-solid sm:border-0"
                    >
                      <Link
                        to={`/categories/brands/productDetails/${product.id}`}
                        key={i}
                        className="w-full h-full"
                      >
                        <div
                          key={i}
                          // className="w-28 p-4 cursor-pointer rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                          className="flex flex-col items-center justify-center cursor-pointer w-full h-full bg-white p-2 sm:p-4 sm:min-w-full rounded-0 sm:rounded-xl sm:ring-0 sm:ring-transparent sm:shadow sm:max-h-56 sm:max-w-44 hover:shadow-xl transition ease-in-out duration-500"
                        >
                          <div className="flex horizontal  w-28 h-28 items-start justify-between">
                            <img
                              src={
                                import.meta.env.VITE_APP_BASE_URL +
                                product.image
                              }
                              alt="CAT"
                              className="w-28 h-28"
                            />
                          </div>
                          <span className="text-center mt-2 flex-1 line-clamp-3 flex horizontal items-center justify-center h-9 sm:h-full sm:w-full sm:max-h-12">
                            <div className="text-[14.5px] font-[500] leading-7">
                              {product.name}
                            </div>
                          </span>
                        </div>
                      </Link>

                      {/* VARIANTS */}
                      {/* <div>
                      <ul>
                        {!product.variants.length == 0 ? (
                          <p>
                            {product.variants.map((variant) => (
                              <>
                                <div className="flex gap-2">
                                  <p>{variant.name}</p>
                                  <p>{variant.price}</p>
                                </div>
                              </>
                            ))}
                          </p>
                        ) : (
                          <p></p>
                        )}
                      </ul>
                    </div> */}
                    </div>
                  </>
                ))
              ) : (
                // productsData.map((product, i) => (
                productsData
                  .filter((product) => product.series === seriesSelected)
                  .map((product, i) => (
                    <>
                      <div
                        key={i}
                        className="col-span-1 max-h-44 sm:max-h-56 sm:rounded-lg border-b border-r border-solid sm:border-0"
                      >
                        <Link
                          to={`/categories/brands/productDetails/${product.id}`}
                          key={i}
                          className="w-full h-full"
                        >
                          <div
                            key={i}
                            // className="w-28 p-4 cursor-pointer rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                            className="flex flex-col items-center justify-center cursor-pointer w-full h-full bg-white p-2 sm:p-4 sm:min-w-full rounded-0 sm:rounded-xl sm:ring-0 sm:ring-transparent sm:shadow sm:max-h-56 sm:max-w-44 hover:shadow-xl transition ease-in-out duration-500"
                          >
                            <div className="flex horizontal  w-28 h-28 items-start justify-between">
                              <img
                                src={
                                  import.meta.env.VITE_APP_BASE_URL +
                                  product.image
                                }
                                alt="CAT"
                                className="w-28 h-28"
                              />
                            </div>
                            <span className="text-center mt-2 flex-1 line-clamp-3 flex horizontal items-center justify-center h-9 sm:h-full sm:w-full sm:max-h-12">
                              <div className="text-[14.5px] font-[500] leading-7">
                                {product.name}
                              </div>
                            </span>
                          </div>
                        </Link>
                      </div>
                    </>
                  ))
              )
            ) : (
              <h1>Not Available</h1>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Products;

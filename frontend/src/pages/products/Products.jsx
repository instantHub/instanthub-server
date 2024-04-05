import React, { useEffect, useState } from "react";
import {
  useGetBrandQuery,
  useGetProductsQuery,
  useGetCategoryQuery,
  useGetAllProductsQuery,
} from "../../features/api";
import { useParams, Link } from "react-router-dom";

const Products = () => {
  const { brandId } = useParams();
  const { data: getCategories, isLoading: categoryLoading } =
    useGetCategoryQuery();

  // const {
  //   data: productsData,
  //   isLoading: productsLoading,
  //   isSuccess: productsLoaded,
  //   isError,
  // } = useGetProductsQuery(brandId);
  const {
    data: products,
    isLoading: productsLoading,
    isSuccess: productsLoaded,
    isError,
  } = useGetAllProductsQuery();
  const [toggle, setToggle] = useState(false);

  let productsData = undefined;

  if (!productsLoading) {
    productsData = products.filter((product) => product.brand.id == brandId);
    console.log("productsData", productsData);
  }

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
    console.log("brandData", brandData);
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

  return (
    <>
      <div className="mt-20 w-4/5 mx-auto">
        <div className="mx-0 mb-6">
          <h1>
            <Link to={"/"}>Home</Link> /
            <Link to={`/categories/brands/${category.id}`}>
              {" "}
              {category.name}s
            </Link>{" "}
            / {brand.name}
          </h1>
          <hr className="text-black mt-1" />
        </div>

        {productsLoading ? (
          <h1 className="text-5xl text-black opacity-40 mx-auto">Loading...</h1>
        ) : (
          //   <div className="flex flex-wrap justify-evenly gap-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 sm:gap-x-12 sm:gap-y-8 rounded-xl sm:rounded-none ring-0 ring-transparent shadow sm:shadow-none mt-4 sm:mt-0">
            {!productsData.length == 0 ? (
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
                        <div className="flex horizontal items-start justify-between">
                          <img
                            src={"http://localhost:8000" + product.image}
                            alt="CAT"
                            className=""
                          />
                        </div>

                        <span className="text-center flex-1 line-clamp-3 flex horizontal items-center justify-center h-9 sm:h-full sm:w-full sm:max-h-12">
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
              <h1>No Data Available</h1>
            )}
          </div>
        )}
      </div>

      {/* VARIANTS */}
      {/* <div>
        <h1>VARIANTS</h1>
        <ul>
          {productsLoading ? (
            <h1 className="text-5xl text-black opacity-40 mx-auto">
              Loading...
            </h1>
          ) : (
            productsData.map((product) => (
              <>
                {!product.variants.length == 0 ? (
                  <p>
                    <p>{product.name}</p>
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
              </>
            ))
          )}
        </ul>
      </div> */}
    </>
  );
};

export default Products;

import React, { useEffect, useState } from "react";
import { useGetBrandQuery, useGetProductsQuery } from "../../features/api";
import { useParams, Link } from "react-router-dom";

const Products = () => {
  const { brandId } = useParams();
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery(brandId);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    console.log("UseEffect");
  }, [productsData]);

  return (
    <>
      <div>
        <h2>Products</h2>
      </div>

      <div className="mt-20 w-4/5 mx-auto">
        <div className="mx-0 mb-6">
          <h1>
            Home / Categories /<Link to={`../`}> Brands</Link> / Products
          </h1>
          <hr className="text-black mt-1" />
        </div>

        {productsLoading ? (
          <h1 className="text-5xl text-black opacity-40 mx-auto">Loading...</h1>
        ) : (
          <div className="flex flex-wrap justify-evenly gap-6">
            {!productsData.length == 0 ? (
              productsData.map((product, i) => (
                <>
                  <div>
                    <Link to={`/categories/brands/productDetails`} key={i}>
                      <div
                        key={i}
                        className="w-28 p-4 cursor-pointer border border-[#E27D60] rounded-lg shadow-sm hover:shadow-xl transition ease-in-out duration-500"
                      >
                        <img
                          src={"http://localhost:8000" + product.image}
                          alt="CAT"
                          className=""
                        />
                        <p className="size-4 pt-1">{product.name}</p>
                      </div>
                    </Link>

                    {/* VARIANTS */}
                    <div>
                      <ul>
                        {!product.variants.length == 0 ? (
                          <p>
                            {/* <p>{product.name}</p> */}
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
                    </div>
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

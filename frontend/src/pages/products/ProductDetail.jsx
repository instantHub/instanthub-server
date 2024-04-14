import React, { useState, useEffect } from "react";
import { useGetProductDetailsQuery } from "../../features/api";
import { useParams, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setGetUpto } from "../../features/deductionSlice";

const ProductDetail = () => {
  const { prodId } = useParams();
  const { data: productDetails, isLoading } = useGetProductDetailsQuery(prodId);
  const [toggle, setToggle] = useState(true);
  const [variantSelected, setVariantSelected] = useState([]);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedDiv, setSelectedDiv] = useState();

  const dispatch = useDispatch();

  const handleToggle = (variantSelected) => {
    setToggle((prevState) => !prevState);
    setVariantSelected(variantSelected);
    // console.log("calling dispatch");
    // dispatch(setGetUpto(variantSelected));
    setIsSelected(!isSelected);
    setSelectedDiv(variantSelected.id);
  };

  console.log(productDetails);

  return (
    <div className="w-[70%] mx-auto my-36 ">
      {/* <div className="bg-white px-10 pt-10 pb-24 rounded-md shadow-lg"> */}
      <div className="mx-0 mb-6">
        {productDetails && (
          <h1>
            Home / {productDetails.category.name} /{" "}
            <Link to="/"> {productDetails.brand.name}</Link> / Products /
            <span> {productDetails.name}</span>
          </h1>
        )}
        <hr className="text-black mt-1" />
      </div>
      <div className="ring-0 ring-transparent shadow">
        {isLoading ? (
          <h1 className="text-5xl text-black opacity-40 mx-auto">Loading...</h1>
        ) : (
          <>
            {/* <div className="flex gap-10 "> */}
            <div className="bg-white flex flex-col sm:flex-row rounded-lg px-3 sm:p-6 max-sm:pb-3 ring-0 ring-transparent shadow max-sm:flex-col">
              {/* IMAGE */}
              <div className="sm:flex items-center justify-center mr-5 w-full sm:max-w-xs max-sm:size-32 sm:w-1/3 h-20 sm:h-96 max-sm:mx-auto">
                <div className="flex items-center justify-center h-full w-full">
                  <img
                    src={"http://localhost:8000" + productDetails.image}
                    alt="CAT"
                    className="size-48 max-sm:size-32"
                  />{" "}
                </div>
              </div>

              {/* Products Details */}
              <div className="flex flex-col gap-24 w-full sm:w-2/3 max-sm:gap-6">
                <div className="mt-6 flex gap-2 items-center">
                  <h1 className="text-3xl">{productDetails.name}</h1>
                  {variantSelected.length != 0 && (
                    <h3 className="text-2xl">({variantSelected.name})</h3>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <p>Choose a Variant</p>

                  {variantSelected.length == 0 && (
                    <p className="opacity-40 text-sm">
                      Select a variantSelected to know the price
                    </p>
                  )}

                  {/* VARIANT PRICE WILL BE SHOWN WHEN CLICKED ON A VARIANT */}
                  <div className="">
                    <h2 className="text-5xl text-yellow-500">
                      {variantSelected.price}
                    </h2>
                  </div>
                  {/* END OF VARIANT PRICE */}

                  <div className="flex flex-row flex-wrap list-none p-0 my-0 -mx-2">
                    {productDetails.variants.map((variantSelected) => (
                      <>
                        <div
                          key={variantSelected.id}
                          className="p-2 w-1/2 sm:w-40 sm:max-w-full"
                          onClick={() => handleToggle(variantSelected)}
                        >
                          <div
                            className={`${
                              selectedDiv == variantSelected.id
                                ? "bg-amber-500 text-white"
                                : "bg-white"
                            } flex items-center rounded-md cursor-pointer p-2.5 ring-0 ring-transparent shadow`}
                          >
                            <span className="border border-solid border-surface-dark rounded-full w-5 h-5 mr-1.5"></span>
                            <span className="text-sm flex-1 flex justify-center">
                              {variantSelected.name}
                            </span>
                          </div>
                          {/* var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow) */}
                        </div>
                      </>
                    ))}
                  </div>

                  {variantSelected.length != 0 ? (
                    <div>
                      <Link
                        // to={`/categories/brands/productDetails/${prodId}/productDeductions`}
                        to={`/sell/deductions?prodId=${prodId}&variant=${variantSelected.name}`}
                      >
                        <button
                          className="bg-emerald-600 text-white px-4 py-2 rounded-md"
                          // onClick={}
                        >
                          Get Exact Value
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <button
                        className="bg-emerald-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400 disabled:opacity-30 disabled:text-black"
                        disabled
                      >
                        Get Exact Value
                      </button>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="py-1 px-2 w-3/4 bg-yellow-200 max-sm:w-full">
                    <p className="text-xs opacity-70">
                      The above pricing is subject to change based on the
                      product's condition. The final pricing offer will be
                      provided after the entire product has been inspected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

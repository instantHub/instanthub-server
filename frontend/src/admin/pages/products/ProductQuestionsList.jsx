import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useGetAllProductsQuery,
  useGetProductDetailsQuery,
  useUpdatePriceDropMutation,
} from "../../../features/api";
import { toast } from "react-toastify";

const ProductQuestionsList = () => {
  const { productId } = useParams();
  // const { data: productDetail, isLoading: productsLoading } =
  //   useGetAllProductsQuery({ page: 1, limit: 10, search: "" });

  const { data: productDetail, isLoading: productsLoading } =
    useGetProductDetailsQuery(productId);

  const [productData, setProductData] = useState();
  const [updatePriceDrop, { isLoading: updateLoading }] =
    useUpdatePriceDropMutation();

  useEffect(() => {
    if (productDetail) {
      console.log("productDetail", productDetail);

      // Set the matched product to the component state
      setProductData(productDetail);
      console.log("useEffect");
    }
  }, [productDetail]);

  if (productData) {
    console.log("productData", productData);
  }

  // Handle input changes and update productData state
  // New Approach
  const handlePriceDropChange = (conditionLabelId, priceDrop) => {
    // Find the condition label by conditionLabelId and update the priceDrop
    const updatedProductData = {
      ...productData,
      deductions: productData.deductions.map((condition) => ({
        ...condition,
        conditionLabels: condition.conditionLabels.map((label) => ({
          ...label,
          priceDrop:
            label.conditionLabelId === conditionLabelId
              ? priceDrop
              : label.priceDrop,
        })),
      })),
    };
    setProductData(updatedProductData);
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("handleSubmit", productData);

    try {
      await updatePriceDrop({
        productId: productId,
        data: productData,
      }).unwrap();
      toast.success("Updated PriceDrops for the Product");
      // Handle success
    } catch (error) {
      console.error("Error updating condition:", error);
    }
  };

  return (
    <div className="">
      <div className="inline-block m-4 px-4 py-1 bg-green-600 text-white rounded">
        <Link to={"/admin/productsList"}>
          <button>Products List</button>
        </Link>
      </div>

      <div className="w-[95%] flex flex-col mx-auto my-1 bg-white px-4 py-2 rounded shadow-xl">
        <div className="m-2 ">
          <h1 className="text-sm mb-1 sticky">
            {productData ? productData.name : "Loading.."}
          </h1>
          <hr />
        </div>

        <div className="bg-scroll">
          <form onSubmit={handleSubmit}>
            {productData &&
              productData.deductions.map((condition, index) => (
                <div key={index} className=" border my-2 py-2 px-2 rounded">
                  <div>
                    <h1>{condition.conditionName}</h1>
                  </div>
                  <hr />
                  <div className="flex flex-col">
                    {condition.conditionLabels.map((conditionLabel, index) => (
                      <div key={index} className="flex gap-6 items-center mt-2">
                        <div>
                          <div>
                            <h1 className="text-sm">
                              {conditionLabel.conditionLabel}
                            </h1>
                          </div>
                          <div className="">
                            <input
                              type="number"
                              name="priceDrop"
                              value={conditionLabel.priceDrop}
                              className="border px-3 py-1 rounded text-[0.9rem]"
                              placeholder="Price Drop"
                              // onChange={handleInputChange}
                              onChange={(e) =>
                                handlePriceDropChange(
                                  conditionLabel.conditionLabelId,
                                  parseInt(e.target.value)
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <img
                            src={
                              import.meta.env.VITE_APP_BASE_URL +
                              conditionLabel.conditionLabelImg
                            }
                            alt="conditionLabelImg"
                            className="w-[60px] h-[60px] mx-auto "
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            <div className="py-3 px-2">
              <button
                type="submit"
                className="border w-[20%] border-black bg-blue-500 text-white rounded-md p-1 cursor-pointer hover:bg-white hover:text-black"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductQuestionsList;

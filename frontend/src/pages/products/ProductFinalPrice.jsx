import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProductFinalPrice = () => {
  const selectedProdDetails = useSelector((state) => state.deductions);
  // console.log(selectedProdDetails);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProdDetails.productName == "") {
      navigate(`/`);
    }
  });

  return (
    <div className="flex flex-col items-center my-[10%] mx-auto">
      <div className="p-4 flex flex-col items-center">
        <h1 className="text-[20px]">
          Product {"  "}
          <span className="text-[30px] text-yellow-500 font-semibold">
            {selectedProdDetails.productName +
              " " +
              selectedProdDetails.getUpTo.variantName}
          </span>
          <span className="text-[25px] text-green-600 font-bold"></span>
        </h1>

        <h1 className="text-[20px]">
          Quoted Price{" "}
          <span className="text-[30px] text-yellow-500 font-bold">
            {selectedProdDetails.getUpTo.price}/-
          </span>
        </h1>
        <h1 className="text-[20px]">
          Final Price{" "}
          {/* <span className="text-[30px] text-green-600 font-bold">4800/-</span> */}
          <span className="text-[30px] text-green-600 font-bold">
            {selectedProdDetails.getUpTo.price -
              selectedProdDetails.toBeDeducted}
            /-
          </span>
        </h1>
        <h1 className="text-center">
          This is your Products Final Price based on the following criteria
          which you mentioned
        </h1>
        <ul>
          {selectedProdDetails.deductions.map((deduction, index) => (
            <li key={index}>
              <span>{index + 1}. </span>{" "}
              <span className="text-lg font-semibold text-red-600">
                {deduction.conditionLabel}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center">
        <h2>Want to sell?..</h2>
        <h2 className="text-center">
          Click on "Sell" below and book your order for Instant Cash Pick
        </h2>
        <button className="px-4 py-1 border text-white bg-[#E27D60] rounded">
          Sell
        </button>
      </div>
    </div>
  );
};

export default ProductFinalPrice;

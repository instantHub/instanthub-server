import React from "react";
import { useSelector } from "react-redux";

const ProdDeductionsRight = () => {
  const productsData = useSelector((state) => state.deductions);
  return (
    // <div>
    <div className="w-[25%] border rounded">
      <>
        <div className="flex items-center justify-center gap-3 p-2">
          <div>
            <img
              src={"http://localhost:8000" + productsData.productImage}
              alt="ProductImg"
              className="size-20 max-sm:size-32"
            />{" "}
          </div>
          <div className="text-sm">
            <h1>{productsData.productName}</h1>
            <span>{productsData.getUpTo.variantName}</span>
          </div>
        </div>
        <hr />

        <div>
          <div className="mt-6 mx-auto px-4">
            <div className="py-3 font-bold text-gray-400">
              <h1>Evaluation</h1>
            </div>

            <div>
              <ul>
                {productsData.deductions.map((label, index) => (
                  <>
                    <li key={index}>
                      {" "}
                      <span className="text-sm text-[#E27D60] opacity-70">
                        {index + 1}
                        {`)`}
                      </span>{" "}
                      {label.conditionLabel}
                    </li>
                  </>
                ))}
                {/* {age && (
                    <li>
                      {" "}
                      <span className="text-sm text-[#E27D60] opacity-70">{`${
                        selectedLabels.length + 1
                      })`}</span>{" "}
                      {age.conditionLabel}
                    </li>
                  )} */}
              </ul>
            </div>
          </div>
        </div>
      </>
    </div>
    // </div>
  );
};

export default ProdDeductionsRight;

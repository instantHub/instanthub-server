import React from "react";
import { useSelector } from "react-redux";

const ProdDeductionsRight = () => {
  const productsData = useSelector((state) => state.deductions);
  console.log(productsData);
  const laptopSlice = useSelector((state) => state.laptopDeductions);

  return (
    // <div>
    <div className="w-[25%] border rounded max-2sm:hidden">
      <>
        <div className="flex items-center justify-center gap-3 p-2">
          <div>
            <img
              src={
                import.meta.env.VITE_APP_BASE_URL + productsData.productImage
              }
              alt="ProductImg"
              className="size-20"
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
              {/* Laptop's Processor, HardDisk & Ram display */}
              {productsData.productCategory === "Laptop" && (
                <ul>
                  <li className="py-1 pl-2">
                    {laptopSlice.processor.conditionLabel}
                  </li>
                  <li className="py-1 pl-2">
                    {laptopSlice.hardDisk.conditionLabel}
                  </li>
                  <li className="py-1 pl-2">
                    {laptopSlice.ram.conditionLabel}
                  </li>
                </ul>
              )}

              <ul>
                {/* Displaying all selected deduction */}
                {productsData.deductions.map((label, index) => (
                  <li key={index} className="py-1 pl-2 text-md">
                    {label.conditionLabel}
                  </li>
                ))}

                {/* Products Age display when selected */}
                {productsData.productAge && (
                  <>
                    {/* <h1 className="mt-2 mb-1">{productsData.productCategory} Age</h1> */}
                    <li className="py-1 pl-2 text-md">
                      {productsData.productAge.conditionLabel}
                    </li>
                  </>
                )}
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

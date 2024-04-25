import React, { useEffect, useRef, useState } from "react";
import { useGetProductDetailsQuery } from "../../features/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addDeductions,
  setGetUpto,
  clearDeductions,
  removeDeductions,
  addProductAge,
} from "../../features/deductionSlice";
import { clearLaptopDeductions } from "../../features/laptopDeductionSlice";
import { toast } from "react-toastify";
import ProdDeductionsRight from "./ProdQuestionsRight";
import LaptopsQuestions from "./LaptopsQuestions";

const ProductDeductions = () => {
  // Query Params
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const selectedVariant = searchParams.get("variant");

  //   Fetching Product details
  const { data: productsData, isLoading } =
    useGetProductDetailsQuery(productId);
  const [priceGetUpTo, setPriceGetUpTo] = useState();
  const [deductions, setDeductions] = useState();
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [currentConditionIndex, setCurrentConditionIndex] = useState(0);
  const [checkIsOn, setCheckIsOn] = useState(false);
  const [checkIsOff, setCheckIsOff] = useState(false);

  const [age, setAge] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const deductionData = useSelector((state) => state.deductions.deductions);
  const data = useSelector((state) => state.deductions);
  // console.log("useSelector", deductionData);

  if (productsData) {
    // console.log("productsData", productsData);
  }

  const handleAge = async (ageLabel, price) => {
    // setAge({ conditionLabel: ageLabel, priceDrop: price });
    // console.log(ageLabel, price);
    // Logic to handle continue to the next condition
    // if (age) {
    //   handleContinue();
    // }

    setAge(true);
    dispatch(addProductAge({ conditionLabel: ageLabel, priceDrop: price }));
  };

  const handleLabelSelection = (label, price) => {
    if (!selectedLabels.some((sl) => sl.conditionLabel == label)) {
      setSelectedLabels([
        ...selectedLabels,
        { conditionLabel: label, priceDrop: price },
      ]);
      dispatch(addDeductions({ conditionLabel: label, priceDrop: price }));
      console.log("selectedLabels", selectedLabels);
    } else if (selectedLabels.some((sl) => sl.conditionLabel == label)) {
      setSelectedLabels(
        selectedLabels.filter(
          (selectedLabel) => selectedLabel.conditionLabel !== label
        )
      );
      dispatch(removeDeductions({ conditionLabel: label, priceDrop: price }));
    }
  };

  // handle continue to next condition and its conditionLabellist
  const handleContinue = async () => {
    // Logic to handle continue to the next condition
    if (currentConditionIndex < deductions.length - 1) {
      setCurrentConditionIndex(currentConditionIndex + 1);
    } else {
      dispatch(addDeductions(data.productAge));
      // Handle if there are no more conditions
      console.log("No more conditions to display.");
      navigate(`/sell/deductions/finalPrice?productId=${productsData.id}`);
    }
  };

  // UseEffect to clear Deductions on initial render from reducer
  useEffect(() => {
    // Dispatch the action to clear deductions on initial render
    dispatch(clearDeductions());
    dispatch(clearLaptopDeductions());

    // Event listener to handle browser back button
    const handlePopstate = () => {
      // Dispatch the action to clear deductions when the user navigates back using the browser back button
      dispatch(clearDeductions());
      dispatch(clearLaptopDeductions());
    };

    // Add event listener for the popstate event
    window.addEventListener("popstate", handlePopstate);

    // Cleanup function to remove event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [dispatch]); // include dispatch in the dependency array to ensure that it has access to the latest dispatch function.

  // useEffect to set priceUpTo value from productsData
  useEffect(() => {
    if (productsData) {
      const variant = productsData.variants.filter(
        (variant) => variant.name == selectedVariant
      );
      setPriceGetUpTo(variant[0].price);
      setDeductions(productsData.deductions);
    }
    // console.log("selectedVariant", selectedVariant, priceGetUpTo);
  }, [productsData]);

  // useEffect to set initial State(productName,productCategory,productImage,variantName,price) in reducer
  useEffect(() => {
    let prodVariant = undefined;
    if (productsData) {
      prodVariant = {
        productCategory: productsData.category.name,
        productName: productsData.name,
        productImage: productsData.image,
        variantName: selectedVariant,
        price: priceGetUpTo,
      };
      dispatch(setGetUpto(prodVariant));
    }
  }, [priceGetUpTo]);

  // if no deduction questions found
  if (productsData) {
    if (productsData.deductions.length < 1) {
      return (
        <h1 className="my-[10%] mx-auto text-center">
          No Questions Available Yet for Category{" "}
          <span className="font-bold"> {productsData.category.name}</span>
        </h1>
      );
    }
  }

  // console.log("priceGetUpTo", priceGetUpTo);
  // console.log("Deductions", deductions);

  return (
    <>
      <div className=" mt-4 ">
        <div className="flex gap-3 justify-center my-auto">
          <div className="w-[55%] flex flex-col border py-6 rounded my-auto ">
            {!checkIsOff && (
              <div className="mx-auto pb-10">
                <h1 className="">Tell Us More About Your Device</h1>
              </div>
            )}

            {/* Is mobile Switched On YES or NO */}
            {!checkIsOn && !checkIsOff && (
              <div className="px-5 py-2">
                <h1 className="justify-center text-center pb-4">
                  Is your {productsData && productsData.category.name} Switched
                  On?
                </h1>

                <div className="flex gap-4 justify-center">
                  <div
                    onClick={() => setCheckIsOn(true)}
                    className={`flex pr-16 items-center border rounded-md cursor-pointer p-2.5 ring-0 ring-transparent shadow hover:border-[#E27D60]`}
                  >
                    <span className="border border-solid rounded-full w-5 h-5 mr-1.5"></span>
                    <span className="text-sm  flex-1 flex justify-center">
                      Yes
                    </span>
                  </div>
                  <div
                    onClick={() => setCheckIsOff(true)}
                    className={`flex pr-16 items-center border rounded-md cursor-pointer p-2.5 ring-0 ring-transparent shadow hover:border-[#E27D60]`}
                  >
                    <span className="border px- border-solid border-surface-dark rounded-full w-5 h-5 mr-1.5"></span>
                    <span className="text-sm  flex-1 flex justify-center">
                      No
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* If the product if switched off */}
            {checkIsOff && (
              <div className="my-10 text-center">
                <div className="flex flex-col items-center">
                  <h1 className="my-3">
                    Your {productsData.category.name}
                    <span className="font-semibold"> {productsData.name} </span>
                    is{" "}
                    <span className="text-red-500 font-semibold">
                      Switched Off.
                    </span>
                  </h1>
                  <span className="text-lg px-4 text-[#E27D60]">
                    Please Contact Customer Support 8722288017
                  </span>
                </div>
              </div>
            )}

            {/* If products data is loading */}
            {isLoading && (
              <div className="flex flex-col justify-center items-center h-32">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                <span>Loading...</span>
              </div>
            )}

            {/* Products that are not under Laptop Category */}
            {/* All conditions Except AGE */}
            {checkIsOn &&
              productsData &&
              productsData.category.name !== "Laptop" &&
              deductions &&
              !deductions[currentConditionIndex].conditionName.includes(
                "Age"
              ) && (
                <div className="flex flex-col">
                  <div className="px-5 py-2 text-center font-extrabold text-lg">
                    <h1>{deductions[currentConditionIndex].conditionName}</h1>
                  </div>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 items-center px-4">
                    {deductions[currentConditionIndex].conditionLabels.map(
                      (label) => (
                        <div
                          className={`${
                            // selectedLabels.includes(label.conditionLabel)
                            selectedLabels.some(
                              (condLabel) =>
                                condLabel.conditionLabel == label.conditionLabel
                            )
                              ? "border-[#E27D60] border-red-600"
                              : ""
                          } flex flex-col border rounded items-center`}
                          // onClick={() =>
                          //   handleLabelSelection(label.conditionLabel)
                          // }
                          onClick={() =>
                            handleLabelSelection(
                              label.conditionLabel,
                              label.priceDrop
                            )
                          }
                        >
                          <div className="p-4">
                            <img
                              src={
                                import.meta.env.VITE_APP_BASE_URL +
                                label.conditionLabelImg
                              }
                              alt="LabelImg"
                              className="size-20 max-sm:size-24"
                            />
                          </div>
                          <div
                            key={label.conditonLabelId}
                            className={`${
                              // selectedLabels.includes(label.conditionLabel)
                              selectedLabels.some(
                                (condLabel) =>
                                  condLabel.conditionLabel ==
                                  label.conditionLabel
                              )
                                ? "bg-[#E27D60] text-white bg-cyan-500"
                                : "bg-slate-100 "
                            } py-2 text-sm text-center w-full`}
                          >
                            {label.conditionLabel}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    onClick={handleContinue}
                    className="px-2 py-1 border rounded w-1/2 m-2"
                  >
                    Continue
                  </button>
                </div>
              )}

            {/* Laptop questions design */}
            {checkIsOn &&
              productsData &&
              productsData.category.name === "Laptop" &&
              deductions &&
              !deductions[currentConditionIndex].conditionName.includes(
                "Age"
              ) && (
                <LaptopsQuestions
                  productsData={productsData}
                  deductions={deductions}
                  handleContinue={handleContinue}
                  handleLabelSelection={handleLabelSelection}
                />
              )}

            {/* AGE selection */}
            {checkIsOn &&
              productsData &&
              deductions &&
              deductions[currentConditionIndex].conditionName.includes(
                "Age"
              ) && (
                <div className="flex flex-col">
                  <div className="px-5 py-2 text-center font-extrabold text-lg">
                    <h1>{deductions[currentConditionIndex].conditionName}</h1>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 items-center px-4">
                    {deductions[currentConditionIndex].conditionLabels.map(
                      (label) => (
                        <div
                          className={`${
                            //   selectedLabels.includes(label.conditionLabel)
                            selectedLabels.some(
                              (condLabel) =>
                                condLabel.conditionLabel == label.conditionLabel
                            )
                              ? "border-[#E27D60]"
                              : ""
                          } flex flex-col border rounded items-center`}
                        >
                          <div className="flex text-sm items-center gap-1">
                            <input
                              type="radio"
                              name="age"
                              id=""
                              className="px-4 py-2"
                              placeholder={label.conditionLabel}
                              onClick={() =>
                                handleAge(label.conditionLabel, label.priceDrop)
                              }
                              required
                            />
                            <label htmlFor="age">{label.conditionLabel} </label>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {age ? (
                    <button
                      onClick={handleContinue}
                      className="px-2 py-1 border rounded w-1/2 m-2"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      className="px-2 py-1 border rounded w-1/2 m-2 bg-gray-400 opacity-35"
                      disabled
                    >
                      Select Age To Continue
                    </button>
                  )}
                </div>
              )}
          </div>

          {/* Right Side Div */}
          <ProdDeductionsRight />
        </div>
      </div>
    </>
  );
};

export default ProductDeductions;

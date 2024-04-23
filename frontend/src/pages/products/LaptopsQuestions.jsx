import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addDeductions, removeDeductions } from "../../features/deductionSlice";
import {
  addProcessor,
  addHardDisk,
  addRam,
} from "../../features/laptopDeductionSlice";
import { toast } from "react-toastify";

const LaptopsQuestions = (props) => {
  //   const { productsData, deductions } = props;
  const { productsData, deductions, handleLabelSelection } = props;
  //   console.log(productsData, deductions, handleLabelSelection);
  const [processor, setProcessor] = useState();
  const [hardDisk, setHardDisk] = useState();
  const [ram, setRam] = useState();

  const age = "";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const laptopSlice = useSelector((state) => state.laptopDeductions);
  const deductionData = useSelector((state) => state.deductions.deductions);
  console.log("laptopSlice", laptopSlice);
  console.log("deductionData", deductionData);

  //   const deductionsPerPage = 3; // Number of deductions to display per page
  const [currentPage, setCurrentPage] = useState(1);

  // Function to get deductions to display on the current page
  const getDeductionsForPage = () => {
    if (currentPage === 1) {
      return deductions.slice(0, 3);
    } else {
      return deductions.slice(currentPage + 1, currentPage + 2);
    }
  };

  // Function to handle moving to the next page
  const handleContinue = () => {
    // If in 1st page all fields must be selected
    if (currentPage === 1) {
      if (
        processor === undefined ||
        hardDisk === undefined ||
        ram === undefined
      ) {
        toast.error("select all system configurations");
        return;
      }
    }

    if (currentPage < deductions.length - 2) {
      setCurrentPage(currentPage + 1);
    } else {
      dispatch(addDeductions(laptopSlice.processor));
      dispatch(addDeductions(laptopSlice.hardDisk));
      dispatch(addDeductions(laptopSlice.ram));

      // Handle if there are no more conditions
      console.log("No more conditions to display.");
      navigate(`/sell/deductions/finalPrice?productId=${productsData.id}`);
    }
  };

  const handleSelectChange = (event) => {
    const selectedIndex = event.target.selectedIndex;
    const selectedOption = event.target.options[selectedIndex];

    const conditionLabel = selectedOption.getAttribute("data-arg1");
    const priceDrop = selectedOption.getAttribute("data-arg2");
    const conditionName = selectedOption.getAttribute("data-arg3");
    console.log("arg", conditionLabel, priceDrop, conditionName);

    if (conditionName === "Processor") {
      setProcessor({ conditionLabel, priceDrop });
      dispatch(addProcessor({ conditionLabel, priceDrop }));
    } else if (conditionName === "Hard Disk") {
      setHardDisk({ conditionLabel, priceDrop });
      dispatch(addHardDisk({ conditionLabel, priceDrop }));
    } else if (conditionName === "Ram") {
      setRam({ conditionLabel, priceDrop });
      dispatch(addRam({ conditionLabel, priceDrop }));
    }

    // Call your function with the selected option's arguments
    // handleLabelSelection(arg1, arg2);
    // handleLaptopLabelSelection();
  };

  //   console.log("state", processor, hardDisk, ram);
  //   console.log("selectedLabels", selectedLabels);

  return (
    <div>
      <div className="flex flex-col">
        {/* testing */}
        {/* <h1>Page {currentPage}</h1> */}
        {currentPage === 1 && (
          <h1 className="text-center font-semibold">
            Select the system configuration of your device?
          </h1>
        )}
        <div>
          {getDeductionsForPage().map((deduction, index) => (
            <div key={index} className="px-8 py-4">
              {/* Condtion Name */}
              {currentPage === 1 ? (
                <div className="px-1 py-2 font-extrabold text-lg">
                  <h1>{deduction.conditionName}</h1>
                </div>
              ) : (
                <div className="px-5 py-2 text-center font-extrabold text-lg">
                  <h1>{deduction.conditionName}</h1>
                </div>
              )}
              {/* Processor, Ram & HardDisk Questions */}
              {currentPage === 1 ? (
                <>
                  <div className="flex">
                    <select
                      className="block appearance-none w-full bg-white border border-gray-0 hover:border-gray-200 px-4 py-4 pr-8 rounded shadow-lg leading-tight focus:outline-none focus:shadow-outline"
                      onChange={handleSelectChange}
                    >
                      <option
                        value=""
                        className="py-2 bg-transparent hover:bg-gray-200"
                      >
                        search
                      </option>
                      {deduction.conditionLabels.map((label, index) => (
                        <option
                          key={index}
                          data-arg1={label.conditionLabel}
                          data-arg2={label.priceDrop}
                          data-arg3={deduction.conditionName}
                        >
                          {label.conditionLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 items-center px-4">
                    {deduction.conditionLabels.map((label, index) => (
                      <div key={index}>
                        <div
                          className={`${
                            deductionData.some(
                              (condLabel) =>
                                condLabel.conditionLabel == label.conditionLabel
                            )
                              ? "border-[#E27D60]"
                              : ""
                          } flex flex-col border rounded items-center`}
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
                              deductionData.some(
                                (condLabel) =>
                                  condLabel.conditionLabel ==
                                  label.conditionLabel
                              )
                                ? "bg-[#E27D60] text-white"
                                : "bg-slate-100 "
                            } py-2 text-sm text-center w-full`}
                          >
                            {label.conditionLabel}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="px-2 py-1 border rounded w-1/2 m-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LaptopsQuestions;

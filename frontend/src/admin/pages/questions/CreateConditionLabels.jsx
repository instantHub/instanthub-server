import React, { useState } from "react";
import {
  useGetConditionsQuery,
  useGetCategoryQuery,
} from "../../../features/api";

import { Link } from "react-router-dom";

const CreateConditionLabels = () => {
  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoryQuery();

  const { data: conditionsData, isLoading: conditionsLoading } =
    useGetConditionsQuery();

  const [formData, setFormData] = useState({
    category: "",
    condition: "",
    conditionNames: [{ name: "" }],
  });

  if (conditionsLoading) {
    console.log(conditionsData);
  }

  // Function to handle changes in the form fields
  const handleChange = (event, index, field, arrayName) => {
    const { value } = event.target;
    const updatedFormData = { ...formData };
    updatedFormData[arrayName][index][field] = value;
    setFormData(updatedFormData);
  };

  // Function to add a new condition name
  const addConditionName = () => {
    setFormData((prevState) => ({
      ...prevState,
      conditionNames: [...prevState.conditionNames, { name: "" }],
    }));
  };

  // Function to delete a condition name
  const deleteConditionName = (index) => {
    setFormData((prevState) => {
      const updatedConditionNames = [...prevState.conditionNames];
      updatedConditionNames.splice(index, 1);
      return { ...prevState, conditionNames: updatedConditionNames };
    });
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    // await createQuestion(JSON.stringify(formData)).unwrap();
    console.log("handleSubmit", formData);
  };
  return (
    <div className="flex gap-4">
      <div className="">
        <div className="flex justify-between items-center">
          <h1 className="bold text-[1.4rem] mb-2">Create ConditionLabel</h1>
          <div className="flex items-center gap-1">
            <h2>Home </h2>
            <h2 className="pl-1"> / Add ConditionLabel</h2>
          </div>
        </div>
        <div className="bg-white border rounded-md shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4  p-5 ">
            <div>
              <h2 className="">Add ConditionLabel</h2>
            </div>
            <hr />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label>Category:</label>
                <select
                  name=""
                  id=""
                  className="border p-1 rounded"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    });
                  }}
                  required
                >
                  <option value="">Select a category</option>
                  {!categoryLoading &&
                    categoryData.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        name="category"
                        className=""
                      >
                        {category.name}
                      </option>
                    ))}
                </select>{" "}
              </div>

              <div className="flex flex-col">
                <label>Conditions:</label>
                <select
                  name=""
                  id=""
                  className="border p-1 rounded"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      condition: e.target.value,
                    });
                  }}
                  required
                >
                  <option value="">Select a condition</option>
                  {!conditionsLoading &&
                    conditionsData.map(
                      (condition) =>
                        formData.category == condition.category && (
                          <option
                            key={condition.id}
                            value={condition.id}
                            name="category"
                            className=""
                          >
                            {condition.conditionName}
                          </option>
                        )
                    )}
                </select>{" "}
              </div>
            </div>

            <div className="mx-auto">
              <button
                type="button"
                onClick={addConditionName}
                className="border border-black  bg-emerald-600 rounded-md px-4 py-2 text-white hover:text-black cursor-pointer hover:bg-white "
              >
                Add Condition
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-lg:grid-cols-1">
              {formData.conditionNames.map((condition, index) => (
                <div key={index} className="flex flex-col">
                  <div className="">
                    <label>Condition Name:</label>
                    <input
                      type="text"
                      name="name"
                      className="border mx-2 py-1 px-2 rounded text-[15px]"
                      placeholder="Enter Condition Name"
                      value={condition.name}
                      onChange={(event) =>
                        handleChange(event, index, "name", "conditionNames")
                      }
                    />
                    <button
                      type="button"
                      onClick={() => deleteConditionName(index)}
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="py-3 px-2">
              <button
                type="submit"
                className="border w-[80%] mx-auto border-black bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="my-auto ml-[5%]">
        <ul>
          <li>Item 1</li>
          <li>Item 1</li>
          <li>Item 1</li>
          <li>Item 1</li>
          <li>Item 1</li>
          <li>Item 1</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateConditionLabels;

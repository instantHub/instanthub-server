import React, { useState, useRef } from "react";
import {
  useGetConditionsQuery,
  useGetCategoryQuery,
  useUploadFileHandlerMutation,
  useCreateConditionLabelsMutation,
  useUploadConditionLabelsImageMutation,
} from "../../../features/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const YourComponent = () => {
  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoryQuery();
  const { data: conditionsData, isLoading: conditionsLoading } =
    useGetConditionsQuery();
  const [uploadConditionLabelsImage, { isLoading: uploadLoading }] =
    useUploadConditionLabelsImageMutation();
  const [createConditionLabels, { isLoading: clLoading }] =
    useCreateConditionLabelsMutation();

  if (categoryData) {
    // console.log("cat", categoryData);
  }
  if (conditionsData) {
    // console.log("con from conditionlabels", conditionsData);
  }

  // Create a ref to store the reference to the file input element
  const fileInputRef = useRef(null);

  const [imageSelected, setImageSelected] = useState();

  const [formData, setFormData] = useState({
    category: "",
    conditionNameId: "",
    // condition: "",
    conditionLabel: "",
    conditionLabelImg: undefined,
  });

  // Function to handle changes in the form fields
  // const handleChange = (event, index, field, arrayName) => {
  //   const { value } = event.target;
  //   const updatedFormData = { ...formData };
  //   updatedFormData[arrayName][index][field] = value;
  //   setFormData(updatedFormData);
  // };

  // File handler
  const uploadFileHandler = async () => {
    const imageData = new FormData();
    // formData.append("image", imageSelected);
    imageData.append("image", formData.conditionLabelImg);

    try {
      const res = await uploadConditionLabelsImage(imageData).unwrap();

      return res.image;
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handle submit");
    console.log(formData);

    formData.conditionLabelImg = await uploadFileHandler();

    console.log("conditionLabelData: ", formData);

    try {
      const conditionLabel = await createConditionLabels(
        JSON.stringify(formData)
      ).unwrap();
      // productId = product.id;
      console.log("conditionLabel created", conditionLabel);
      toast.success("conditionLabel created successfully..!");
      // Clear the value of the file input
      fileInputRef.current.value = "";
      // Mark the file input as required again
      fileInputRef.current.required = true;
    } catch (error) {
      console.log(
        "Error while creating conditionLabel using API call: ",
        error
      );
    }
  };

  return (
    <div className="flex gap-4">
      <div className="">
        <div className="flex justify-between items-center">
          <h1 className="bold text-[1.4rem] mb-2">Create ConditionLabels</h1>
          <div className="flex items-center gap-1">
            <h2>Home </h2>
            <h2 className="pl-1"> / Add ConditionLabels</h2>
            <Link to="/admin/conditionLabelsList">
              <button
                type="button"
                className="border mx-auto border-gray-950 bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
              >
                ConditionLabels List
              </button>
            </Link>
          </div>
        </div>
        <div className="bg-white border rounded-md shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 ">
            <div>
              <h2 className="">Add ConditionLabels</h2>
            </div>
            <hr />

            <div className="flex">
              <div className="">
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
                          // condition: e.target.value,
                          conditionNameId: e.target.value,
                        });
                      }}
                      required
                    >
                      <option value="">Select a condition</option>
                      {!conditionsLoading &&
                        conditionsData.map(
                          (condition) =>
                            condition.category.id == formData.category && (
                              <option
                                key={condition.id}
                                value={condition.id}
                                name="condition"
                                className=""
                              >
                                {condition.conditionName}
                              </option>
                            )
                        )}
                    </select>{" "}
                  </div>
                </div>
                <label>Condition Label:</label>
                <input
                  type="text"
                  name="label"
                  className="border mx-2 py-1 px-2 rounded text-[15px]"
                  placeholder="Enter Condition Label"
                  value={formData.conditionLabel.label}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      conditionLabel: e.target.value,
                    });
                  }}
                  required
                />
                <input
                  type="file"
                  name="image"
                  ref={fileInputRef}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      conditionLabelImg: e.target.files[0],
                    });
                  }}
                  // onChange={(e) => setImageSelected(e.target.files[0])}
                  required
                />
              </div>
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
        <ul className="">
          {!conditionsLoading &&
            conditionsData.map(
              (condition) =>
                condition.category.id == formData.category && (
                  <li className="bg-white text-lg px-4 py-2">
                    {condition.conditionName}{" "}
                  </li>
                )
            )}
        </ul>
      </div>
    </div>
  );
};

export default YourComponent;

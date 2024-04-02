import React, { useState } from "react";
import {
  useCreateQuestionMutation,
  useGetAllProductsQuery,
  useGetCategoryQuery,
} from "../../features/api";

import { Link } from "react-router-dom";

function CreateQuestions() {
  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoryQuery();
  const { data: productsData, isLoading: productsLoading } =
    useGetAllProductsQuery();
  const [createQuestion, { isLoading }] = useCreateQuestionMutation();

  const [formData, setFormData] = useState({
    category: "",
    conditions: [
      {
        conditionName: "",
        questions: [{ questionName: "", priceDrop: undefined }],
      },
    ],
  });

  // Function to handle changes in the form fields
  const handleChange = (event, conditionIndex, questionIndex) => {
    const { name, value } = event.target;
    const updatedFormData = { ...formData };
    if (name === "conditionName") {
      updatedFormData.conditions[conditionIndex][name] = value;
    } else if (name === "questionText") {
      updatedFormData.conditions[conditionIndex].questions[
        questionIndex
      ].questionName = value;
    } else if (name === "priceDropNumber") {
      updatedFormData.conditions[conditionIndex].questions[
        questionIndex
      ].priceDrop = value;
    }
    setFormData(updatedFormData);
  };

  // Function to add a new condition
  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        { conditionName: "", questions: [{ questionName: "" }] },
      ],
    });
    console.log("addCategory", formData);
  };

  // Function to add a new question for a condition
  const addQuestion = (conditionIndex) => {
    const updatedFormData = { ...formData };
    updatedFormData.conditions[conditionIndex].questions.push({
      questionName: "",
    });
    setFormData(updatedFormData);
    console.log("addQuestions", formData);
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    // await createQuestion(JSON.stringify(formData)).unwrap();

    // Send formData to backend or perform any other action
    console.log("handleSubmit", formData);
  };

  return (
    <>
      <div className="flex mt-[5%] w-[80%] mx-auto">
        <div className="grow">
          <div className="flex justify-between items-center">
            <h1 className="bold text-[1.4rem] mb-2">Create Questions</h1>
            <div className="flex items-center gap-1">
              <h2>Home </h2>
              <h2 className="pl-1"> / Add Question</h2>
              {/* <div className="py-3 px-2"> */}
              <Link to="/admin/questionsList">
                <button
                  type="button"
                  className="border  mx-auto border-gray-950 bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
                >
                  Questions List
                </button>
              </Link>
              {/* </div> */}
            </div>
          </div>
          <div className="bg-white border rounded-md shadow-lg">
            <form
              onSubmit={handleSubmit}
              //   method="post"
              className="flex flex-col gap-4  p-5 "
            >
              <div>
                <h2 className="">Add Questions</h2>
              </div>
              <hr />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label>Category:</label>
                  <select
                    name=""
                    id=""
                    className="border"
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

                {/* Products */}
                <div className="flex flex-col">
                  <label>Products:</label>
                  <select
                    name=""
                    id=""
                    className="border"
                    // onChange={(e) => {
                    //   setFormData({
                    //     ...formData,
                    //     category: e.target.value,
                    //   });
                    // }}
                    // required
                  >
                    <option value="">Select a Product</option>
                    {!productsLoading &&
                      productsData.map((product) => {
                        // console.log("product", product);
                        if (formData.category == product.category) {
                          return (
                            <option
                              key={product.id}
                              value={product.id}
                              name="product"
                              className=""
                            >
                              {product.name}
                            </option>
                          );
                        }
                      })}
                  </select>{" "}
                </div>
              </div>

              <div className="mx-auto">
                <button
                  type="button"
                  onClick={addCondition}
                  className="border border-black  bg-emerald-600 rounded-md px-4 py-2 text-white hover:text-black cursor-pointer hover:bg-white "
                >
                  Add Condition
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full max-lg:grid-cols-1">
                {formData.conditions.map((condition, conditionIndex) => (
                  // <div key={conditionIndex} className="w-1/2 justify-evenly">
                  <div key={conditionIndex} className="flex flex-col">
                    <div className="">
                      <label>Condition Name:</label>
                      <input
                        type="text"
                        name="conditionName"
                        className="border mx-2 py-1 px-2 rounded text-[15px]"
                        placeholder="Enter Condition Name"
                        value={condition.conditionName}
                        onChange={(event) =>
                          handleChange(event, conditionIndex)
                        }
                      />
                    </div>
                    {condition.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="py-2">
                        <label>Question:</label>
                        <input
                          type="text"
                          name="questionText"
                          value={question.questionName}
                          className="border mx-2 py-1 px-2 rounded text-sm"
                          placeholder="Enter Question"
                          onChange={(event) =>
                            handleChange(event, conditionIndex, questionIndex)
                          }
                        />
                        <input
                          type="number"
                          name="priceDropNumber"
                          value={question.priceDrop}
                          className="border mx-2 py-1 px-2 rounded text-sm"
                          placeholder="Add price to be deducted"
                          onChange={(event) =>
                            handleChange(event, conditionIndex, questionIndex)
                          }
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addQuestion(conditionIndex)}
                      className="border w-1/3 border-gray-950 bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
                    >
                      Add Question
                    </button>
                  </div>
                ))}
              </div>

              {/* <div>
                  <button
                    type="button"
                    onClick={addCondition}
                    className="border border-gray-950 bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
                  >
                    Add Condition
                  </button>
                </div> */}

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
      </div>

      {/*  */}

      {/* <form onSubmit={handleSubmit}>
        <div>
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        {formData.conditions.map((condition, conditionIndex) => (
          <div key={conditionIndex}>
            <label>Condition Name:</label>
            <input
              type="text"
              name="conditionName"
              value={condition.conditionName}
              onChange={(event) => handleChange(event, conditionIndex)}
            />
            {condition.questions.map((question, questionIndex) => (
              <div key={questionIndex}>
                <label>Question:</label>
                <input
                  type="text"
                  name="questionText"
                  value={question.text}
                  onChange={(event) =>
                    handleChange(event, conditionIndex, questionIndex)
                  }
                />
              </div>
            ))}
            <button type="button" onClick={() => addQuestion(conditionIndex)}>
              Add Question
            </button>
          </div>
        ))}
        <button type="button" onClick={addCondition}>
          Add Condition
        </button>
        <button type="submit">Submit</button>
      </form> */}
    </>
  );
}

export default CreateQuestions;

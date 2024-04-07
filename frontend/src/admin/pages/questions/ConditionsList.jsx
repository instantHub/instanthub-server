import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useGetConditionsQuery,
  useGetCategoryQuery,
  useDeleteConditionMutation,
} from "../../../features/api";
import { Link } from "react-router-dom";

const ConditionsTable = () => {
  //   const [questions, setQuestions] = useState([]);
  const { data: conditions, isLoading: conditionsLoading } =
    useGetConditionsQuery();
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoryQuery();
  const [deleteCondition, { isLoading: deleteLoading }] =
    useDeleteConditionMutation();

  const [selectedCondition, setSelectedCondition] = useState(null);

  const handleConditionChange = (e) => {
    setSelectedCondition(e.target.value);
  };

  const handleDelete = async (category, conditionId) => {
    console.log(category, conditionId);
    await deleteCondition({ category, conditionId });
  };

  return (
    //ConditionsListList
    <div className="p-4 bg-black">
      <h2 className="text-white text-lg font-bold mb-4">Conditions Table</h2>
      <div className="mb-4">
        <label htmlFor="condition" className="text-white mr-2">
          Select Category:
        </label>
        <select
          id="condition"
          onChange={handleConditionChange}
          value={selectedCondition}
          className="p-2 rounded bg-gray-300 text-gray-800"
        >
          <option value="">Select</option>

          {!conditionsLoading &&
            conditions.map(
              (condition) => (
                //   question.map((question) => (
                <option key={condition.category} value={condition.category}>
                  {condition.conditionName}
                </option>
              )
              //   ))
            )}
        </select>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-white bg-gray-800">Category</th>
            <th className="px-4 py-2 text-white bg-gray-800">Condition</th>
            {/* <th className="px-4 py-2 text-white bg-gray-800">Price Drop</th> */}
            {/* <th className="px-4 py-2 text-white bg-gray-800">Options</th> */}
            <th className="px-4 py-2 text-white bg-gray-800">Edit & Delete</th>
          </tr>
        </thead>
        {/* <tbody>
          {!questionsLoading &&
            questions.map((question) =>
              question.conditions.map(
                (condition) =>
                  condition.conditionName === selectedCondition &&
                  condition.questions.map((q, index) => (
                    <tr
                      key={`${question._id}-${condition.conditionName}-${index}`}
                      className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                    >
                      <td className="px-4 py-2">{question.category.name}</td>
                      <td className="px-4 py-2">{q.questionName}</td>
                      <td className="px-4 py-2">{q.priceDrop}</td>
                      <td className="px-4 py-2">{q.options.join(", ")}</td>
                      <td className="px-4 py-2">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
              )
            )}
        </tbody> */}

        <tbody className="text-center">
          {!conditionsLoading &&
            conditions.map(
              (condition, index) => (
                //   question.map((question) => (
                <tr className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}>
                  <td className=" py-2">{condition.category.name}</td>
                  <td className=" py-2">{condition.conditionName}</td>
                  <td className="text-white py-2">
                    <div className="flex gap-2 justify-center">
                      <Link to={`/admin/updateCondition/${condition.id}`}>
                        <button className="bg-blue-600 px-3 py-1 rounded-md">
                          Edit
                        </button>
                      </Link>
                      <button
                        className="bg-red-600 px-3 py-1 rounded-md"
                        onClick={() =>
                          handleDelete(condition.category.id, condition.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
              //   ))
            )}
        </tbody>
      </table>
    </div>
  );
};

export default ConditionsTable;

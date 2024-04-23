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

  const [selectedCondition, setSelectedCondition] = useState();
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (categoryId, categoryName, conditionId, conditionName) => {
    console.log(categoryId, categoryName, conditionId, conditionName);
    setSelectedCondition({
      categoryId,
      categoryName,
      conditionId,
      conditionName,
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // const handleConditionChange = (e) => {
  //   setSelectedCondition(e.target.value);
  // };

  const handleDelete = async (category, conditionId) => {
    console.log(category, conditionId);
    await deleteCondition({ category, conditionId });
    closeModal();
  };

  return (
    //ConditionsListList
    <>
      <div className="p-4">
        <h2 className=" text-lg font-bold mb-4">Conditions Table</h2>
        {/* <div className="mb-4">
          <label htmlFor="condition" className="text-white mr-2">
            Select Condition:
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
        </div> */}
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-white bg-gray-800">Category</th>
              <th className="px-4 py-2 text-white bg-gray-800">Condition</th>
              <th className="px-4 py-2 text-white bg-gray-800">
                Edit & Delete
              </th>
            </tr>
          </thead>

          <tbody className="text-center">
            {!conditionsLoading &&
              conditions.map(
                (condition, index) => (
                  //   question.map((question) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                  >
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
                          // onClick={() =>
                          //   handleDelete(condition.category.id, condition.id)
                          // }
                          onClick={() =>
                            openModal(
                              condition.category.id,
                              condition.category.name,
                              condition.id,
                              condition.conditionName
                            )
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
      {isOpen && (
        <td>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-2/4">
              <div className="flex justify-center">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Sure want to delete this Condition?
                </h2>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex gap-4 items-center">
                  <span>Category</span>
                  <h1 className="text-lg font-semibold">
                    {selectedCondition.categoryName}
                  </h1>
                </div>
                <div className="flex gap-4 items-center">
                  <span>Condition</span>
                  <h1 className="text-lg font-semibold">
                    {selectedCondition.conditionName}
                  </h1>
                </div>
              </div>
              <div className="flex justify-around mt-8">
                <button
                  onClick={() =>
                    handleDelete(
                      selectedCondition.categoryId,
                      selectedCondition.conditionId
                    )
                  }
                  className="bg-red-600 text-white px-4 py-1 rounded"
                >
                  Yes
                </button>

                <button
                  onClick={closeModal}
                  className="bg-green-700 text-white px-4 py-1 rounded"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </td>
      )}
    </>
  );
};

export default ConditionsTable;

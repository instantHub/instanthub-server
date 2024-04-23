import React, { useState, useEffect } from "react";
import {
  useGetConditionsQuery,
  useGetCategoryQuery,
  useGetConditionLabelsQuery,
  useDeleteConditionLabelMutation,
} from "../../../features/api";
import { Link } from "react-router-dom";

const ConditionLabelsTable = () => {
  const { data: conditionsData, isLoading: conditionsLoading } =
    useGetConditionsQuery();
  const { data: conditionLabelsData, isLoading: conditionLabelsLoading } =
    useGetConditionLabelsQuery();
  const [deleteConditionLabel, { isLoading: deleteLoading }] =
    useDeleteConditionLabelMutation();
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoryQuery();

  if (conditionLabelsData) {
    console.log("conditionLabelsData", conditionLabelsData);
  }

  const [selectedCondition, setSelectedCondition] = useState(null);

  const handleConditionChange = (e) => {
    setSelectedCondition(e.target.value);
  };

  const handleDelete = async (category, conditionLabelId) => {
    console.log(category, conditionLabelId);
    await deleteConditionLabel({ category, conditionLabelId });
  };

  return (
    //ConditionLabelsTable based on the Condition selected
    <div className="p-4">
      <h2 className=" text-lg font-bold mb-4">ConditionLabels Table</h2>
      <div className="mb-4">
        <label htmlFor="condition" className=" mr-2">
          Select Label:
        </label>
        <select
          id="condition"
          onChange={handleConditionChange}
          value={selectedCondition}
          className="p-2 rounded bg-gray-300 text-gray-800"
        >
          <option value="">Select</option>

          {!conditionsLoading &&
            conditionsData.map(
              (condition) => (
                <option
                  key={condition.category.id}
                  value={condition.conditionName}
                >
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
            <th className="px-4 py-2 text-white bg-gray-800">
              Condition Label
            </th>
            <th className="px-4 py-2 text-white bg-gray-800">
              Condition Label Image
            </th>
            <th className="px-4 py-2 text-white bg-gray-800">Edit & Delete</th>
          </tr>
        </thead>

        <tbody className="text-center">
          {!conditionLabelsLoading &&
            conditionLabelsData.map(
              (conditionLabel, index) => (
                <tr className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}>
                  <td className=" py-2">{conditionLabel.category.name}</td>
                  <td className=" py-2">
                    {conditionLabel.conditionNameId.conditionName}
                  </td>
                  <td className=" py-2">{conditionLabel.conditionLabel}</td>
                  <td className=" py-2">
                    <img
                      src={
                        import.meta.env.VITE_APP_BASE_URL +
                        conditionLabel.conditionLabelImg
                      }
                      alt="CAT"
                      className="w-[60px] h-[60px] mx-auto "
                    />
                  </td>
                  <td className="text-white py-2">
                    <div className="flex gap-2 justify-center">
                      <Link
                        to={`/admin/updateConditionLabel/${conditionLabel.id}`}
                      >
                        <button className="bg-blue-600 px-3 py-1 rounded-md">
                          Edit
                        </button>
                      </Link>
                      <button
                        className="bg-red-600 px-3 py-1 rounded-md"
                        onClick={() =>
                          handleDelete(
                            conditionLabel.category.id,
                            conditionLabel.id
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
  );
};

export default ConditionLabelsTable;

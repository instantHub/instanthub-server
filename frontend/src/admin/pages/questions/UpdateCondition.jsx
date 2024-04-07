import React, { useEffect, useState } from "react";
import {
  useGetConditionsQuery,
  useUpdateConditionMutation,
} from "../../../features/api";
import { Link, useParams } from "react-router-dom";

function UpdateCondition() {
  const { conditionId } = useParams();
  //   console.log(conditionId);

  const { data: conditionsData, isLoading: conditionsLoading } =
    useGetConditionsQuery();
  const [
    updateCondition,
    { isLoading: updateConditionLoading, isError: updateConditionError },
  ] = useUpdateConditionMutation();

  const [formData, setFormData] = useState({
    category: "",
    conditionName: "",
  });

  let conditiontoUpdate;
  if (!conditionsLoading) {
    conditiontoUpdate = conditionsData.filter(
      (condition) => condition.id == conditionId
    );
  }

  useEffect(() => {
    if (conditionsData) {
      //   conditiontoUpdate = conditionsData.filter(
      //     (condition) => condition.id == conditionId
      //   );
      console.log("useEffect", conditiontoUpdate);
      setFormData((prevFormData) => ({
        ...prevFormData,
        category: conditiontoUpdate[0].category.id,
        conditionName: conditiontoUpdate[0].conditionName,
      }));
    }
  }, [conditionsData]);

  // Function to add a new condition
  //   const addCondition = () => {
  //     setFormData({
  //       ...formData,
  //       conditions: [
  //         ...formData.conditions,
  //         { conditionName: "", questions: [{ questionName: "" }] },
  //       ],
  //     });
  //     console.log("addCategory", formData);
  //   };

  // Function to add a new question for a condition
  //   const addQuestion = (conditionIndex) => {
  //     const updatedFormData = { ...formData };
  //     updatedFormData.conditions[conditionIndex].questions.push({
  //       questionName: "",
  //     });
  //     setFormData(updatedFormData);
  //     console.log("addQuestions", formData);
  //   };

  // Function to delete a condition
  //   const deleteCondition = (conditionIndex) => {
  //     const updatedConditions = [...formData.conditions];
  //     updatedConditions.splice(conditionIndex, 1);
  //     setFormData({ ...formData, conditions: updatedConditions });
  //   };

  // Function to delete a question
  //   const deleteQuestion = (conditionIndex, questionIndex) => {
  //     const updatedConditions = [...formData.conditions];
  //     updatedConditions[conditionIndex].questions.splice(questionIndex, 1);
  //     setFormData({ ...formData, conditions: updatedConditions });
  //   };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("handleSubmit", conditionId);

    try {
      await updateCondition({
        conditionId: conditionId,
        data: formData,
      }).unwrap();
      // Handle success
    } catch (error) {
      console.error("Error updating condition:", error);
    }

    // Send formData to backend or perform any other action
    console.log("handleSubmit", formData);
  };

  return (
    <>
      <div className="flex mt-[5%] w-[80%] mx-auto">
        <div className="grow">
          <div className="flex justify-between items-center">
            <h1 className="bold text-[1.4rem] mb-2">Update Condition</h1>
            <div className="flex items-center gap-1">
              <h2>Home </h2>
              <h2 className="pl-1"> / Update Condition</h2>
              {/* <div className="py-3 px-2"> */}
              <Link to="/admin/conditionsList">
                <button
                  type="button"
                  className="border  mx-auto border-gray-950 bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
                >
                  Conditions List
                </button>
              </Link>
              {/* </div> */}
            </div>
          </div>
          <div className="bg-white border rounded-md shadow-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 ">
              <div className="flex gap-2 items-center">
                <span className="text-xl opacity-75">Update </span>
                {!conditionsLoading && (
                  <h1 className="text-2xl ">{conditiontoUpdate.category} </h1>
                )}
                <span className="text-xl opacity-75">Condition</span>
              </div>
              <hr />

              <div className="grid grid-cols-2 gap-2 w-full max-lg:grid-cols-1">
                {!conditionsLoading && (
                  <div className="flex flex-col">
                    <div className="">
                      <label>Condition Name:</label>
                      <input
                        type="text"
                        name="conditionName"
                        className="border mx-2 py-1 px-2 rounded text-[15px]"
                        placeholder="Enter Condition Name"
                        value={formData.conditionName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            conditionName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
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
      </div>
    </>
  );
}

export default UpdateCondition;

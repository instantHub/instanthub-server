// import React, { useEffect, useState } from "react";
// import {
//   useGetQuestionsQuery,
//   useUpdateQuestionMutation,
// } from "../../../features/api";
// import { Link, useParams } from "react-router-dom";

// function UpdateQuestions() {
//   const { questionsId } = useParams();
//   //   console.log(questionsId);

//   const { data: questionsData, isLoading } = useGetQuestionsQuery(questionsId);
//   const [
//     updateQuestion,
//     { isLoading: UpdateQuestionsLoading, isError: UpdateQuestionsError },
//   ] = useUpdateQuestionMutation();

//   const [formData, setFormData] = useState({
//     category: "",
//     conditions: [
//       {
//         conditionName: "",
//         questions: [{ questionName: "" }],
//       },
//     ],
//   });

//   //   useEffect(() => {
//   //     if (questionsData) {
//   //   setFormData(questionsData);
//   //     }
//   //     console.log("inside useEffect");
//   //   }, [questionsData]);

//   useEffect(() => {
//     if (questionsData) {
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         category: questionsData.category.id,
//         conditions: questionsData.conditions.map((condition) => ({
//           ...condition,
//           questions: condition.questions.map((question) => ({
//             ...question,
//             // questionName: "", // Assuming you want to reset the questionName
//           })),
//         })),
//       }));
//     }
//   }, [questionsData]);

//   // Function to handle changes in the form fields
//   const handleChange = (event, conditionIndex, questionIndex) => {
//     const { name, value } = event.target;
//     const updatedFormData = { ...formData };
//     if (name === "conditionName") {
//       updatedFormData.conditions[conditionIndex][name] = value;
//     } else if (name === "questionText") {
//       updatedFormData.conditions[conditionIndex].questions[
//         questionIndex
//       ].questionName = value;
//     }
//     setFormData(updatedFormData);
//   };

//   // Function to add a new condition
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

//   // Function to add a new question for a condition
//   const addQuestion = (conditionIndex) => {
//     const updatedFormData = { ...formData };
//     updatedFormData.conditions[conditionIndex].questions.push({
//       questionName: "",
//     });
//     setFormData(updatedFormData);
//     console.log("addQuestions", formData);
//   };

//   // Function to delete a condition
//   const deleteCondition = (conditionIndex) => {
//     const updatedConditions = [...formData.conditions];
//     updatedConditions.splice(conditionIndex, 1);
//     setFormData({ ...formData, conditions: updatedConditions });
//   };

//   // Function to delete a question
//   const deleteQuestion = (conditionIndex, questionIndex) => {
//     const updatedConditions = [...formData.conditions];
//     updatedConditions[conditionIndex].questions.splice(questionIndex, 1);
//     setFormData({ ...formData, conditions: updatedConditions });
//   };

//   // Function to handle form submission
//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     console.log("handleSubmit", questionsId);

//     try {
//       //   const { data } = await updateQuestion(questionsId, formData).unwrap();
//       await updateQuestion({
//         questionId: questionsId,
//         data: formData,
//       }).unwrap();

//       //   console.log("Updated question:", data);
//       // Handle success
//     } catch (error) {
//       console.error("Error updating question:", error);
//       // Handle error
//     }

//     // await updateQuestion(JSON.stringify(formData), questionsId).unwrap();

//     // Send formData to backend or perform any other action
//     console.log("handleSubmit", formData);
//   };

//   return (
//     <>
//       <div className="flex mt-[5%] w-[80%] mx-auto">
//         <div className="grow">
//           <div className="flex justify-between items-center">
//             <h1 className="bold text-[1.4rem] mb-2">Update Questions</h1>
//             <div className="flex items-center gap-1">
//               <h2>Home </h2>
//               <h2 className="pl-1"> / Update Question</h2>
//               {/* <div className="py-3 px-2"> */}
//               <Link to="/admin/questionsList">
//                 <button
//                   type="button"
//                   className="border  mx-auto border-gray-950 bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
//                 >
//                   Questions List
//                 </button>
//               </Link>
//               {/* </div> */}
//             </div>
//           </div>
//           <div className="bg-white border rounded-md shadow-lg">
//             <form
//               onSubmit={handleSubmit}
//               //   method="post"
//               className="flex flex-col gap-4  p-5 "
//             >
//               <div className="flex gap-2 items-center">
//                 <span className="text-xl opacity-75">Update </span>
//                 {!isLoading && (
//                   <h1 className="text-2xl ">{questionsData.category.name} </h1>
//                 )}
//                 <span className="text-xl opacity-75">Related Questions</span>
//               </div>
//               <hr />
//               <div className="grid">
//                 {/* Category */}
//                 <div className="mx-auto">
//                   {/* <label className="opacity-60">Category:</label> */}
//                   <h1 className="text-xl">Questions List</h1>
//                 </div>
//               </div>

//               <div className="mx-auto">
//                 <button
//                   type="button"
//                   onClick={addCondition}
//                   className="border border-black  bg-emerald-600 rounded-md px-4 py-2 text-white hover:text-black cursor-pointer hover:bg-white "
//                 >
//                   Add Condition
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 gap-2 w-full max-lg:grid-cols-1">
//                 {
//                   !isLoading &&
//                     //   <div>
//                     formData.conditions.map((condition, conditionIndex) => (
//                       <div key={conditionIndex} className="flex flex-col">
//                         <div className="">
//                           <label>Condition Name:</label>
//                           <input
//                             type="text"
//                             name="conditionName"
//                             className="border mx-2 py-1 px-2 rounded text-[15px]"
//                             placeholder="Enter Condition Name"
//                             value={condition.conditionName}
//                             onChange={(event) =>
//                               handleChange(event, conditionIndex)
//                             }
//                           />

//                           {/* NEW */}
//                           <button
//                             type="button"
//                             onClick={() => deleteCondition(conditionIndex)}
//                           >
//                             x
//                           </button>
//                           {/* END */}
//                         </div>
//                         {condition.questions.map((question, questionIndex) => (
//                           <div key={questionIndex} className="py-2">
//                             <label>Question:</label>
//                             <input
//                               type="text"
//                               name="questionText"
//                               value={question.questionName}
//                               className="w-[49%] border mx-2 py-1 px-2 rounded text-sm"
//                               placeholder="Enter Question"
//                               onChange={(event) =>
//                                 handleChange(
//                                   event,
//                                   conditionIndex,
//                                   questionIndex
//                                 )
//                               }
//                             />

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 deleteQuestion(conditionIndex, questionIndex)
//                               }
//                             >
//                               x
//                             </button>
//                           </div>
//                         ))}
//                         <button
//                           type="button"
//                           onClick={() => addQuestion(conditionIndex)}
//                           className="border w-1/3 border-gray-950 bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
//                         >
//                           Add Question
//                         </button>
//                       </div>
//                     ))
//                   //   </div>
//                 }
//               </div>

//               <div className="py-3 px-2">
//                 <button
//                   type="submit"
//                   className="border w-[80%] mx-auto border-black bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default UpdateQuestions;

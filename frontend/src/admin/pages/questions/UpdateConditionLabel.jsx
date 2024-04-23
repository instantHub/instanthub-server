import React, { useEffect, useState, useRef } from "react";
import {
  useGetConditionLabelsQuery,
  useUpdateConditionMutation,
  useUploadConditionLabelsImageMutation,
  useUpdateConditionLabelMutation,
} from "../../../features/api";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function UpdateConditionLabel() {
  const { conditionLabelId } = useParams();
  //   console.log(conditionLabelId);

  const { data: conditionLabelsData, isLoading: conditionLabelsLoading } =
    useGetConditionLabelsQuery();
  const [newImgSelected, setNewImgSelected] = useState(false);
  const [uploadConditionLabelsImage, { isLoading: uploadLoading }] =
    useUploadConditionLabelsImageMutation();
  const [
    updateConditionLabel,
    {
      isLoading: updateConditionLabelLoading,
      isError: updateConditionLabelError,
    },
  ] = useUpdateConditionLabelMutation();

  // Create a ref to store the reference to the file input element
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category: "",
    conditionNameId: "",
    conditionLabel: "",
    conditionLabelImg: "",
  });

  let conditionLabelToUpdate;
  if (!conditionLabelsLoading) {
    conditionLabelToUpdate = conditionLabelsData.filter(
      (conditionLabel) => conditionLabel.id == conditionLabelId
    );
  }

  useEffect(() => {
    if (conditionLabelsData) {
      console.log("useEffect", conditionLabelToUpdate);
      setFormData((prevFormData) => ({
        ...prevFormData,
        category: conditionLabelToUpdate[0].category.id,
        conditionNameId: conditionLabelToUpdate[0].conditionNameId.id,
        conditionLabel: conditionLabelToUpdate[0].conditionLabel,
        conditionLabelImg: conditionLabelToUpdate[0].conditionLabelImg,
      }));
    }
  }, [conditionLabelsData]);

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

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("handle submit");
    // console.log(formData);

    if (newImgSelected) {
      console.log("image changed");
      formData.conditionLabelImg = await uploadFileHandler();
    }
    console.log("after image", formData);

    try {
      //   await updateCondition({
      //     conditionId: conditionId,
      //     data: formData,
      //   }).unwrap();
      const updatedConditionLabel = await updateConditionLabel({
        conditionLabelId: conditionLabelId,
        data: formData,
      }).unwrap();
      console.log("ConditionLabel updated", updatedConditionLabel);
      toast.success("conditionLabel updated successfully..!");
      // Clear the value of the file input
      fileInputRef.current.value = "";
      // Mark the file input as required again
      fileInputRef.current.required = true;
      // Handle success
    } catch (error) {
      console.error("Error updating condition:", error);
      toast.error("conditionLabel update failed..!");
    }

    // Send formData to backend or perform any other action
    // console.log("handleSubmit", formData);
  };

  return (
    <>
      <div className="flex mt-[5%] w-[80%] mx-auto">
        <div className="grow">
          <div className="flex justify-between items-center">
            <h1 className="bold text-[1.4rem] mb-2">Update Condition Label</h1>
            <div className="flex items-center gap-1">
              <h2>Home </h2>
              <h2 className="pl-1"> / Update Condition</h2>
              {/* <div className="py-3 px-2"> */}
              <Link to="/admin/conditionLabelsList">
                <button
                  type="button"
                  className="border  mx-auto border-gray-950 bg-blue-500 rounded-md p-1 cursor-pointer hover:bg-white"
                >
                  ConditionLabels List
                </button>
              </Link>
              {/* </div> */}
            </div>
          </div>
          <div className="bg-white border rounded-md shadow-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 ">
              <div className="flex gap-2 items-center">
                <span className="text-xl opacity-75">Update </span>
                {!conditionLabelsLoading && (
                  <h1 className="text-2xl ">
                    {conditionLabelToUpdate[0].category.name}{" "}
                  </h1>
                )}
                <span className="text-xl opacity-75">ConditionLabel</span>
              </div>
              <hr />

              <div className="grid grid-cols-2 gap-2 w-full max-lg:grid-cols-1">
                {!conditionLabelsLoading && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <label htmlFor="conditioName">Condition Name</label>
                      <h1
                        name="conditioName"
                        className="text-[1.7rem] text-red-700"
                      >
                        {
                          conditionLabelToUpdate[0].conditionNameId
                            .conditionName
                        }
                      </h1>
                    </div>
                    <div className="flex items-center">
                      <div className="flex w-full">
                        <label className="">ConditionLabel Name:</label>
                        <input
                          type="text"
                          name="conditionName"
                          className="border mx-2 py-1 px-2 rounded text-[15px]"
                          placeholder="Enter Condition Name"
                          value={formData.conditionLabel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditionLabel: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center grow-0">
                        <img
                          src={
                            import.meta.env.VITE_APP_BASE_URL +
                            formData.conditionLabelImg
                          }
                          alt="ConditionLabel"
                          className="w-[100px] h-[100px] mx-auto "
                        />
                        <input
                          type="file"
                          name=""
                          ref={fileInputRef}
                          id=""
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              conditionLabelImg: e.target.files[0],
                            });
                            setNewImgSelected(true);
                          }}
                        />
                      </div>
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

export default UpdateConditionLabel;

import React, { useRef, useState } from "react";
import SlidersList from "./SlidersList";
import {
  useCreateSliderMutation,
  useUploadSliderImageMutation,
} from "../../../features/api";
import { toast } from "react-toastify";

const CreateSlider = () => {
  const [sliderImage, setSliderImage] = useState();
  const [status, setStatus] = useState("Active");

  const [createSlider, { isLoading: createSliderLoading }] =
    useCreateSliderMutation();
  const [uploadSliderImage, { isLoading: uploadLoading }] =
    useUploadSliderImageMutation();

  // Create a ref to store the reference to the file input element
  const fileInputRef = useRef(null);

  // File handler
  const uploadFileHandler = async () => {
    const formData = new FormData();
    formData.append("image", sliderImage);
    // formData.append("uploadURL", "category");

    try {
      const res = await uploadSliderImage(formData).unwrap();
      console.log("res.image", res.image);

      return res.image;
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  console.log("status", status);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageURL = await uploadFileHandler();

    const sliderData = { image: imageURL, status };

    try {
      const sliderCreated = await createSlider(sliderData).unwrap();
      console.log("sliderCreated", sliderCreated);
      toast("Slider created successfull..!");

      // Clear the value of the file input
      fileInputRef.current.value = "";
      // Mark the file input as required again
      fileInputRef.current.required = true;
    } catch (error) {
      console.log("Error: ", error);
    }
  };
  return (
    <>
      <div className="flex mt-[5%] w-[80%] mx-auto">
        <div className="grow">
          <div className="flex justify-between items-center">
            <h1 className="bold text-[1.4rem] mb-2">Create Slider</h1>
          </div>
          <div className="bg-white border rounded-md shadow-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 ">
              <div className="flex gap-2 items-center">
                <h1 className="text-xl opacity-75">Create Slider </h1>
              </div>
              <hr />

              <div className="grid grid-cols-2 gap-2 w-full max-lg:grid-cols-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <label className="">Select a Slider</label>
                    <div className="flex items-center grow-0">
                      <input
                        type="file"
                        name=""
                        ref={fileInputRef}
                        id=""
                        onChange={(e) => {
                          setSliderImage(e.target.files[0]);
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <select
                      name=""
                      id=""
                      className="border rounded px-2 py-1"
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Block">Block</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="py-3 px-2 text-center">
                <button
                  type="submit"
                  className="border text-white bg-green-600 rounded-md px-4 py-1 cursor-pointer hover:bg-white hover:text-green-600"
                >
                  Create Slider
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="">
        <SlidersList />
      </div>
    </>
  );
};

export default CreateSlider;

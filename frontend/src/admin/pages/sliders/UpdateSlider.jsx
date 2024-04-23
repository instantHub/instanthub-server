import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useGetSlidersListQuery,
  useUpdateSliderMutation,
  useUploadSliderImageMutation,
} from "../../../features/api";
import { toast } from "react-toastify";

const UpdateSlider = () => {
  const { sliderId } = useParams();
  const { data: slidersList, isLoading: slidersLoading } =
    useGetSlidersListQuery();
  const [updateSlider] = useUpdateSliderMutation();
  const [uploadSliderImage, { isLoading: uploadLoading }] =
    useUploadSliderImageMutation();

  const [sliderToUpdate, setSliderToUpdate] = useState();

  const [sliderImage, setSliderImage] = useState();
  const [status, setStatus] = useState();
  const [newImgSelected, setNewImgSelected] = useState(false);

  const navigate = useNavigate();

  // Create a ref to store the reference to the file input element
  const fileInputRef = useRef(null);

  // File handler
  const uploadFileHandler = async () => {
    const imageData = new FormData();
    // formData.append("image", imageSelected);
    imageData.append("image", sliderImage);

    try {
      const res = await uploadSliderImage(imageData).unwrap();

      return res.image;
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  // Selecting slider which needs to update
  useEffect(() => {
    if (!slidersLoading) {
      const slider = slidersList.filter((slider) => slider.id === sliderId);
      setSliderToUpdate(slider[0]);
      setSliderImage(slider[0].image);
      setStatus(slider[0].status);
    }
  }, [slidersList]);
  // console.log(sliderImage, status, "slider To Update");

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageURL = "";
    if (newImgSelected) {
      console.log("image changed");
      imageURL = await uploadFileHandler();
    }

    const sliderData = {
      image: newImgSelected ? imageURL : sliderImage,
      status,
    };

    // console.log("sliderData", sliderData);
    try {
      const sliderCreated = await updateSlider({
        sliderId: sliderId,
        data: sliderData,
      }).unwrap();
      console.log("sliderCreated", sliderCreated);
      toast("Slider updated successfull..!");

      // Clear the value of the file input
      // fileInputRef.current.value = "";
      navigate("/admin/add-sliders");
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  return (
    <div>
      {sliderImage && status && (
        <div className="mt-[5%] w-[80%] mx-auto grow">
          <div className="flex justify-between items-center">
            <h1 className="bold text-[1.4rem] mb-2">Update Slider</h1>
            <div className="py-3 px-2 text-center">
              <Link to={`/admin/sliders-list`}>
                <button
                  type="submit"
                  className="border text-white bg-blue-600 rounded-md px-4 py-1 cursor-pointer  hover:bg-blue-700"
                >
                  Back
                </button>
              </Link>
            </div>
          </div>
          <div className="bg-white border rounded-md shadow-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 ">
              <div className="flex gap-2 items-center">
                <h1 className="text-xl opacity-75">Update Slider </h1>
              </div>
              <hr />

              <div className="grid grid-cols-2 gap-2 w-full max-lg:grid-cols-1">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-4">
                    <label className="text-sm">
                      Want to select a new Slider?
                      <span className="text-lg "> choose a new slider..</span>
                    </label>
                    <div className="flex items-center grow-0">
                      <input
                        type="file"
                        name=""
                        ref={fileInputRef}
                        onChange={(e) => {
                          setSliderImage(e.target.files[0]);
                          setNewImgSelected(true);
                        }}
                      />
                    </div>
                    <div>
                      <img
                        src={import.meta.env.VITE_APP_BASE_URL + sliderImage}
                        alt="Old Slider Image"
                        className="w-fit h-[180px] mx-auto "
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <select
                      name=""
                      value={status}
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
                  Update Slider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateSlider;

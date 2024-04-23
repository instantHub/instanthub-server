import React, { useEffect, useState, useRef } from "react";
import {
  useCreateCategoryMutation,
  useUploadFileHandlerMutation,
  useUploadCategoryImageMutation,
} from "../../../features/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const CreateCategory = () => {
  const [category, setCategory] = useState("");
  const [uniqueURL, setUniqueURL] = useState("");
  const [imageSelected, setImageSelected] = useState("");
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const [uploadCategoryImage, { isLoading: uploadLoading }] =
    useUploadCategoryImageMutation();

  // Create a ref to store the reference to the file input element
  const fileInputRef = useRef(null);

  const inputValidation = () => {
    if (
      category.trim() === "" ||
      uniqueURL.trim() === "" ||
      imageSelected === ""
    ) {
      return false;
    } else {
      return true;
    }
  };

  // File handler
  const uploadFileHandler = async () => {
    const formData = new FormData();
    formData.append("image", imageSelected);
    // formData.append("uploadURL", "category");

    try {
      const res = await uploadCategoryImage(formData).unwrap();
      console.log("res.image", res.image);

      return res.image;
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validate = inputValidation();

    if (validate) {
      // Image upload handler call
      const imageURL = await uploadFileHandler();

      console.log("handlesubmit ", category, uniqueURL, imageURL);
      //   setCategoryData({
      //     ...categoryData,
      //     image: imageURL,
      //   });
      const categoryData = {
        name: category,
        uniqueURL: uniqueURL,
        image: imageURL,
      };

      try {
        await createCategory(JSON.stringify(categoryData)).unwrap();
        toast("Category created successfull..!");
        setCategory("");
        setUniqueURL("");
        setImageSelected("");
        // Clear the value of the file input
        fileInputRef.current.value = "";
        // Mark the file input as required again
        fileInputRef.current.required = true;
      } catch (error) {
        console.log("Error: ", error);
      }
    } else {
      console.log("All fields are required");
      return;
    }
  };

  //   useEffect(() => {
  //     console.log("From useEffect()", categoryData);
  //   }, [categoryData]);

  return (
    <div className=" px-[2%] pt-[2%] ">
      <div className="flex justify-between items-center">
        <h1 className="bold text-[1.4rem] mb-2">Create Category</h1>
        <div className="flex">
          <h2>Home </h2>
          <h2 className="pl-1"> / Add Category</h2>
        </div>
        <div>
          <Link to={"/admin/categories-list"}>
            <button className="bg-blue-500 px-2 py-1 rounded border border-black">
              Categories List
            </button>
          </Link>
        </div>
      </div>
      <div className="bg-white border rounded-md shadow-lg">
        <form
          action=""
          method="post"
          className="flex flex-col gap-4  p-5"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="">Add Category</h2>
          </div>
          <hr />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="productName">Category Name :</label>
              <input
                type="text"
                id="productName"
                className=" border p-2 rounded-sm"
                placeholder="Enter Category Name"
                value={category}
                // value={name}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="uniqueURL">Make Unique URL :</label>
              <input
                type="text"
                id="uniqueURL"
                value={uniqueURL}
                onChange={(e) => setUniqueURL(e.target.value)}
                className=" border p-2 rounded-sm"
                placeholder="Enter Unique URL"
                required
              />
            </div>

            <div className="p-2">
              <label htmlFor="image">File Input</label>
              <div className="flex">
                <div className="mb-4">
                  <label htmlFor="image" className="block font-medium">
                    Image:
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setImageSelected(e.target.files[0])}
                    className="w-full border border-gray-300 p-2 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="py-3 px-2">
            <button
              type="submit"
              className="border border-gray-950 bg-blue-500 rounded-md p-1 w-[20%] cursor-pointer hover:bg-white"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategory;

// const result = await axios.post(
//   "http://localhost:8000/api/upload",
//   formData,
//   {
//     headers: { "Content-Type": "multipart/formdata" },
//   }
// );

import React, { useState } from "react";

const AddProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProdType, setSelectedProdType] = useState(""); // State to hold the selected option
  const [selectedFile, setSelectedFile] = useState(null);

  const handleCategory = (event) => {
    setSelectedCategory(event.target.value);
    // Update selectedOption state when the value changes
  };

  const handleProdType = (e) => {
    setSelectedProdType(e.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // Update selectedFile state when a file is selected
  };

  console.log("file", selectedFile);

  console.log(selectedCategory);
  return (
    <div className=" px-[2%] pt-[2%] ">
      <div className="flex justify-between items-center">
        <h1 className="bold text-[1.4rem] mb-2">Create Product</h1>
        <div className="flex">
          <h2>Home </h2>
          <h2 className="pl-1"> / Add Products</h2>
        </div>
      </div>
      <div className="bg-white border rounded-md shadow-lg">
        <form action="" method="post" className="flex flex-col gap-4  p-5">
          <div>
            <h2 className="">Add Product</h2>
          </div>
          <hr />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="category">Select Category :</label>
              <select
                id="category"
                name="category"
                className="border rounded-sm p-2"
                value={selectedCategory}
                onChange={handleCategory}
              >
                <option value="">Select a category</option>
                <option value="Mobile">Mobile</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
                <option value="SmartWatch">SmartWatch</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="productName">Product Name :</label>
              <input
                type="text"
                id="productName"
                className=" border p-2 rounded-sm"
                placeholder="Enter Product Name"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="productName">Get Upto :</label>
              <input
                type="text"
                id="productName"
                className=" border p-2 rounded-sm"
                placeholder="Get Upto"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="productType">Type :</label>
              <select
                id="productType"
                name="productType"
                className="border rounded-sm p-2"
                value={selectedProdType}
                onChange={handleProdType}
              >
                <option value="">Select a Type</option>
                <option value="Mobile">Phone/Ipad/Tablet</option>
                <option value="smartWatch">SmartWatch</option>
                <option value="earbuds">Earbuds</option>
                <option value="camera">Camera's</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="productName">Make Unique URL :</label>
              <input
                type="text"
                id="productName"
                className=" border p-2 rounded-sm"
                placeholder="Enter Unique URL"
              />
            </div>

            <div className="p-2">
              <label htmlFor="fileInput">File Input :</label>
              <div className="flex">
                <div className="flex flex-wrap grow shrink basis-auto w-[1%] items-center">
                  <input
                    type="file"
                    id="fileInput"
                    name="fileInput"
                    className="relative z-[2] w-full overflow-hidden m-0 opacity-0"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="fileInput"
                    className="absolute z-[1] border p-1 rounded-sm overflow-hidden text-sm "
                  >
                    Choose a file
                  </label>
                  {selectedFile && (
                    <p className="absolute mt-[3.8rem]">
                      Selected file: {selectedFile.name}
                    </p>
                  )}{" "}
                  {/* Display the selected file name */}
                </div>
                {/* <div className="border rounded-md text-sm p-1">
                  <span>Upload</span>
                </div> */}
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="status">Status :</label>
              <select
                id="status"
                name="status"
                className="border rounded-sm p-2"
                value={selectedProdType}
                onChange={handleProdType}
              >
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
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

export default AddProducts;

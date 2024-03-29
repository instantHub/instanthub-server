import React, { useState } from "react";
import CreateVariant from "./CreateVariant";
import CreateSeries from "./CreateSeries";
import {
  useGetCategoryQuery,
  useGetBrandQuery,
  useGetAllBrandQuery,
  useUploadFileHandlerMutation,
  useCreateProductMutation,
} from "../../features/api";
import { toast } from "react-toastify";

const CreateProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [imageSelected, setImageSelected] = useState("");
  const [prodName, setProdName] = useState("");
  const [uniqueURL, setUniqueURL] = useState("");
  const [uploadProductImage, { isLoading: uploadLoading }] =
    useUploadFileHandlerMutation();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoryQuery();
  // console.log(categoryData);

  const { data: BrandData, isLoading: BrandLoading } = useGetAllBrandQuery();
  // const [getBrand, { isLoading: BrandLoading }] = useGetBrandQuery();

  // File handler
  const uploadFileHandler = async () => {
    const formData = new FormData();
    formData.append("image", imageSelected);

    try {
      const res = await uploadProductImage(formData).unwrap();
      console.log("Product res.image", res.image);

      return res.image;
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageURL = await uploadFileHandler();
    console.log("imageURL", imageURL);

    const productsData = {
      name: prodName,
      uniqueURL: uniqueURL,
      image: imageURL,
      category: selectedCategory,
      brand: selectedBrand,
    };

    console.log("productsData: ", productsData);

    try {
      await createProduct(JSON.stringify(productsData)).unwrap();
      toast("Product created successfull..!");
      // setBrand("");
      // setUniqueURL("");
      // setImageSelected("");
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  return (
    <div className=" px-[2%] pt-[2%]">
      <div>
        <div className="flex justify-between items-center">
          <h1 className="bold text-[1.4rem] mb-2">Create Product</h1>
          <div className="flex">
            <h2>Home </h2>
            <h2 className="pl-1"> / Add Products</h2>
          </div>
        </div>
        <div className="bg-white border rounded-md shadow-lg">
          <form
            action=""
            method="post"
            className="flex flex-col gap-4  p-5 "
            onSubmit={handleSubmit}
          >
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
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {!categoryLoading &&
                    categoryData.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        name="category"
                        className=""
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                        }}
                      >
                        {/* {console.log(
                          "category: ",
                          category.name,
                          ", ID: ",
                          category.id
                        )} */}
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="productType">Select Brand :</label>
                <select
                  id="productType"
                  name="productType"
                  className="border rounded-sm p-2"
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {!BrandLoading &&
                    BrandData.map((brand) => {
                      // console.log("selectedCategory", selectedCategory);
                      if (selectedCategory == brand.category) {
                        return (
                          <option
                            key={brand.id}
                            value={brand.id}
                            name="category"
                            className=""
                          >
                            {/* {console.log(
                              "brand: ",
                              brand.name,
                              ", ID: ",
                              brand.id
                            )} */}
                            {brand.name}
                          </option>
                        );
                      }
                    })}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="productName">Product Name :</label>
                <input
                  type="text"
                  id="productName"
                  className=" border p-2 rounded-sm"
                  placeholder="Enter Product Name"
                  value={prodName}
                  onChange={(e) => {
                    setProdName(e.target.value);
                  }}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="productName">Make Unique URL :</label>
                <input
                  type="text"
                  id="productName"
                  className=" border p-2 rounded-sm"
                  placeholder="Enter Unique URL"
                  value={uniqueURL}
                  onChange={(e) => {
                    setUniqueURL(e.target.value);
                  }}
                  required
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
                      onChange={(e) => setImageSelected(e.target.files[0])}
                      required
                    />
                    <label
                      htmlFor="fileInput"
                      className="absolute z-[1] border p-1 rounded-sm overflow-hidden text-sm "
                    >
                      Choose a file
                    </label>
                    {imageSelected && (
                      <p className="absolute mt-[3.8rem]">
                        Selected file: {imageSelected.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="status">Status :</label>
                <select
                  id="status"
                  name="status"
                  className="border rounded-sm p-2"
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

      <CreateVariant />

      <CreateSeries />
    </div>
  );
};

export default CreateProducts;

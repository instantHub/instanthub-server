import React, { useEffect, useState, useRef } from "react";
import CreateSeries from "../../components/CreateSeries";
import {
  useUploadConditionLabelsImageMutation,
  useUpdateProductMutation,
  useGetProductDetailsQuery,
  useUploadProductImageMutation,
} from "../../../features/api";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const UpdateProduct = () => {
  const { productId } = useParams();
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [prodName, setProdName] = useState("");
  const [imageSelected, setImageSelected] = useState("");
  const [newImgSelected, setNewImgSelected] = useState(false);
  const [uniqueURL, setUniqueURL] = useState("");

  const [uploadProductImage, { isLoading: uploadLoading }] =
    useUploadProductImageMutation();
  const { data: productData, isLoading: productDataLoading } =
    useGetProductDetailsQuery(productId);
  const [updateProduct] = useUpdateProductMutation();

  if (productData) {
    // console.log("productData from updateProduct", productData);
  }

  // Create a ref to store the reference to the file input element
  const fileInputRef = useRef(null);

  // VARIANTS
  const [variants, setVariants] = useState([{ name: "", price: "" }]);
  const handleVariantChange = (index, key, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][key] = value;
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "" }]);
  };

  const handleRemoveVariant = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  // console.log("variants", variants);

  // File handler
  const uploadFileHandler = async () => {
    const formData = new FormData();
    formData.append("image", imageSelected);

    try {
      const res = await uploadProductImage(formData).unwrap();

      return res.image;
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  // Handle Submit to create Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any variant fields are empty
    const isEmptyVariant = variants.some(
      (variant) => variant.name.trim() === "" || variant.price === ""
    );

    if (isEmptyVariant) {
      toast.warning("Please fill out all variant fields");
      return;
    }

    let imageURL;
    if (newImgSelected) {
      console.log("image changed");
      imageURL = await uploadFileHandler();
      setImageSelected(imageURL);
    }
    console.log("after imageSelected", imageSelected);
    console.log("after imageURL", imageURL);

    const updatedProductData = {
      name: prodName,
      uniqueURL: uniqueURL,
      //   image: imageSelected ? imageSelected : productData.image,
      image: newImgSelected ? imageURL : imageSelected,
      category,
      brand,
      variants: variants,
    };

    console.log("updatedProductData: ", updatedProductData);

    try {
      const updatedProduct = await updateProduct({
        productId,
        data: updatedProductData,
      }).unwrap();

      // productId = product.id;
      console.log(updatedProduct);
      if (
        !updatedProduct.success &&
        updatedProduct.data === "Duplicate productName"
      ) {
        // setErrorMessage(response.data);
        toast.error(updatedProduct.message);
        return;
      }

      //   console.log("Product created", productCreated);
      toast.success("Product updated successfull..!");
      // Clear the value of the file input
      fileInputRef.current.value = "";
      // Mark the file input as required again
      fileInputRef.current.required = true;
    } catch (error) {
      toast.error(error);
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    if (productData) {
      setProdName(productData.name);
      setCategory(productData.category.id);
      setBrand(productData.brand.id);
      setUniqueURL(productData.uniqueURL);
      setImageSelected(productData.image);
      // Variants - Extract only name and price from each variant and create a new array
      const extractedVariants = productData.variants.map((variant) => ({
        name: variant.name,
        price: variant.price,
      }));
      setVariants(extractedVariants);
    }
  }, [productData]);

  return (
    <div className="flex px-[2%] pt-[2%]">
      <div className="grow">
        <div className="flex justify-between items-center">
          <h1 className="bold text-[1.4rem] mb-2">Update Product</h1>
          <div className="flex">
            <h2>Home </h2>
            <h2 className="pl-1"> / Update Products</h2>
          </div>
        </div>
        <div className="bg-white border rounded-md shadow-lg">
          {!productDataLoading && (
            <form
              action=""
              method="post"
              className="flex flex-col gap-4  p-5 "
              onSubmit={handleSubmit}
            >
              <div>
                <h2 className="">
                  Update Product{" "}
                  <span className="text-lg font-semibold">{prodName}</span>{" "}
                </h2>
              </div>
              <hr />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <h1 htmlFor="category">
                    Category{" "}
                    <span className="text-lg font-semibold">
                      {productData.category.name}
                    </span>{" "}
                  </h1>
                </div>

                <div className="flex flex-col">
                  <h1 htmlFor="productType">
                    Brand{" "}
                    <span className="text-lg font-semibold">
                      {productData.brand.name}
                    </span>{" "}
                  </h1>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div>
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
                    <div className="flex items-center grow-0">
                      <img
                        src={import.meta.env.VITE_APP_BASE_URL + imageSelected}
                        alt="ConditionLabel"
                        className="w-[100px] h-[100px] mx-auto "
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="flex gap-1 border px-1 m-1 rounded-lg"
                      >
                        <span className="opacity-50">{variant.name}</span>
                        <span>-</span>
                        <span className="opacity-50">{variant.price}</span>
                      </div>
                    ))}
                  </div>
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

                <div className="p-2 ">
                  <label htmlFor="fileInput">File Input :</label>
                  <div className="flex">
                    <div className="flex flex-wrap grow shrink basis-auto w-[1%] items-center">
                      <input
                        type="file"
                        name=""
                        ref={fileInputRef}
                        id=""
                        onChange={(e) => {
                          setImageSelected(e.target.files[0]);
                          setNewImgSelected(true);
                        }}
                      />

                      {/* {imageSelected && (
                        <p className="absolute mt-[3.8rem]">
                          Selected file: {imageSelected}
                        </p>
                      )} */}
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
                  className="border border-gray-950 bg-green-600 text-white rounded-md p-1 w-[20%] cursor-pointer hover:bg-white hover:text-black"
                  // onClick={handleSubmit}
                >
                  Update
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {!productDataLoading && (
        <div className="m-1 flex flex-col items-center justify-center">
          <h3 className="text-xl inline-block">Add Variants:</h3>
          {variants.map((variant, index) => (
            <div
              key={index}
              className="my-2 bg-white flex items-center gap-2 border rounded-md shadow-lg p-6"
            >
              <div>
                <input
                  type="text"
                  value={variant.name}
                  placeholder="variant name"
                  onChange={(e) =>
                    handleVariantChange(index, "name", e.target.value)
                  }
                  className="m-1 p-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  value={variant.price}
                  placeholder="variant price"
                  onChange={(e) =>
                    handleVariantChange(index, "price", e.target.value)
                  }
                  className="m-1 p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                {variants.length != 1 && (
                  <button
                    className="bg-red-600 px-2 py-1 text-white rounded-md"
                    onClick={() => {
                      handleRemoveVariant(index);
                    }}
                  >
                    remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addVariant}
            className="px-3 py-1 bg-emerald-500 text-white rounded-lg"
          >
            Add Variant
          </button>
        </div>
      )}

      {/* <div className="flex justify-evenly mx-6 gap-80 2sm:gap-5 items-center">
        <CreateSeries />
      </div> */}
    </div>
  );
};

export default UpdateProduct;

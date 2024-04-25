import React, { useEffect, useState, useRef } from "react";
import CreateSeries from "../../components/CreateSeries";
import {
  useGetCategoryQuery,
  useGetBrandQuery,
  useGetAllBrandQuery,
  useCreateProductMutation,
  useUploadProductImageMutation,
  useGetAllSeriesQuery,
} from "../../../features/api";
import { toast } from "react-toastify";

const CreateProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [imageSelected, setImageSelected] = useState("");
  const [prodName, setProdName] = useState("");
  const [uniqueURL, setUniqueURL] = useState("");
  const { data: seriesData, isLoading: seriesLoading } = useGetAllSeriesQuery();
  const [uploadProductImage, { isLoading: uploadLoading }] =
    useUploadProductImageMutation();
  const [createProduct, { isLoading: productCreationLoading }] =
    useCreateProductMutation();
  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoryQuery();
  const { data: BrandData, isLoading: BrandLoading } = useGetAllBrandQuery();

  const [selectedSeries, setSelectedSeries] = useState("");
  const [seriesYes, setSeriesYes] = useState(false);

  // Create a ref to store the reference to the file input element
  const fileInputRef = useRef(null);

  if (!seriesLoading) {
    // console.log("series from products", seriesData);
  }
  console.log("selected series from products", selectedSeries, seriesYes);

  let productId = undefined;

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
      (variant) => variant.name.trim() === "" || variant.price.trim() === ""
    );

    if (isEmptyVariant) {
      toast.warning("Please fill out all variant fields");
      return;
    }

    const imageURL = await uploadFileHandler();

    const productsData = {
      name: prodName,
      uniqueURL: uniqueURL,
      image: imageURL,
      category: selectedCategory,
      brand: selectedBrand,
      series: seriesYes ? selectedSeries : null,
      variants: variants,
    };

    console.log("productsData: ", productsData);

    try {
      const productCreated = await createProduct(
        JSON.stringify(productsData)
      ).unwrap();
      // productId = product.id;
      console.log(productCreated);
      if (
        !productCreated.success &&
        productCreated.data === "Duplicate productName"
      ) {
        // setErrorMessage(response.data);
        toast.error(productCreated.message);
        return;
      }

      console.log("Product created", productCreated);
      toast.success("Product created successfull..!");
      setSelectedCategory("");
      setSelectedBrand("");
      setImageSelected("");
      setProdName("");
      setUniqueURL("");
      // Reset the variants state to a single empty variant
      setVariants([{ name: "", price: "" }]);
      // Clear the value of the file input
      fileInputRef.current.value = "";
      // Mark the file input as required again
      fileInputRef.current.required = true;
    } catch (error) {
      toast.error(error);
      console.log("Error: ", error);
    }
  };

  // if selectedSeries is empty than series is not selected
  useEffect(() => {
    if (selectedSeries === "") {
      setSeriesYes(false);
    }
  }, [selectedSeries]);

  return (
    <div className="flex px-[2%] pt-[2%]">
      <div className="grow">
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

              {/* Select a Brand */}
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
                  <option value="">Select Brand</option>
                  {!BrandLoading &&
                    BrandData.map((brand) => {
                      // console.log("selectedCategory", selectedCategory);
                      if (selectedCategory == brand.category.id) {
                        return (
                          <option
                            key={brand.id}
                            value={brand.id}
                            name="brand"
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

              {/* Select a series */}
              <div className="flex flex-col">
                <label htmlFor="productType">Select Series :</label>
                <select
                  id="productType"
                  name="productType"
                  className="border rounded-sm p-2"
                  value={selectedSeries}
                  onChange={(e) => {
                    setSelectedSeries(e.target.value);
                    setSeriesYes(true);
                  }}
                >
                  <option value="">Select Series</option>
                  {/* <option value="">General Product</option> */}
                  {!seriesLoading &&
                    seriesData.map((series) => {
                      if (selectedBrand == series.brand.id) {
                        return (
                          <option
                            key={series.id}
                            value={series.id}
                            name="series"
                            className=""
                          >
                            {series.name}
                          </option>
                        );
                      }
                    })}
                </select>
              </div>

              {/* Product Name */}
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

              {/* VARIANT TESTING */}

              {/* <div>
                <h3>Variants:</h3>
                {variants.map((variant, index) => (
                  <div key={index} className="my-2">
                    <input
                      type="text"
                      value={variant.name}
                      placeholder="variant name"
                      onChange={(e) =>
                        handleVariantChange(index, "name", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      value={variant.price}
                      placeholder="variant price"
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  onClick={addVariant}
                  className="px-3 py-1 bg-emerald-500 rounded-lg"
                >
                  Add Variant
                </button>
              </div> */}

              {/* VARIANT TESTING END */}

              <div className="p-2">
                <label htmlFor="fileInput">File Input :</label>
                <div className="flex">
                  <div className="flex flex-wrap grow shrink basis-auto w-[1%] items-center">
                    <input
                      type="file"
                      id="fileInput"
                      name="fileInput"
                      ref={fileInputRef}
                      className="relative z-[2] w-full overflow-hidden m-0 opacity-0 cursor-pointer"
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
                // onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

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

      {/* <div className="flex justify-evenly mx-6 gap-80 2sm:gap-5 items-center">
        <CreateSeries />
      </div> */}
    </div>
  );
};

export default CreateProducts;

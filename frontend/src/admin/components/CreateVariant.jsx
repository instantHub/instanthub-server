import React from "react";

const CreateVariant = (props) => {
  const { productId } = props;
  // console.log(productId);

  return (
    <div className="flex flex-col justify-between items-center mt-10">
      <h1 className="bold text-[1.4rem] mb-2">Create Variant</h1>
      {/* <div className="flex">
        <h2>Home </h2>
        <h2 className="pl-1"> / Add Products</h2>
      </div> */}

      <div className="bg-white border rounded-md shadow-lg">
        <form action="" method="post" className="flex flex-col gap-4  p-5 ">
          <div>
            <h2 className="">Add Variant for the Product</h2>
          </div>
          <hr />

          <div className="flex justify-center items-center content-center gap-4 my-4">
            <div className="flex gap-2">
              <label htmlFor="productType">Brand : </label>
              <span className="opacity-50">BrandName</span>
            </div>

            <div className="flex gap-2">
              <label htmlFor="productType">Product : </label>
              <span className="opacity-50"></span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col">
              <label htmlFor="productName">Enter Variant :</label>
              <input
                type="text"
                id="productName"
                className=" border p-2 rounded-lg"
                placeholder="Ex: 32 GB"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="productName">Get Upto :</label>
              <input
                type="text"
                id="productName"
                className=" border p-2 rounded-lg"
                placeholder="Price"
              />
            </div>
          </div>
          <div className="px-2">
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

export default CreateVariant;

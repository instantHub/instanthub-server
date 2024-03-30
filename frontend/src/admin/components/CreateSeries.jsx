import React from "react";

const CreateSeries = () => {
  return (
    <div className="flex flex-col justify-between items-center mt-10">
      <h1 className="bold text-[1.4rem] mb-2">Add / Create Series</h1>
      {/* <div className="flex">
        <h2>Home </h2>
        <h2 className="pl-1"> / Add Products</h2>
      </div> */}

      <div className="bg-white border rounded-md shadow-lg">
        <form action="" method="post" className="flex flex-col gap-4  p-5 ">
          <div>
            <h2 className="">Add/Create Series for the Product</h2>
          </div>
          <hr />

          <div className="flex justify-center items-center content-center gap-4">
            <div className="flex gap-2">
              <label htmlFor="brandName">Brand : </label>
              <span name="brandName" className="opacity-50">
                BrandName
              </span>
            </div>

            <div className="flex gap-2">
              <label htmlFor="productName">Product : </label>
              <span name="productName" className="opacity-50">
                ProductName
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="selectSeries">Series List:</label>
            <select
              id="selectSeries"
              name="selectSeries"
              className="border rounded-sm p-2"
              // value={selectedBrand}
              // onChange={(e) => {
              //   setSelectedBrand(e.target.value);
              // }}
              required
            >
              <option value="">Select Series</option>
              {/* {!BrandLoading &&
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
                        {brand.name}
                      </option>
                    );
                  }
                })} */}
            </select>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <label htmlFor="seriesName" className="text-[12px]">
                Series Not Found?
              </label>
              <label htmlFor="seriesName">Enter New Series</label>
              <input
                type="text"
                id="seriesName"
                className=" border p-2 rounded-lg"
                placeholder="Series Name"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="getUpto">Get Upto :</label>
              <input
                type="text"
                id="getUpto"
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

export default CreateSeries;

import React from "react";

const CreateSeries = () => {
  return (
    <div className="flex flex-col justify-between items-center mt-10">
      <h1 className="bold text-[1.4rem] mb-2">Create Series</h1>
      {/* <div className="flex">
      <h2>Home </h2>
      <h2 className="pl-1"> / Add Products</h2>
    </div> */}

      <div className="bg-white border rounded-md shadow-lg">
        <form action="" method="post" className="flex flex-col gap-4  p-5 ">
          <div>
            <h2 className="">Create Series for the Product</h2>
          </div>
          <hr />
        </form>
      </div>
    </div>
  );
};

export default CreateSeries;

import React from "react";

const SearchBar = () => {
  return (
    <div className="bg-white grow border rounded-full mx-4 md:w-72 sm:w-64 2sm:w-3/4 3sm:w-3/4">
      <input
        type="search"
        name=""
        id=""
        className="text-black px-5 py-2 w-full rounded-full md:w-72 sm:w-64 2sm:w-3/4 3sm:w-3/4"
        placeholder="Search for Mobiles, Laptops etc.."
      />
    </div>
  );
};

export default SearchBar;

// import React, { useState, useEffect } from "react";
// import { useGetAllProductsQuery } from "../features/api";
// import { Link } from "react-router-dom";

// const SearchBar = () => {
//   const [search, setSearch] = useState();

//   const [searchTerm, setSearchTerm] = useState();

//   // useEffect(() => {
//   //   if (search && search.length > 1) {
//   //     setSearchTerm(search);
//   //   } else if (!search) {
//   //     setSearchTerm();
//   //   }
//   // }, [search, searchTerm]);

//   // console.log("search", search);
//   // console.log("searchTerm", searchTerm);

//   const { data: productsData, isLoading: productsLoading } =
//     useGetAllProductsQuery({
//       search,
//       limit: search ? 2 : 1,
//     });

//   if (productsData) {
//     console.log("Navbar productsData", productsData);
//   }

//   const handleClearSearch = () => {
//     setSearch();
//     setSearchTerm();
//   };

//   // Function to clear the search
//   const clearSearch = () => {
//     setSearch();
//     setSearchTerm();
//   };

//   useEffect(() => {
//     // Add event listener to document for click events
//     document.addEventListener("click", clearSearch);

//     // Remove event listener when component unmounts
//     return () => {
//       document.removeEventListener("click", clearSearch);
//     };
//   }, []); // Empty dependency array to run effect only once on mount

//   return (
//     <div className="bg-white grow border rounded-full mx-4 md:w-72 sm:w-64 2sm:w-3/4 3sm:w-3/4">
//       <input
//         type="search"
//         name="search"
//         value={search}
//         id="search"
//         className="text-black px-5 py-2 w-full rounded-full md:w-72 sm:w-64 2sm:w-3/4 3sm:w-3/4"
//         placeholder="Search for Mobiles, Laptops etc.."
//         onChange={(e) => setSearch(e.target.value)}
//       />
//       {search && search.length > 1 && (
//         <div className="absolute bg-black flex flex-col">
//           {!productsLoading &&
//             productsData.products.map((product) => (
//               <div key={product.id}>
//                 <Link to={`/categories/brands/productDetails/${product.id}`}>
//                   <button onClick={handleClearSearch}>
//                     <h2>{product.name}</h2>
//                   </button>
//                 </Link>
//               </div>
//             ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchBar;

import React, { useState, useEffect, useRef } from "react";
import { useGetAllProductsQuery } from "../features/api";
import { Link } from "react-router-dom";
import "./searchStyle.css";
import { BsSearch } from "react-icons/bs";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { data: productsData, isLoading: productsLoading } =
    useGetAllProductsQuery({
      search,
      page,
      limit: 5,
    });

  const productListRef = useRef(null);

  useEffect(() => {
    setPage(1); // Reset page number on new search
  }, [search]);

  useEffect(() => {
    if (!productsLoading && productsData) {
      setHasMore(productsData.totalPages > page);
    }
  }, [productsLoading, productsData, page]);

  const handleScroll = () => {
    if (
      productListRef.current.scrollTop === 0 &&
      page > 1 &&
      !productsLoading
    ) {
      setPage((prevPage) => prevPage - 1); // Decrement page number for previous page
    } else if (
      productListRef.current.scrollHeight - productListRef.current.scrollTop ===
        productListRef.current.clientHeight &&
      hasMore &&
      !productsLoading
    ) {
      setPage((prevPage) => prevPage + 1); // Increment page number for next page
    }
  };

  // Function to clear the search
  const clearSearch = () => {
    setSearch();
  };

  useEffect(() => {
    // Add event listener to document for click events
    document.addEventListener("click", clearSearch);

    // Remove event listener when component unmounts
    return () => {
      document.removeEventListener("click", clearSearch);
    };
  }, []); // Empty dependency array to run effect only once on mount

  return (
    <div className="bg-white grow border rounded mx-4 md:w-80 sm:w-64 2sm:w-3/4 3sm:w-3/4">
      <div className="flex pl-4 items-center">
        <BsSearch className="text-black" />
        <input
          type="search"
          name="search"
          value={search}
          id="search"
          className="text-black grow pl-2 pr-5 py-2 w-full rounded-full md:w-72 sm:w-64 2sm:w-3/4 3sm:w-3/4 focus:bg-transparent outline-none"
          placeholder={`Search for Mobiles, Laptops etc.. `}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search && (
        <div
          className="absolute bg-white text-black flex flex-col p-4 rounded max-h-[150px] overflow-y-auto scrollbar md:w-72 sm:w-64 2sm:w-3/4 3sm:w-3/4"
          // style={{ maxHeight: "200px", overflowY: "scroll" }}
          ref={productListRef}
          onScroll={handleScroll}
        >
          {!productsLoading &&
            productsData.products.map((product, index) => (
              <div key={index}>
                <Link to={`/categories/brands/productDetails/${product.id}`}>
                  <button className="py-1 border-b">
                    <h2 className="">{product.name}</h2>
                  </button>
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

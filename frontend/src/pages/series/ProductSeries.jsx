import React from "react";
import { useGetBrandSeriesQuery } from "../../features/api";
import { Link } from "react-router-dom";

const ProductSeries = ({ brandId }) => {
  console.log("series", brandId);
  const { data: brandSeries, isLoading: seriesLoading } =
    useGetBrandSeriesQuery(brandId);

  if (!seriesLoading) {
    console.log("brandSeries", brandSeries);
  }
  return (
    <div className="mt-10">
      <div className="mx-10 grid grid-cols-6 max-md:grid-cols-4 max-sm:grid-cols-3 sm:gap-x-12 sm:gap-y-8 rounded-xl sm:rounded-none ring-0 ring-transparent shadow sm:shadow-none mt-4 sm:mt-0">
        {!seriesLoading && brandSeries.length !== 0
          ? brandSeries.map((series, i) => (
              <>
                <div
                  key={i}
                  className="col-span-1 max-h-44 sm:max-h-56 sm:rounded-lg border-b border-r border-solid sm:border-0"
                >
                  <Link
                    // to={`/categories/brands/productDetails/${series.id}`}
                    key={i}
                    className="w-full h-full"
                  >
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center cursor-pointer w-full h-full bg-gray-200 p-2 sm:p-4 sm:min-w-full rounded-0 sm:rounded-xl sm:ring-0 sm:ring-transparent sm:shadow sm:max-h-56 sm:max-w-44 hover:shadow-xl transition ease-in-out duration-500"
                    >
                      <span className="text-center mt-2 flex-1 line-clamp-3 flex horizontal items-center justify-center h-9 sm:h-full sm:w-full sm:max-h-12">
                        <div className="text-[14.5px] font-[500] leading-7">
                          {series.name}
                        </div>
                      </span>
                    </div>
                  </Link>
                </div>
              </>
            ))
          : null}
      </div>
    </div>
  );
};

export default ProductSeries;

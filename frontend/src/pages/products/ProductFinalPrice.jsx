import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateOrderMutation } from "../../features/api";
import { toast } from "react-toastify";

const ProductFinalPrice = () => {
  const selectedProdDetails = useSelector((state) => state.deductions);
  const [formData, setFormData] = useState();
  const [offerPrice, setOfferPrice] = useState();
  console.log(selectedProdDetails);

  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  console.log("productId", productId);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handlePinCodeChange = (e) => {
    let value = e.target.value;

    // Remove non-numeric characters
    value = value.replace(/\D/g, "");

    // Restrict the length to 10 digits
    if (value.length <= 6) {
      setFormData({ ...formData, pinCode: Number(e.target.value) });
    } else {
      toast.error("PinCode cannot be more than 5 digits");
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;

    // Remove non-numeric characters
    value = value.replace(/\D/g, "");

    // Restrict the length to 10 digits
    if (value.length <= 10) {
      setFormData({ ...formData, phone: Number(e.target.value) });
    } else {
      toast.error("Phone Number cannot be more than 10 digits");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const order = await createOrder(formData);
    console.log("order", order);
    if (order.data.success) {
      closeModal();
      toast.success("Your Order placed successfully");
      navigate(`/categories/brands/productDetails/${productId}`);
    }
  };

  useEffect(() => {
    if (selectedProdDetails.productName == "") {
      navigate(`/`);
    }
  });

  useEffect(() => {
    setFormData({
      ...formData,
      productId,
      variant: selectedProdDetails.getUpTo,
      deductions: selectedProdDetails.deductions,
      offerPrice:
        Number(selectedProdDetails.getUpTo.price) -
        Number(selectedProdDetails.toBeDeducted),
      status: "pending",
    });
    setOfferPrice(
      selectedProdDetails.getUpTo.price - selectedProdDetails.toBeDeducted
    );
  }, [selectedProdDetails]);

  console.log(formData);

  return (
    <>
      <div className="flex flex-col items-center my-[10%] mx-auto">
        <div className="p-4 flex flex-col items-center">
          <h1 className="text-[20px]">
            Product {"  "}
            <span className="text-[30px] text-yellow-500 font-semibold">
              {selectedProdDetails.productName +
                " " +
                selectedProdDetails.getUpTo.variantName}
            </span>
            <span className="text-[25px] text-green-600 font-bold"></span>
          </h1>

          {/* <h1 className="text-[20px]">
            Quoted Price{" "}
            <span className="text-[30px] text-yellow-500 font-bold">
              {selectedProdDetails.getUpTo.price}/-
            </span>
          </h1> */}
          <h1 className="text-[20px]">
            Final Price{" "}
            {/* <span className="text-[30px] text-green-600 font-bold">4800/-</span> */}
            <span className="text-[30px] text-green-600 font-bold">
              {/* {formData.offerPrice && formData.offerPrice} */}
              {offerPrice}
              /-
              {Number(selectedProdDetails.getUpTo.price)}
              {" - "}
              {Number(selectedProdDetails.toBeDeducted)}
            </span>
          </h1>
          <h1 className="text-center">
            This is your Products Final Price based on the following criteria
            which you mentioned
          </h1>
          <ul>
            {selectedProdDetails.deductions.map((deduction, index) => (
              <li key={index}>
                <span>{index + 1}. </span>{" "}
                <span className="text-lg font-semibold text-red-600">
                  {deduction.conditionLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center">
          <h2>Want to sell?..</h2>
          <h2 className="text-center">
            Click on "Sell" below and book your order for Instant Cash Pick
          </h2>
          <button
            onClick={openModal}
            className="px-4 py-1 border text-white bg-[#E27D60] rounded"
          >
            Sell
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-2/4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold mb-4">Enter your details</h2>
              <button
                onClick={closeModal}
                className=" bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                x
              </button>
            </div>
            <p></p>
            <div>
              <form
                action=""
                onSubmit={handleSubmit}
                className="flex flex-col gap-2"
              >
                <label htmlFor="name">Enter Name :</label>
                <input
                  type="text"
                  name="name"
                  id=""
                  placeholder="Enter Name"
                  className="border rounded px-2 py-1 w-1/3"
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                />
                <label htmlFor="email">Enter Email :</label>
                <input
                  type="email"
                  name="email"
                  id=""
                  placeholder="Enter your email"
                  className="border rounded px-2 py-1 w-1/3"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <label htmlFor="phone">Enter Phone Number :</label>
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  placeholder="Enter your phone number"
                  className="border rounded px-2 py-1 w-1/3"
                  // onChange={(e) =>
                  //   setFormData({ ...formData, phone: Number(e.target.value) })
                  // }
                  onChange={handlePhoneChange}
                  required
                />
                <label htmlFor="address">Enter Address :</label>
                <input
                  type="text"
                  name="address"
                  id=""
                  placeholder="Add your address"
                  className="border rounded px-2 py-1"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
                <div className="flex items-center gap-2">
                  <label htmlFor="pincode">Enter Address PinCode :</label>
                  <input
                    type="number"
                    name="pincode"
                    value={formData.pinCode}
                    placeholder="pincode"
                    className="border rounded px-2 py-1 w-1/5"
                    onChange={handlePinCodeChange}
                    required
                  />
                </div>
                <input
                  type="submit"
                  value="Submit"
                  name=""
                  className="border rounded px-2 py-1 w-1/5 bg-blue-500 text-white cursor-pointer hover:bg-green-600"
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFinalPrice;

import ServiceOrder from "../../models/serviceOrderModel.js";
import dotenv from "dotenv";
dotenv.config();

export const getServicerOrders = async (req, res) => {
  console.log("getServicerOrders controller");

  try {
    const serviceOrders = await ServiceOrder.find();
    // console.log("serviceOrders", serviceOrders);
    res.status(200).json(serviceOrders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getServiceOrder = async (req, res) => {
  console.log("getServiceOrder controller");

  try {
    const serviceOrderId = req.params.serviceOrderId;
    // const ordersList = await RecycleOrder.find().populate("productId", "name");
    const serviceOrder = await ServiceOrder.findById(serviceOrderId);
    // console.log("serviceOrder",serviceOrder);
    res.status(200).json(serviceOrder);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createServiceOrder = async (req, res) => {
  console.log("CreateOrder controller");
  try {
    // console.log(req.body);
    const totalOrders = await ServiceOrder.find();
    console.log("totalOrders", totalOrders.length);

    // Generating Order ID
    const today = new Date(); // Current date
    const year = today.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Month with leading zero if needed
    const day = today.getDate().toString().padStart(2, "0"); // Day with leading zero if needed
    const CN = req.body.customerName
      .replace(/\s+/g, "")
      .slice(0, 2)
      .toUpperCase();
    const random = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    const orderCount = totalOrders.length + 1;

    const serviceOrderId = `SERORD${year}${month}${day}${CN}00${orderCount}`; // Concatenate date and random number

    console.log("OrderID", serviceOrderId);
    const serviceOrderData = { ...req.body, serviceOrderId };
    console.log("serviceOrderData", serviceOrderData);

    let order = await ServiceOrder.create(serviceOrderData);
    // let order = await Order.create(req.body);
    order.save();
    console.log("created order", order);

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const serviceOrderCompleted = async (req, res) => {
  console.log("serviceOrderCompleted controller");
  // const serviceOrderId = req.params.serviceOrderId;
  try {
    const serviceOrderId = req.params.serviceOrderId;
    console.log(serviceOrderId);

    const {
      // serviceOrderId,
      serviceFinalPrice,
      serviceAgent,
      serviceCompletedOn,
      additionalServices,
      status,
    } = req.body;

    const serviceOrder = await ServiceOrder.findById(serviceOrderId);
    console.log("serviceOrderFound", serviceOrder);

    const updatedServiceOrder = await ServiceOrder.findByIdAndUpdate(
      serviceOrderId,
      {
        serviceFinalPrice,
        serviceAgent,
        serviceCompletedOn,
        additionalServices,
        status,
      },
      { new: true } // This option returns the updated document
    );
    console.log("updatedServiceOrder", updatedServiceOrder);

    res.status(200).json({ success: true, data: updatedServiceOrder });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cancel Recycle Order
export const cancelServiceOrder = async (req, res) => {
  console.log("cancelServiceOrder controller");
  const serviceOrderId = req.params.serviceOrderId;
  console.log("serviceOrderId", serviceOrderId);

  const { status, cancelReason } = req.body;
  console.log("req.body", req.body);

  try {
    const updateOrder = await ServiceOrder.findByIdAndUpdate(
      serviceOrderId, // The ID of the order to update
      { $set: { status, cancelReason } }, // The fields to update using $set
      { new: true } // Option to return the updated document
    );
    // console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Service Order not found" });
    }

    res
      .status(200)
      .json({ message: "Service Order cancelled successfully", updateOrder });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while cancelling Recycle Order.",
      error,
    });
  }
};

// DELETE SERVICE ORDER
export const deleteServiceOrder = async (req, res) => {
  console.log("deleteServiceOrder controller");
  const serviceOrderId = req.params.serviceOrderId;
  console.log(serviceOrderId);

  try {
    // 1. Delete brand
    const deletedOrder = await ServiceOrder.findByIdAndDelete(serviceOrderId);
    console.log("deleteOrder", deletedOrder);

    return res.status(201).json(deletedOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};

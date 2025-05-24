import RecycleOrder from "../models/recycleOrderModel.js";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  HOSTINGER_MAILER,
  INSTANTHUB_GMAIL,
  RECYCLE_ORDER_EMAIL,
  SUPPORT_EMAIL,
} from "../constants/email.js";
import {
  RECYCLE_ORDER_CANCEL_TEMPLATE,
  RECYCLE_ORDER_RECEIVED_TEMPLTE,
  RECYCLE_ORDER_TEMPLATE,
} from "../utils/emailTemplates/recycle.js";
dotenv.config();

export const getRecycleOrders = async (req, res) => {
  console.log("getRecycleOrders controller");

  try {
    // const ordersList = await RecycleOrder.find().populate("productId", "name");
    const ordersList = await RecycleOrder.find();
    // console.log(ordersList);
    res.status(200).json(ordersList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getRecycleOrder = async (req, res) => {
  console.log("getRecycleOrder controller");

  try {
    const recycleOrderId = req.params.recycleOrderId;
    // const ordersList = await RecycleOrder.find().populate("productId", "name");
    const recycleOrder = await RecycleOrder.findById(recycleOrderId);
    // console.log("recycleOrder",recycleOrder);
    res.status(200).json(recycleOrder);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createRecycleOrder = async (req, res) => {
  console.log("createRecycleOrder controller");
  try {
    console.log("req.body", req.body);
    const totalOrders = await RecycleOrder.find();
    console.log("totalOrders", totalOrders.length);
    // console.log("totalOrders", totalOrders.count);
    // Generating Order ID
    const today = new Date(); // Current date
    const year = today.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Month with leading zero if needed
    const day = today.getDate().toString().padStart(2, "0"); // Day with leading zero if needed
    const CN = req.body.customerName
      .replace(/\s+/g, "")
      .slice(0, 2)
      .toUpperCase();
    const PH = req.body.phone.toString().slice(-2);
    const random = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    const orderCount = totalOrders.length + 1;

    const recycleOrderId = `REORD${year}${month}${day}${CN}${PH}00${orderCount}`; // Concatenate date and random number
    console.log("recycleOrderId", recycleOrderId);

    const orderData = { ...req.body, recycleOrderId };
    console.log("recycleOrderData", orderData);

    let order = await RecycleOrder.create(orderData);
    order.save();
    console.log("created recycleOrder", order);

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: "instanthub.in@gmail.com", // Sender email address

      from: RECYCLE_ORDER_EMAIL, // Sender email address
      to: order.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Your Order #${recycleOrderId} has been placed ${order.customerName}`, // Subject line
      html: RECYCLE_ORDER_TEMPLATE(recycleOrderId, order),
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Recycle Order Completed
export const recycleOrderReceived = async (req, res) => {
  console.log("recycleOrderReceived Controller");
  try {
    console.log(req.body);

    const recycleOrderId = req.params.recycleOrderId;

    const {
      customerProofFront,
      customerProofBack,
      customerOptional1,
      customerOptional2,
      pickedUpDetails,
      deviceInfo,
      finalPrice,
      status,
    } = req.body;

    const updateObject = {
      customerProofFront,
      customerProofBack,
      pickedUpDetails,
      deviceInfo,
      finalPrice,
      status,
    };

    if (customerOptional1 !== null) {
      updateObject.customerOptional1 = customerOptional1;
    }

    if (customerOptional2 !== null) {
      updateObject.customerOptional2 = customerOptional2;
    }

    const updatedOrder = await RecycleOrder.findByIdAndUpdate(
      recycleOrderId,
      updateObject,
      {
        new: true,
      }
    );

    updatedOrder.save();

    console.log("updatedOrder", updatedOrder);

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: RECYCLE_ORDER_EMAIL, // Sender email address
      to: updatedOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Purchase Details for Order ${updatedOrder.recycleOrderId}`, // Subject line
      html: RECYCLE_ORDER_RECEIVED_TEMPLTE(updatedOrder),
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res.status(200).json({
      success: true,
      message: "Order Received and Updated",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cancel Recycle Order
export const recycleOrderCancel = async (req, res) => {
  console.log("recycleOrderCancel controller");
  const recycleOrderId = req.params.recycleOrderId;
  console.log("recycleOrderId", recycleOrderId);

  const { status, cancelReason } = req.body;
  console.log("req.body", req.body);
  // console.log("status", status);
  // console.log("cancelReason", cancelReason);

  try {
    const updateOrder = await RecycleOrder.findByIdAndUpdate(
      recycleOrderId, // The ID of the order to update
      { status, cancelReason }, // The fields to update
      { new: true } // Option to return the updated document
    );
    // console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Recycle Order not found" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: "instanthub.in@gmail.com", // Sender email address

      from: SUPPORT_EMAIL, // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updateOrder.recycleOrderId} has been cancelled ${updateOrder.customerName}`, // Subject line
      // html: emailBody,
      text: RECYCLE_ORDER_CANCEL_TEMPLATE(cancelReason),
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res
      .status(200)
      .json({ message: "Recycle Order cancelled successfully", updateOrder });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while cancelling Recycle Order.",
      error,
    });
  }
};

// DELETE Recyle Order
export const deleteRecycleOrder = async (req, res) => {
  console.log("deleteRecycleOrder controller");
  const recycleOrderId = req.params.recycleOrderId;
  console.log(recycleOrderId);

  try {
    // 1. Delete brand
    const deletedRecycleOrder = await RecycleOrder.findByIdAndDelete(
      recycleOrderId
    );
    console.log("deletedRecycleOrder", deletedRecycleOrder);

    // 2. Delete image from uploads/ of the deleted Order
    deleteImage(deletedRecycleOrder.customerProofFront);
    deleteImage(deletedRecycleOrder.customerProofBack);

    if (deletedRecycleOrder.customerOptional1)
      deleteImage(deletedRecycleOrder.customerOptional1);
    if (deletedRecycleOrder.customerOptional2)
      deleteImage(deletedRecycleOrder.customerOptional2);

    // Delete the corresponding image file from the uploads folder
    function deleteImage(image) {
      const __dirname = path.resolve();
      const imagePath = path.join(__dirname, image);
      console.log("imagePath", image);

      try {
        fs.unlink(imagePath, (err) => {
          if (err) {
            if (err.code === "ENOENT") {
              console.log(`Image ${imagePath} does not exist.`);
            } else {
              console.error(`Error deleting image ${imagePath}:`, err);
            }
          } else {
            console.log(`Image ${imagePath} deleted successfully.`);
          }
        });
      } catch (err) {
        console.error(`Error deleting image ${imagePath}:`, err);
      }
    }

    return res.status(201).json(deletedRecycleOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};

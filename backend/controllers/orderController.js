import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import Stocks from "../models/stocksModel.js";
import {
  HOSTINGER_MAILER,
  INSTANTHUB_GMAIL,
  ORDERS_EMAIL,
  SUPPORT_EMAIL,
} from "../constants/email.js";

import {
  ORDER_ASSIGN_AGENT_TEMPLATE,
  ORDER_CANCEL_TEMPLATE,
  ORDER_EMAIL_TEMPLATE,
  ORDER_RECEIVED_TEMPLATE,
} from "../utils/emailTemplates/orders.js";

export const getOrders = async (req, res) => {
  console.log("GetOrders controller");

  try {
    const ordersList = await Order.find().populate("productId", "name");
    // console.log(ordersList);
    res.status(200).json(ordersList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getOneOrders = async (req, res) => {
  console.log("GetOrders controller");

  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate("productId", "name");
    // console.log(order);
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  console.log("CreateOrder controller");
  try {
    // console.log(req.body);
    const totalOrders = await Order.find();
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
    const PH = req.body.phone.toString().slice(-3);
    const random = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    const orderCount = totalOrders.length + 1;

    const orderId = `ORD${year}${month}${day}${CN}${PH}00${orderCount}`; // Concatenate date and random number

    console.log("OrderID", orderId);
    const orderData = { ...req.body, orderId };
    // console.log("orderData", orderData);

    let order = await Order.create(orderData);
    // let order = await Order.create(req.body);
    order.save();
    // console.log("created order", order);

    const product = await Product.findById(order.productId);
    // console.log("product", product);

    // const filteredDeductionsHTML =
    //   order.deductions && order.deductions.length > 0
    //     ? order.deductions
    //         .map((deduction) => `<li>${deduction.conditionLabel}</li>`)
    //         .join("")
    //     : "<li>Specifications not selected</li>";

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      from: ORDERS_EMAIL, // Sender email address
      to: order.email, // Recipient email address
      cc: INSTANTHUB_GMAIL,
      subject: `Your Order #${orderId} has been placed ${order.customerName}`, // Subject line
      // text: "Hello, This is a test email from Nodemailer!", // Plain text body
      html: ORDER_EMAIL_TEMPLATE(orderId, order),
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

// Order Received
export const orderReceived = async (req, res) => {
  console.log("orderReceived Controller");
  try {
    console.log(req.body);
    const {
      orderId,
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

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateObject, {
      new: true,
    });

    updatedOrder.save();

    console.log("updatedOrder", updatedOrder);

    const stockIn = await Stocks.create({
      orderId: updatedOrder.orderId,
      productDetails: {
        productName: updatedOrder.productName,
        productVariant: updatedOrder.variant.variantName,
        productCategory: updatedOrder.productCategory,
        serialNumber: updatedOrder.deviceInfo.serialNumber,
        imeiNumber: updatedOrder.deviceInfo.imeiNumber,
      },
      customerDetails: {
        customerName: updatedOrder.customerName,
        email: updatedOrder.email,
        phone: updatedOrder.phone,
      },

      pickedUpDetails: updatedOrder.pickedUpDetails,
      status: {
        in: true,
        out: false,
        lost: false,
      },
      purchasePrice: updatedOrder.finalPrice,
    });

    stockIn.save();

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: ORDERS_EMAIL, // Sender email address
      to: updatedOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Purchase Details for Order ${updatedOrder.orderId}`, // Subject line
      html: ORDER_RECEIVED_TEMPLATE(updatedOrder),
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

// Cancel Order
export const orderCancel = async (req, res) => {
  console.log("orderCancel controller");
  const orderId = req.params.orderId;
  console.log("orderId", orderId);

  const { status, cancelReason } = req.body;
  console.log("req.body", req.body);
  // console.log("status", status);
  // console.log("cancelReason", cancelReason);

  try {
    const updateOrder = await Order.findByIdAndUpdate(
      orderId, // The ID of the order to update
      { status, cancelReason }, // The fields to update
      { new: true } // Option to return the updated document
    );
    console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: "instanthub.in@gmail.com", // Sender email address

      from: SUPPORT_EMAIL, // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updateOrder.orderId} has been cancelled ${updateOrder.customerName}`, // Subject line
      // html: emailBody,
      text: ORDER_CANCEL_TEMPLATE(cancelReason),
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
      .json({ message: "Order cancelled successfully", updateOrder });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while cancelling Order.",
      error,
    });
  }
};

// DELETE Order
export const deleteOrder = async (req, res) => {
  console.log("DeleteOrder controller");
  const orderId = req.params.orderId;
  console.log(orderId);

  try {
    // 1. Delete Order
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    console.log("deleteOrder", deletedOrder);

    // 2. Delete image from uploads/ of the deleted Order
    deleteImage(deletedOrder.customerProofFront);
    deleteImage(deletedOrder.customerProofBack);

    if (deletedOrder.customerOptional1)
      deleteImage(deletedOrder.customerOptional1);
    if (deletedOrder.customerOptional2)
      deleteImage(deletedOrder.customerOptional2);

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

    return res.status(201).json(deletedOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};

// Assign Agent
export const assignAgent = async (req, res) => {
  console.log("assignAgent controller");
  const orderId = req.params.orderId;
  // console.log("orderId", orderId);

  const pickedUpDetails = req.body;
  // console.log("req.body", req.body, pickedUpDetails);

  try {
    const updateOrder = await Order.findByIdAndUpdate(
      orderId, // The ID of the order to update
      { pickedUpDetails }, // The fields to update
      { new: true } // Option to return the updated document
    );
    // console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: "instanthub.in@gmail.com", // Sender email address

      from: ORDERS_EMAIL, // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Agent Has Been Assigned To Your Order #${updateOrder.orderId}`, // Subject line
      text: ORDER_ASSIGN_AGENT_TEMPLATE(updateOrder),
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
      .json({ message: "Agent Assigned successfully", updateOrder });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while cancelling Order.",
      error,
    });
  }
};

// Old nodemailer code
{
  // const transporter = nodemailer.createTransport({
  //   // Development
  //   // service: "gmail",
  //   // host: "smtp.gmail.com", // Replace with your SMTP server
  //   host: "smtp.hostinger.com", // Replace with your SMTP server
  //   port: 465, // Use 587 for TLS or 465 for SSL
  //   secure: true, // true for port 465, false for 587
  //   auth: {
  //     // Production
  //     user: "support@instanthub.in", // Your domain email
  //     pass: process.env.SUPPORT_PASSWORD, // Your domain email password
  //     // Development
  //     // user: "instanthub.in@gmail.com", // Your domain email
  //     // pass: process.env.APP_PASSWORD, // Your domain email password
  //   },
  // });
}

// Accessories filter in filterdata
{
  // .filter(
  //   (deduction) =>
  //     !order.accessoriesAvailable.some(
  //       (accessory) =>
  //         accessory.conditionLabel === deduction.conditionLabel
  //     )
  // )
}

// Accessories in CreateOrder before "Selected Specification"
{
  /* <tr>
  <th>Accessories</th>
  <td>
    <ol>
      $
      {order.accessoriesAvailable && order.accessoriesAvailable.length > 0
        ? order.accessoriesAvailable
            .map((accessory) => `<li>${accessory.conditionLabel}</li>`)
            .join("")
        : "<li>No accessories</li>"}
    </ol>
  </td>
</tr>; */
}

// Accessories in StockIn
{
  //   accessoriesAvailable: updatedOrder.accessoriesAvailable?.map(
  //   (a) => a.conditionLabel
  // )
}

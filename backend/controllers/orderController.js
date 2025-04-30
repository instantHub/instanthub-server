import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import Stocks from "../models/stocksModel.js";
import { HOSTINGER_MAILER } from "../utils/helper.js";

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

    const filteredDeductionsHTML =
      order.finalDeductionSet && order.finalDeductionSet.length > 0
        ? order.finalDeductionSet
            .map(
              ({ type, conditions }) =>
                `<p class="deduction-data-title deduction-data">${type}:</p>
              <ul class="deduction-data">
                ${conditions
                  ?.map((condition) => `<li>${condition.conditionLabel}</li>`)
                  .join("")}
              </ul>`
            )
            .join("")
        : "<li>Specifications not selected</li>";

    let emailBody = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Order Summary</title>
          <style>
            h2 {
              color: #333;
              margin-bottom: 20px;
            }
            th,
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            th {
              text-align: left;
              background-color: #f2f2f2;
            }
      
            .order-detail h1 {
              font-size: small;
            }

            .deduction-data {
              padding: 2px;
              margin: 0px;
            }
            
            .deduction-data-title {
              font-weight: 800;
            }
      
            /* Mobile Styles */
            @media only screen and (max-width: 600px) {
              .container {
                padding: 10px;
              }
              table {
                font-size: 14px;
              }
              th,
              td {
                padding: 8px;
              }
              .logo {
                width: 100px;
                height: 80px;
              }
              h2 {
                color: #333;
                font-size: 10.2px;
              }
              .sell {
                font-size: 15px;
              }
            }
      
            .logo-header {
              display: flex;
              align-items: center;
              justify-content: start;
              gap: 15%;
            }

            .logo {
              width: 120px;
              height: 65px;
            }

            /* Mobile Styles */
            @media only screen and (max-width: 600px) {
              .logo {
                width: 80px;
                height: 55px
              }
            }

          </style>
        </head>
        <body
          style="
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
          "
        >
          <div
            class="container"
            style="
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            "
          >
            <h1 class="sell" style="text-align: center">
            <img
            src="https://api.instantpick.in/uploads/NavLogo.jpg"
            alt="Instant Hub"
            class="logo"
          />
            </h1>
            <h1 class="sell" style="text-align: center">Sell Receipt</h1>
            <h2 style="text-align: center">
              congratulations your order has been placed with InstantHub
            </h2>
            <h1 style="font-size: small">
              <a href="https://instanthub.in">InstantHub</a>
            </h1>
      
            <div class="order-detail">
              <div>
                <h1>
                  <span>Order #</span>
                  <span>${orderId}</span>
                </h1>
                <h1>
                  <span>Customer Name: </span>
                  <span>${order.customerName}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span>PickUp Scheduled: </span>
                  <span>${order.schedulePickUp}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span>Email: </span>
                  <span>${order.email}</span>
                </h1>
                <h1>
                  <span>Ph #</span>
                  <span>${order.phone}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span>Billing Address: </span>
                  <span>
                    ${order.addressDetails.address}
                    ${order.addressDetails.state} 
                    ${order.addressDetails.city}
                    ${order.addressDetails.pinCode}
                  </span>
                </h1>
              </div>
            </div>
      
            <table
              style="width: 100%; border-collapse: collapse; margin-bottom: 20px"
            >
              <tr>
                <th>Product Details</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${order.productCategory}</span>
                      <span>${order.productName}</span>
                      ${
                        order.productCategory.toLowerCase().includes("mobile")
                          ? `<span>${order.variant.variantName}</span>`
                          : `<span> </span>`
                      }
                    </h4>
                  </div>
                </td>
              </tr>
      
              


              <tr>
                <th>Selected Specification</th>
                <td>
                  ${filteredDeductionsHTML}
                </td>
              </tr>

              <tr>
                <th>Selected Payment Mode</th>
                <td>${order.paymentMode}</td>
              </tr>
      
              <tr>
                <th>Offered Price</th>
                <td>₹ ${order.offerPrice}</td>
              </tr>
            </table>
            <p style="text-align: center; color: #585555">
              Get in touch with us if you need any additional help:
              <a href="tel:8722288017" style="color: #007bff; text-decoration: none"
              >8722288017</a>
            </p>
            <p style="text-align: center; color: #777">
              If you have any questions or concerns about your order, please send us a
              mail at
              <a href="mailto:support@instanthub.in"
                >support@instanthub.in</a
              >.
            </p>
            
            <p
              class="min-size"
              style="font-size: smaller; text-align: right; color: #777"
            >
              GST Number: 29CSJPA4571K1ZE
            </p>
          </div>
        </body>
      </html>
      `;

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      from: "orders@instanthub.in", // Sender email address
      to: order.email, // Recipient email address
      cc: "instanthub.in@gmail.com",
      subject: `Your Order #${orderId} has been placed ${order.customerName}`, // Subject line
      // text: "Hello, This is a test email from Nodemailer!", // Plain text body
      html: emailBody,
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

    // console.log("Stocks In", stockIn);

    let emailBody = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Summary</title>
        <!-- <style>
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th,
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          th {
            text-align: left;
            background-color: #f2f2f2;
          }
    
          .thankyou-note {
            font-size: 20px;
          }
    
          /* Mobile Styles */
          @media only screen and (max-width: 600px) {
            h2 {
              font-size: 10px;
            }
            table {
              font-size: 14px;
            }
            th,
            td {
              padding: 8px;
            }
            .logo {
              width: 100px;
              height: 80px;
            }
            h2 {
              color: #333;
              font-size: 12.2px;
            }
            h3 {
              color: #333;
              font-size: 10.2px;
            }
            .sell {
              font-size: 24px;
            }
    
            .thankyou-note {
              font-size: smaller;
            }
            .min-size {
              font-size: 6px;
            }
          }
    
          @media only screen and (min-width: 601px) {
            .logo {
              width: 110px;
              height: 90px;
            }
          }
        </style> -->
    
        <style>
          h2 {
            color: #333;
            margin-bottom: 20px;
          }
          th,
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          th {
            text-align: left;
            background-color: #f2f2f2;
          }
    
          .order-detail h1 {
            font-size: small;
          }
    
          /* Mobile Styles */
          @media only screen and (max-width: 600px) {
            .container {
              padding: 10px;
            }
            table {
              font-size: 14px;
            }
            th,
            td {
              padding: 8px;
            }
            .logo {
              width: 100px;
              height: 80px;
            }
            h2 {
              color: #333;
              font-size: 10.2px;
            }
            .sell {
              font-size: 15px;
            }
          }
    
          .logo-header {
            display: flex;
            align-items: center;
            justify-content: start;
            gap: 15%;
          }

          .logo {
              width: 120px;
              height: 65px;
            }

          /* Mobile Styles */
          @media only screen and (max-width: 600px) {
            .logo {
              width: 80px;
              height: 55px
            }
          }
        </style>
      </head>
      <body
        style="
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
        "
      >
        <div
          class="container"
          style="
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          "
        >
          <h2 class="sell" style="text-align: center">
            <img
              src="https://api.instantpick.in/uploads/NavLogo.jpg"
              alt="Instant Hub"
              class="logo"
              />
          </h2>
          <h1 class="sell" style="text-align: center">Purchased Receipt</h1>
    
          <div class="order-detail">
            <div>
              <h1>
                <span>Order #</span>
                <span>${updatedOrder.orderId}</span>
              </h1>
              <h1>
                <span>Customer Name: </span>
                <span>${updatedOrder.customerName}</span>
              </h1>
            </div>
    
            <div>
              <h1>
                <span>Email: </span>
                <span>${updatedOrder.email}</span>
              </h1>
              <h1>
                <span>Ph #</span>
                <span>${updatedOrder.phone}</span>
              </h1>
            </div>
    
            <div>
              <h1>
                <span>Seller Address: </span>
                <span>
                  ${updatedOrder.addressDetails.address}
                  ${updatedOrder.addressDetails.state}
                  ${updatedOrder.addressDetails.city}
                  ${updatedOrder.addressDetails.pinCode}
                </span>
              </h1>
            </div>
          </div>
    
          <table
            style="width: 100%; border-collapse: collapse; margin-bottom: 20px"
          >
            <tr>
              <th>Product Details</th>
              <td>
                <div style="display: flex; flex-direction: column">
                  <h4>
                    <span>${updatedOrder.productCategory}</span>
                    <span>${updatedOrder.productName}</span>
                    ${
                      updatedOrder.productCategory
                        .toLowerCase()
                        .includes("mobile")
                        ? `<span>${updatedOrder.variant.variantName}</span>`
                        : `<span> </span>`
                    }
                  </h4>
                </div>
              </td>
            </tr>
    
            <tr>
              <th>Agent Name</th>
              <td>${updatedOrder.pickedUpDetails.agentName}</td>
            </tr>
    
            <tr>
              <th>PickUp Time</th>
              <td>${updatedOrder.pickedUpDetails.pickedUpDate}</td>
            </tr>
    
            <tr>
              <th>Final Price</th>
              <td>₹ ${updatedOrder.finalPrice}</td>
            </tr>
          </table>
          <p
            class="thankyou-note"
            style="text-align: start; color: #585555; font-weight: 700"
          >
            Thank you for selling your product and trusting us.
          </p>
    
          <p style="text-align: start; color: #585555; font-weight: 700">
            Your information is protected and secured, and it will be erased.
          </p>
    
          <p style="font-size: px; text-align: center">
            Visit us again
            <a href="https://instanthub.in">instanthub.in</a>
          </p>
    
          <p style="text-align: center; color: #777">
            If you have any questions or concerns about your order, please send us a
            mail at
            <a href="mailto:support@instanthub.in"
              >support@instanthub.in</a
            >.
          </p>
          <p
            class="min-size"
            style="font-size: smaller; text-align: right; color: #777"
          >
            GST Number: 29CSJPA4571K1ZE
          </p>
        </div>
      </body>
    </html>
    `;

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: "orders@instanthub.in", // Sender email address
      to: updatedOrder.email, // Recipient email address
      cc: "instanthub.in@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Purchase Details for Order ${updatedOrder.orderId}`, // Subject line
      html: emailBody,
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

      from: "support@instanthub.in", // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: "instanthub.in@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updateOrder.orderId} has been cancelled ${updateOrder.customerName}`, // Subject line
      // html: emailBody,
      text: `Dear Customer,
    
    Thank you for choosing Instant Hub to sell your product. We truly appreciate your interest in our services.
    
    Sorry to inform you that we had to cancel your order.
    Cancellation Reason: ${cancelReason}
    
    We sincerely apologize for any inconvenience this may cause. Please let us know if there is anything else we can assist you with, or feel free to reach out to us if you have any future requirements within Bangalore.
    Thank you for your understanding and support.
    
    Best regards,  
    InstantHub Team  
    support@instanthub.in  
    8722288017  
    https://www.instanthub.in/`,
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

      from: "orders@instanthub.in", // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: "instanthub.in@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Agent Has Been Assigned To Your Order #${updateOrder.orderId}`, // Subject line
      text: `Dear ${updateOrder.customerName},

    We are pleased to inform you that an agent has been assigned to pick up your order. Below are the details:

        Order ID: ${updateOrder.orderId}
        Assigned Agent: ${updateOrder.pickedUpDetails.agentName}
        PickUp Date & Time: ${updateOrder.pickedUpDetails.pickedUpDate}

    Please ensure the item is ready for pickup at the scheduled time. If you have any questions or need to reschedule, feel free to contact us.

    Thank you for choosing Instant Hub.

    Best regards,
    InstantHub Team
    support@instanthub.in
    8722288017
    https://www.instanthub.in/`,
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

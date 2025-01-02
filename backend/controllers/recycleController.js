import RecycleOrder from "../models/recycleOrderModel.js";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
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
    const CN = req.body.customerName.slice(0, 2).toUpperCase();
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

    // console.log("APP_PASSWORD", process.env.USER);
    // console.log("APP_PASSWORD", process.env.APP_PASSWORD);

    // Create a transporter object using SMTP transport
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   host: "smtp.example.com", // SMTP server address
    //   port: 465, // SMTP port (usually 587 for TLS, 465 for SSL)
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     // user: process.env.USER, // Your email address
    //     // user: "instantcashpick@gmail.com", // Your email address
    //     user: "instanthub.in@gmail.com", // Your email address
    //     pass: process.env.APP_PASSWORD, // Your email password
    //   },
    // });

    const transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.hostinger.com", // Replace with your SMTP server
      port: 465, // Use 587 for TLS or 465 for SSL
      secure: true, // true for port 465, false for 587
      auth: {
        user: "support@instanthub.in", // Your domain email
        pass: process.env.SUPPORT_PASSWORD, // Your domain email password
      },
    });

    let emailBody = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Recycle Order Summary</title>
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
              alt=""
              style="width: 100px; height: 90px;"
            />
              </h1>
              <h1 class="sell" style="text-align: center">Sell Receipt</h1>
              <h2 style="text-align: center">
              congratulations your recycle order for ${
                order.productDetails.productCategory
              } has been placed with InstantHub
              </h2>
              <h1 style="font-size: small">
                <a href="https://instanthub.in">InstantHub</a>
              </h1>
        
              <div class="order-detail">
                <div>
                  <h1>
                    <span>Order #</span>
                    <span>${recycleOrderId}</span>
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
                        <span>${order.productDetails.productCategory}</span>
                        <span>${order.productDetails.productName}</span>
                        ${
                          order.productDetails.productCategory
                            .toLowerCase()
                            .includes("mobile")
                            ? `<span>${order.productDetails.productVariant}</span>`
                            : ``
                        }
                      </h4>
                    </div>
                  </td>
                </tr>

                ${
                  order.productDetails.productCategory
                    .toLowerCase()
                    .includes("laptop")
                    ? `
                    <tr>
                      <th>${order.productDetails.productCategory} Age</th>
                      <td>${order.productDetails.productAge}</td>
                    </tr>`
                    : ``
                }
                
                <tr>
                  <th>${order.productDetails.productCategory} Status</th>
                  <td>${order.productDetails.productStatus}</td>
                </tr>

                <tr>
                  <th>Selected Payment Mode</th>
                  <td>${order.paymentMode}</td>
                </tr>

                <tr>
                  <th>Recycle Price</th>
                  <td>₹ ${order.recyclePrice}</td>
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

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: "recycle-orders@instanthub.in", // Sender email address
      to: order.email, // Recipient email address
      cc: "instanthub.in@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Your Order #${recycleOrderId} has been placed ${order.customerName}`, // Subject line
      // text: "Hello, This is a test email from Nodemailer!", // Plain text body
      // You can also use HTML format

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

    // console.log(
    //   recycleOrderId,
    //   customerProofFront,
    //   customerProofBack,
    //   customerOptional1,
    //   customerOptional2,
    //   pickedUpDetails,
    //   finalPrice,
    //   status
    // );

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

    // const stockIn = await Stocks.create({
    //   orderId: updatedOrder.orderId,
    //   productDetails: {
    //     productName: updatedOrder.productName,
    //     productVariant: updatedOrder.variant.variantName,
    //     productCategory: updatedOrder.productCategory,
    //     serialNumber: updatedOrder.deviceInfo.serialNumber,
    //     imeiNumber: updatedOrder.deviceInfo.imeiNumber,
    //   },
    //   customerDetails: {
    //     customerName: updatedOrder.customerName,
    //     email: updatedOrder.email,
    //     phone: updatedOrder.phone,
    //   },
    //   accessoriesAvailable: updatedOrder.accessoriesAvailable.map(
    //     (a) => a.conditionLabel
    //   ),
    //   pickedUpDetails: updatedOrder.pickedUpDetails,
    //   stockStatus: "Stock In",
    //   purchasePrice: updatedOrder.finalPrice,
    // });

    // stockIn.save();

    // console.log("Stocks In", stockIn);

    // console.log("APP_PASSWORD", process.env.USER);
    // console.log("APP_PASSWORD", process.env.APP_PASSWORD);

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
              alt=""
              style="width: 100px; height: 90px"
            />
          </h2>
          <h1 class="sell" style="text-align: center">Purchased Receipt</h1>
          <h2 style="text-align: center">
              congratulations your recycle order for ${
                updatedOrder.productDetails.productCategory
              } has been completed by InstantHub
              </h2>
    
          <div class="order-detail">
            <div>
              <h1>
                <span>Order #</span>
                <span>${updatedOrder.recycleOrderId}</span>
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
                    <span>${updatedOrder.productDetails.productCategory}</span>
                    <span>${updatedOrder.productDetails.productName}</span>
                    ${
                      updatedOrder.productDetails.productCategory
                        .toLowerCase()
                        .includes("mobile")
                        ? `<span>${updatedOrder.productDetails.productVariant}</span>`
                        : ``
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
            Thank you for recycling your product and trusting us.
          </p>
    
          <p style="text-align: start; color: #585555; font-weight: 700">
            Your information is protected and secured, and it will be erased.
          </p>
    
          <p style="font-size: px; text-align: center">
            Visit us again
            <a href="https://www.instanthub.in">instanthub.in</a>
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

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: "recycle-orders@instanthub.in", // Sender email address
      to: updatedOrder.email, // Recipient email address
      cc: "instanthub.in@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Purchase Details for Order ${updatedOrder.recycleOrderId}`, // Subject line
      html: emailBody,
    };

    // Create a transporter object using SMTP transport
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   host: "smtp.example.com", // SMTP server address
    //   port: 465, // SMTP port (usually 587 for TLS, 465 for SSL)
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     // user: process.env.USER, // Your email address
    //     // user: "instantcashpick@gmail.com", // Your email address
    //     user: "instanthub.in@gmail.com", // Your email address
    //     pass: process.env.APP_PASSWORD, // Your email password
    //   },
    // });

    const transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.hostinger.com", // Replace with your SMTP server
      port: 465, // Use 587 for TLS or 465 for SSL
      secure: true, // true for port 465, false for 587
      auth: {
        user: "support@instanthub.in", // Your domain email
        pass: process.env.SUPPORT_PASSWORD, // Your domain email password
      },
    });

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
  console.log("orderCancel controller");
  const recycleOrderId = req.params.recycleOrderId;
  console.log("recycleOrderId", recycleOrderId);

  const { status, cancelReason } = req.body;
  console.log("req.body", req.body);
  console.log("status", status);
  console.log("cancelReason", cancelReason);

  try {
    const updateOrder = await RecycleOrder.findByIdAndUpdate(
      recycleOrderId, // The ID of the order to update
      { status, cancelReason }, // The fields to update
      { new: true } // Option to return the updated document
    );
    console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Recycle Order not found" });
    }

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

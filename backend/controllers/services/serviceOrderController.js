import ServiceOrder from "../../models/serviceOrderModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  HOSTINGER_MAILER,
  INSTANTHUB_GMAIL,
  SERVICE_ORDER_EMAIL,
  SUPPORT_EMAIL,
} from "../../constants/email.js";
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
    // const {
    //   productId,
    //   customerName,
    //   email,
    //   phone,
    //   address,
    //   pinCode,
    //   deductions,
    //   offerPrice,
    //   status,
    // } = req.body;

    // console.log(req.body);
    const totalOrders = await ServiceOrder.find();
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

    // const orderDetail = await Order.find({ orderId: order.orderId });
    // console.log(orderDetail);

    const filteredProblemsHTML =
      order.problems && order.problems.length > 0
        ? order.problems
            .map((problem) => `<li>${problem.serviceProblem}</li>`)
            .join("")
        : "<li>Problems not selected</li>";

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
              src="https://api.instantpick.in/uploads/instanthub-logo.png"
              alt="Instant Hub"
              class="logo"
            />
              </h1>
              <h1 class="sell" style="text-align: center">Service Booking Receipt</h1>
  
              ${
                order.serviceType === "ServiceSubCategory" ||
                order.serviceType === "Brand"
                  ? `
                  <h2 style="text-align: center">
                    congratulations your ${order.selectedService.serviceCategoryId.name} order has been booked with InstantHub
                  </h2>
                  `
                  : `
                  <h2 style="text-align: center">
                    congratulations your ${order.selectedService.name} order has been booked with InstantHub
                  </h2>
                  `
              }
             
              <h1 style="font-size: small">
                <a href="https://instanthub.in">InstantHub</a>
              </h1>
        
              <div class="order-detail">
                <div>
                  <h1>
                    <span>Order #</span>
                    <span>${order.serviceOrderId}</span>
                  </h1>
                  <h1>
                    <span>Customer Name: </span>
                    <span>${order.customerName}</span>
                  </h1>
                </div>
        
                <div>
                  <h1>
                    <span> Scheduled Date & Time: </span>
                    <span>${order.scheduleDate}</span>
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
                      ${order.address}
                    </span>
                  </h1>
                </div>
              </div>
        
              <table
                style="width: 100%; border-collapse: collapse; margin-bottom: 20px"
              >
  
              ${
                order.serviceType === "DirectService"
                  ? `
                <tr>
                  <th>Service Details</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${order.selectedService.name}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Inspection Charges</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>₹${order.inspectionCharges}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                `
                  : ``
              }
              
              ${
                order.serviceType === "Brand"
                  ? `
                <tr>
                  <th>Device Details</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${order.selectedService.serviceCategoryId.name}</span>
                        <span>${order.selectedService.name}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Problems</th>
                  <td>
                    <ol>
                      ${filteredProblemsHTML}
                    </ol>
                  </td>
                </tr>
                <tr>
                  <th>Inspection Charges</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>₹${order.inspectionCharges}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                `
                  : ``
              }
  
              ${
                order.serviceType === "ServiceSubCategory"
                  ? `
                <tr>
                  <th>Category</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${order.selectedService.serviceCategoryId.name} - ${order.selectedService.subServiceId.name}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Product</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${order.selectedService.name}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Price</th>
                  <td>₹${order.price}</td>
                </tr>
                <tr>
                  <th>Delivery Charges</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>₹${order.inspectionCharges}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                `
                  : ``
              }
  
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
      // from: process.env.USER, // Sender email address
      from: SERVICE_ORDER_EMAIL, // Sender email address
      to: req.body.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Your Order #${serviceOrderId} has been placed ${order.customerName}`, // Subject line

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

    // const orderDetail = await Order.find({ orderId: order.orderId });
    // console.log(orderDetail);

    const filteredProblemsHTML =
      updatedServiceOrder.problems && updatedServiceOrder.problems.length > 0
        ? updatedServiceOrder.problems
            .map((problem) => `<li>${problem.serviceProblem}</li>`)
            .join("")
        : "<li>Problems not selected</li>";

    const filteredAdditionalServicesHTML =
      updatedServiceOrder.additionalServices &&
      updatedServiceOrder.additionalServices.length > 0
        ? updatedServiceOrder.additionalServices
            .map(
              (service) =>
                `<li>ServiceName: ${service.name}, Service Price: ${service.price}</li>`
            )
            .join("")
        : "<li>No Additional Service Done</li>";

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
              src="https://api.instantpick.in/uploads/instanthub-logo.png"
              alt="Instant Hub"
              class="logo"
            />
              </h1>
              <h1 class="sell" style="text-align: center">Service Completion Receipt</h1>
  
              ${
                updatedServiceOrder.serviceType === "ServiceSubCategory" ||
                updatedServiceOrder.serviceType === "Brand"
                  ? `
                  <h2 style="text-align: center">
                    congratulations your ${updatedServiceOrder.selectedService.serviceCategoryId.name} order has been completed by InstantHub
                  </h2>
                  `
                  : `
                  <h2 style="text-align: center">
                    congratulations your ${updatedServiceOrder.selectedService.name} order has been completed by InstantHub
                  </h2>
                  `
              }
             
              <h1 style="font-size: small">
                <a href="https://instanthub.in">InstantHub</a>
              </h1>
        
              <div class="order-detail">
                <div>
                  <h1>
                    <span>Order #</span>
                    <span>${updatedServiceOrder.serviceOrderId}</span>
                  </h1>
                  <h1>
                    <span>Customer Name: </span>
                    <span>${updatedServiceOrder.customerName}</span>
                  </h1>
                </div>
        
                <div>
                  <h1>
                    <span> Scheduled Date & Time: </span>
                    <span>${updatedServiceOrder.scheduleDate}</span>
                  </h1>
                </div>
        
                <div>
                  <h1>
                    <span>Email: </span>
                    <span>${updatedServiceOrder.email}</span>
                  </h1>
                  <h1>
                    <span>Ph #</span>
                    <span>${updatedServiceOrder.phone}</span>
                  </h1>
                </div>
        
                <div>
                  <h1>
                    <span>Billing Address: </span>
                    <span>
                      ${updatedServiceOrder.address}
                    </span>
                  </h1>
                </div>
              </div>
        
              <table
                style="width: 100%; border-collapse: collapse; margin-bottom: 20px"
              >
  
              ${
                updatedServiceOrder.serviceType === "DirectService"
                  ? `
                <tr>
                  <th>Service Details</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${updatedServiceOrder.selectedService.name}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                `
                  : ``
              }
              
              ${
                updatedServiceOrder.serviceType === "Brand"
                  ? `
                <tr>
                  <th>Device Details</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${updatedServiceOrder.selectedService.serviceCategoryId.name}</span>
                        <span>${updatedServiceOrder.selectedService.name}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Selected Problems</th>
                  <td>
                    <ol>
                      ${filteredProblemsHTML}
                    </ol>
                  </td>
                </tr>
                <tr>
                  <th>Additional Serviced Problems</th>
                  <td>
                    <ol>
                      ${filteredAdditionalServicesHTML}
                    </ol>
                  </td>
                </tr>
                `
                  : ``
              }
  
              ${
                updatedServiceOrder.serviceType === "ServiceSubCategory"
                  ? `
                <tr>
                  <th>Category</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${updatedServiceOrder.selectedService.serviceCategoryId.name} - ${updatedServiceOrder.selectedService.subServiceId.name}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Product</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${updatedServiceOrder.selectedService.name}</span>
                      </h4>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Price</th>
                  <td>₹${updatedServiceOrder.price}</td>
                </tr>
                `
                  : ``
              }
              <tr>
                  <th>Service Agent</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>${updatedServiceOrder.serviceAgent}</span>
                      </h4>
                    </div>
                  </td>
              </tr>
              <tr>
              <th>Service Completed On</th>
              <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${updatedServiceOrder.serviceCompletedOn}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              <tr>
                  <th>Service Final Price</th>
                  <td>
                    <div style="display: flex; flex-direction: column">
                      <h4>
                        <span>₹${updatedServiceOrder.serviceFinalPrice}</span>
                      </h4>
                    </div>
                  </td>
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

    // const transporter = nodemailer.createTransport({
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: SERVICE_ORDER_EMAIL, // Sender email address
      to: updatedServiceOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updatedServiceOrder.serviceOrderId} has been placed ${updatedServiceOrder.customerName}`, // Subject line
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
  // console.log("status", status);
  // console.log("cancelReason", cancelReason);

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

    // Create transporter
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: "instanthub.in@gmail.com", // Sender email address

      from: SUPPORT_EMAIL, // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updateOrder.serviceOrderId} has been cancelled ${updateOrder.customerName}`, // Subject line
      text: `Dear Customer,
  
  Thank you for choosing Instant Hub. We truly appreciate your interest in our services.
  
  Sorry to inform you that we had to cancel your requested service.
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

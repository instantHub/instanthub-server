import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import e from "express";
dotenv.config();
// import logo from './'
// import puppeteer from "puppeteer";
import pdf from "html-pdf";
import PDFDocument from "pdfkit";
import Stocks from "../models/stocksModel.js";

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

export const createOrder = async (req, res) => {
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
    const totalOrders = await Order.find();
    console.log("totalOrders", totalOrders.length);
    // console.log("totalOrders", totalOrders.count);
    // Generating Order ID
    const today = new Date(); // Current date
    const year = today.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Month with leading zero if needed
    const day = today.getDate().toString().padStart(2, "0"); // Day with leading zero if needed
    const CN = req.body.customerName.slice(0, 2).toUpperCase();
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
    console.log("created order", order);

    // const orderDetail = await Order.find({ orderId: order.orderId });
    // console.log(orderDetail);

    const product = await Product.findById(order.productId);
    console.log("product", product);

    // console.log("APP_PASSWORD", process.env.USER);
    // console.log("APP_PASSWORD", process.env.APP_PASSWORD);

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.example.com", // SMTP server address
      port: 465, // SMTP port (usually 587 for TLS, 465 for SSL)
      secure: false, // true for 465, false for other ports
      auth: {
        // user: process.env.USER, // Your email address
        user: "instantcashpick@gmail.com", // Your email address
        pass: process.env.APP_PASSWORD, // Your email password
      },
    });

    const filteredDeductionsHTML =
      order.deductions && order.deductions.length > 0
        ? order.deductions
            .filter(
              (deduction) =>
                !order.accessoriesAvailable.some(
                  (accessory) =>
                    accessory.conditionLabel === deduction.conditionLabel
                )
            )
            .map((deduction) => `<li>${deduction.conditionLabel}</li>`)
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
            src="https://api.yusufqureshi.online/uploads/logo-image-1715942935175.png"
            alt=""
            style="width: 100px; height: 90px;"
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
                <th>Accessories</th>
                <td>
                
                  <ol>
                    ${
                      order.accessoriesAvailable &&
                      order.accessoriesAvailable.length > 0
                        ? order.accessoriesAvailable
                            .map(
                              (accessory) =>
                                `<li>${accessory.conditionLabel}</li>`
                            )
                            .join("")
                        : "<li>No accessories</li>"
                    }
                    
                  </ol>
                </td>
          
              </tr>
              <tr>
                <th>Selected Specification</th>
                <td>
                  <ol>
                    ${filteredDeductionsHTML}
                  </ol>
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

    // // Function to generate PDF from HTML
    // const generatePDF = async (html) => {
    //   const browser = await puppeteer.launch();
    //   const page = await browser.newPage();
    //   await page.setContent(html);
    //   const pdfBuffer = await page.pdf({ format: "A4" });
    //   await browser.close();
    //   return pdfBuffer;
    // };

    // Sample data
    // const data = {
    //   orderId: "17374",
    //   customerName: "Yusuf",
    //   schedulePickUp: "Tue May 14 2024, 12:00 PM - 02:00 PM",
    //   email: "digitaladda86@gmail.com",
    //   phone: "8722220088",
    //   addressDetails: {
    //     address: "asdfg, dhj, sff",
    //     state: "Haryana",
    //     city: "Chandigarh",
    //     pinCode: "123456",
    //   },
    //   category: "Mobile",
    //   product: {
    //     name: "iPhone 13 Pro",
    //   },
    //   variant: {
    //     variantName: "128GB",
    //   },
    //   accessoriesAvailable: [
    //     { conditionLabel: "Box with same IMEI" },
    //     { conditionLabel: "Bill with Same IMEI Number" },
    //     { conditionLabel: "Original Cable" },
    //   ],
    //   filteredDeductionsHTML: "<li>No problems detected</li>",
    //   offerPrice: "36525",
    //   gstNumber: "29CSJPA4571K1ZE",
    // };

    // Function to generate PDF
    // const generatePDF = (filePath, data) => {
    //   const doc = new PDFDocument({ margin: 50 });

    //   // Pipe the PDF content to a file
    //   doc.pipe(fs.createWriteStream(filePath));

    //   // Header
    //   // doc
    //   //   .image("uploads/logo.png", 50, 50, {
    //   //     width: 60,
    //   //     height: 50,
    //   //     align: "center",
    //   //   })
    //   //   .moveDown();
    //   doc
    //     .fontSize(16)
    //     .text("Sell Receipt", 180, 65, { align: "center" })
    //     .fontSize(14)
    //     .text(
    //       "Congratulations, your order has been placed with InstantHub",
    //       { align: "center" }
    //     )
    //     // .fontSize(12)
    //     // .text("InstantHub", {
    //     //   link: "https://instanthub.in",
    //     //   align: "center",
    //     // })
    //     .moveDown();

    //   // Order Details
    //   doc
    //     .fontSize(12)
    //     .text(`Order # ${data.orderId}`)
    //     .text(`Customer Name: ${data.customerName}`)
    //     .text(`PickUp Scheduled: ${data.schedulePickUp}`)
    //     .text(`Email: ${data.email}`, { columnGap: 10 })
    //     .text(`Ph #: ${data.phone}`)
    //     .text(
    //       `Billing Address: ${data.addressDetails.address}, ${data.addressDetails.state}, ${data.addressDetails.city}, ${data.addressDetails.pinCode}`
    //     )
    //     .moveDown();

    //   // Product Details
    //   doc
    //     .fontSize(14)
    //     .text("Product Details", { underline: true })
    //     .moveDown(0.5)
    //     .text(
    //       `${data.category} ${data.product.name} ${
    //         data.category === "Mobile" ? data.variant.variantName : ""
    //       }`
    //     )
    //     .moveDown();

    //   // Accessories
    //   doc.fontSize(14).text("Accessories", { underline: true }).moveDown(0.5);

    //   data.accessoriesAvailable.forEach((accessory) => {
    //     doc.fontSize(12).text(`- ${accessory.conditionLabel}`);
    //   });

    //   doc.moveDown();

    //   // Problems
    //   doc
    //     .fontSize(14)
    //     .text("Problems", { underline: true })
    //     .moveDown(0.5)
    //     .text(data.filteredDeductionsHTML, { columnGap: 10 })
    //     .moveDown();

    //   // Offered Price
    //   doc.fontSize(14).text(`Offered Price: ₹ ${data.offerPrice}`).moveDown();

    //   // Footer
    //   doc
    //     .fontSize(10)
    //     .text("Get in touch with us if you need any additional help:", {
    //       align: "center",
    //     })
    //     .text("8722288017", { align: "center", link: "tel:8722288017" })
    //     .text(
    //       "If you have any questions or concerns about your order, please send us a mail at",
    //       { align: "center" }
    //     )
    //     .text("support@instanthub.in", {
    //       align: "center",
    //       link: "mailto:support@instanthub.in",
    //     })
    //     .fontSize(8)
    //     .text(`GST Number: ${data.gstNumber}`, { align: "right" });

    //   // Finalize the PDF
    //   doc.end();
    // };

    // Path to save the PDF
    // const outputDirectory = path.join(path.resolve(), "pdfs");
    // if (!fs.existsSync(outputDirectory)) {
    //   fs.mkdirSync(outputDirectory);
    // }
    // const outputPath = path.join(outputDirectory, "order-summary.pdf");
    // generatePDF(outputPath, data);

    // OLD
    // Path to save the PDF
    // const outputPath = path.join(path.resolve(), "order-summary.pdf");
    // generatePDF(outputPath, data);

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: "instantcashpick@gmail.com", // Sender email address
      to: order.email, // Recipient email address
      subject: `Your Order #${orderId} has been placed ${order.customerName}`, // Subject line
      // text: "Hello, This is a test email from Nodemailer!", // Plain text body
      // You can also use HTML format

      html: emailBody,
      // attachments: [
      //   {
      //     filename: `${orderId}_summary.pdf`,
      //     content: pdfBuffer,
      //     contentType: "application/pdf",
      //   },
      // ],
      // attachments: [
      //   {
      //     filename: "order-summary.pdf",
      //     path: path.join(path.resolve(), "order-summary.pdf"),
      //   },
      // ],
      // attachments: [
      //   {
      //     filename: "order-summary.pdf",
      //     path: outputPath,
      //   },
      // ],
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

    // console.log(
    //   "orderId, customerProof, status",
    //   orderId,
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

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateObject, {
      new: true,
    });

    // const updatedOrder = await Order.findByIdAndUpdate(orderId, {
    //   customerProofFront,
    //   customerProofBack,
    //   status,
    // });
    updatedOrder.save();

    console.log("updatedOrder", updatedOrder);

    const stockIn = await Stocks.create({
      orderId: updatedOrder.orderId,
      productDetails: {
        productName: updatedOrder.productName,
        productVariant: updatedOrder.variant.variantName,
        productCategory: updatedOrder.category,
        serialNumber: updatedOrder.deviceInfo.serialNumber,
        imeiNumber: updatedOrder.deviceInfo.imeiNumber,
      },
      customerDetails: {
        customerName: updatedOrder.customerName,
        email: updatedOrder.email,
        phone: updatedOrder.phone,
      },
      accessoriesAvailable: updatedOrder.accessoriesAvailable?.map(
        (a) => a.conditionLabel
      ),
      pickedUpDetails: updatedOrder.pickedUpDetails,
      stockStatus: "Stock In",
      purchasePrice: updatedOrder.finalPrice,
    });

    stockIn.save();

    console.log("Stocks In", stockIn);

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
              src="https://api.yusufqureshi.online/uploads/logo-image-1715942935175.png"
              alt=""
              style="width: 100px; height: 90px"
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
            <a href="https://instanthub.in">instantpashpick.com</a>
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

    // // Function to generate PDF from HTML
    // const generatePDF = async (html) => {
    //   const browser = await puppeteer.launch();
    //   const page = await browser.newPage();
    //   await page.setContent(html);
    //   const pdfBuffer = await page.pdf({ format: "A4" });
    //   await browser.close();
    //   return pdfBuffer;
    // };

    // // Generate PDF
    // const pdfBuffer = await generatePDF(emailBody);

    // Function to create PDF
    const createPDF = (htmlContent, outputPath) => {
      const options = { format: "Letter" };

      pdf.create(htmlContent, options).toFile(outputPath, (err, res) => {
        if (err) return console.log(err);
        console.log(res); // { filename: '/path/to/file.pdf' }
      });
    };

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: "instantcashpick@gmail.com", // Sender email address
      to: updatedOrder.email, // Recipient email address
      cc: "instantcashpick@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Purchase Details for Order ${updatedOrder.orderId}`, // Subject line
      html: emailBody,
      // attachments: [
      //   {
      //     filename: `${updatedOrder.orderId}_summary.pdf`,
      //     content: pdfBuffer,
      //     contentType: "application/pdf",
      //   },
      // ],
    };

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.example.com", // SMTP server address
      port: 465, // SMTP port (usually 587 for TLS, 465 for SSL)
      secure: false, // true for 465, false for other ports
      auth: {
        // user: process.env.USER, // Your email address
        user: "instantcashpick@gmail.com", // Your email address
        pass: process.env.APP_PASSWORD, // Your email password
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

// DELETE Brand
export const deleteOrder = async (req, res) => {
  console.log("DeleteOrder controller");
  const orderId = req.params.orderId;
  console.log(orderId);

  try {
    // 1. Delete brand
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    console.log("deleteOrder", deletedOrder);

    // 2. Delete image from uploads/ of the deleted Brand
    deleteImage(deletedOrder.customerProofFront);
    deleteImage(deletedOrder.customerProofBack);

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

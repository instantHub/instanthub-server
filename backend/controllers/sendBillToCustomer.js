import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import { HOSTINGER_MAILER, ORDERS_EMAIL } from "../constants/email.js";
import {
  ORDER_EMAIL_TEMPLATE,
  ORDER_PDF,
  ORDER_RECEIVED_PDF,
  ORDER_RECEIVED_TEMPLATE,
} from "../utils/emailTemplates/orders.js";
import { createOrderPDF } from "../utils/pdf.creation.js";

export const sendInvoice = async (req, res) => {
  console.log("sendInvoice controller called");

  try {
    const order = {
      variant: {
        // variantName: "8/128 GB",
        variantName: "Price",
        price: 10000,
      },
      deviceInfo: {
        serialNumber: "PF3F71Q9",
        imeiNumber: "IMEI3F71Q9",
      },
      addressDetails: {
        address:
          "Ravi Homes. Room no - 06, Thirupalya Main road, Nearby Hebbgodi park or Gangamma Temple ",
        state: "Karnataka",
        city: "Bangalore",
        pinCode: 560099,
      },
      pickedUpDetails: {
        agentName: "Amir ahmed",
        pickedUpDate: "August 24, 2025, 4 PM - 7 PM",
        agentAssigned: true,
      },
      status: {
        pending: false,
        completed: true,
        cancelled: false,
      },
      orderId: "ORD250824AM72900930",
      productId: {
        // name: "Samsung Galaxy M12",
        name: "Lenovo IdeaPad 3",
        category: "6644defb8c9bd24b014982cf",
        id: "668ecae8f1bc1562eac199e0",
      },
      // productName: "Samsung Galaxy M12",
      // productBrand: "Samsung",
      // productCategory: "Mobile",
      productName: "Lenovo IdeaPad 3",
      productBrand: "Lenovo",
      productCategory: "Laptop",
      customerName: "Shouaib Ahmed",
      email: "shouaibahmed111@gmail.com",
      phone: "8722220088",
      deductions: [],
      schedulePickUp: "August 24, 2025, 10 AM - 12 PM",
      paymentMode: "Instant Cash",
      offerPrice: 10650,
      finalDeductionSet: [
        {
          type: "Processor",
          conditions: [
            {
              conditionLabel: "INTEL CORE i3 11th GEN",
              priceDrop: 10000,
              operation: "Add",
              type: "Processor",
            },
          ],
        },
        {
          type: "Ram",
          conditions: [
            {
              conditionLabel: "8 GB",
              priceDrop: 1250,
              operation: "Add",
              type: "Ram",
            },
          ],
        },
        {
          type: "Hard Disk",
          conditions: [
            {
              conditionLabel: "1 TB HDD",
              priceDrop: 1300,
              operation: "Add",
              type: "Hard Disk",
            },
          ],
        },
        {
          type: "Screen Size",
          conditions: [
            {
              conditionLabelId: "66fbfc71a09544971c3beb02",
              conditionLabel: "14-15 inch",
              priceDrop: 1,
              operation: "Subtrack",
              _id: "66fbfc71a09544971c3beb06",
              id: "66fbfc71a09544971c3beb06",
            },
          ],
        },
        {
          type: "Graphic",
          conditions: [
            {
              conditionLabelId: "66fbfc9ba09544971c3beb24",
              conditionLabel: "Is Graphics Card available",
              priceDrop: 8,
              operation: "Add",
              _id: "66fbfc9ba09544971c3beb28",
              id: "66fbfc9ba09544971c3beb28",
            },
          ],
        },
        {
          type: "Screen Condition",
          conditions: [
            {
              conditionLabelId: "67094b69a09544971c407f5c",
              conditionLabel:
                "FLAWLESS      ;    Screen Is Like New Condition  , No Lines , No Discoloration on Screen ",
              priceDrop: 1,
              operation: "Add",
              _id: "67094b69a09544971c407f60",
              id: "67094b69a09544971c407f60",
            },
          ],
        },
        {
          type: "Age",
          conditions: [
            {
              conditionLabelId: "66fbfd19a09544971c3beb9b",
              conditionLabel: "Between 1 and 3 years",
              priceDrop: 7,
              operation: "Subtrack",
              _id: "66fbfd19a09544971c3beb9f",
              id: "66fbfd19a09544971c3beb9f",
            },
          ],
        },
        {
          type: "Physical Condition",
          conditions: [
            {
              conditionLabelId: "66fbfd35a09544971c3bebce",
              conditionLabel:
                "Good / Normal signs of usage Minor scratches on the device No dents or cracks on the device",
              priceDrop: 5,
              operation: "Subtrack",
              _id: "66fbfd35a09544971c3bebd2",
              id: "66fbfd35a09544971c3bebd2",
            },
          ],
        },
        {
          type: "Bill",
          conditions: [
            {
              conditionLabelId: "67a6109832d828e8192e04c1",
              conditionLabel: "Bill Not Available",
              priceDrop: 8,
              operation: "Subtrack",
              _id: "67a6109832d828e8192e04c5",
              id: "67a6109832d828e8192e04c5",
            },
          ],
        },
        {
          type: "Box",
          conditions: [
            {
              conditionLabelId: "67a610a532d828e8192e04e3",
              conditionLabel: "Box Not Available",
              priceDrop: 6,
              operation: "Subtrack",
              _id: "67a610a532d828e8192e04e7",
              id: "67a610a532d828e8192e04e7",
            },
          ],
        },
        {
          type: "Charger",
          conditions: [
            {
              conditionLabelId: "67a610ad32d828e8192e04f4",
              conditionLabel: "Charger Available",
              priceDrop: 1,
              operation: "Subtrack",
              _id: "67a610ad32d828e8192e04f8",
              id: "67a610ad32d828e8192e04f8",
            },
          ],
        },
      ],
      cancelReason: null,
      createdAt: "2025-08-24T01:14:52.742Z",
      updatedAt: "2025-08-24T17:43:34.259Z",
      customerOptional1:
        "/uploads/customer-proof/1000148056-image-1756057413660.jpg",
      customerOptional2:
        "/uploads/customer-proof/1000148078-image-1756057414029.jpg",
      customerProofBack:
        "/uploads/customer-proof/1000148064-image-1756057413415.jpg",
      customerProofFront:
        "/uploads/customer-proof/1000148061-image-1756057413170.jpg",
      finalPrice: 7500,
      id: "68aa678cf4d15512d7d20e83",
    };

    // ORDER_RECEIVED_PDF
    // const html = ORDER_RECEIVED_PDF(order);

    // ORDER_PDF
    const html = ORDER_PDF(order);

    const pdfBuffer = await createOrderPDF(html);
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    await transporter.sendMail({
      from: ORDERS_EMAIL,
      // to: "instanthub.in@gmail.com",
      to: "yousuf337692qureshi@gmail.com",
      subject: `Your Invoice for Order #${order.orderId}`,

      // ORDER_RECEIVED_PDF
      // html: ORDER_RECEIVED_TEMPLATE(order),

      // ORDER_PDF
      html: ORDER_EMAIL_TEMPLATE(order),
      attachments: [
        {
          filename: `invoice-${order.orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    res.json({ message: "Invoice sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

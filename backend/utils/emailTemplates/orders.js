const ORDER_PDF = (order) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Summary - PDF</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #fff;
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 25px;
      }

      .logo {
        width: 120px;
        height: auto;
        margin: 0 auto 10px;
        display: block;
      }

      .title {
        text-align: center;
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .subtitle {
        text-align: center;
        font-size: 14px;
        color: #555;
        margin-bottom: 20px;
      }

      h2 {
        color: #333;
        margin: 15px 0;
        font-size: 16px;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 14px;
      }

      th,
      td {
        border: 1px solid #ddd;
        padding: 10px;
        vertical-align: top;
      }

      th {
        background-color: #7a84b0;
        color: #fff;
        text-align: center;
      }

      .note {
        font-size: 12px;
        color: #777;
        margin: 5px 0;
      }

      .footer {
        text-align: center;
        margin-top: 30px;
        color: #555;
      }

      .footer p {
        margin: 4px 0;
      }

      .total {
        text-align: right;
        font-weight: bold;
      }

      .deduction-group {
        margin: 3px 0;
      }

      .deduction-title {
        font-weight: bold;
        font-size: 13px;
        margin: 0;
      }

      .deduction-list {
        margin-left: 8px;
        font-size: 12px;
      }

      .deduction-item {
        display: inline-block;
        margin-right: 8px;
        font-size: 11px;
      }

      .md-text {
        font-size: 13px;
      }

      .rights {
        text-align: center;
        font-size: 11px;
        color: #aaa;
      }

      @media only screen and (max-width: 600px) {
        .container {
          padding: 15px;
        }
        table {
          font-size: 12px;
        }
        .title {
          font-size: 18px;
        }
        .logo {
          width: 90px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">Sell Receipt</div>
      <div class="subtitle">
        Congratulations, your order has been placed with InstantHub
      </div>

      <div class="md-text">
        <p><strong>Order #:</strong> ${order.orderId}</p>
        <p>
          <strong>Website:</strong>
          <a href="https://instanthub.in">instanthub.in</a>
        </p>
      </div>

      <table>
        <tr>
          <th>Seller Details</th>
          <th>Pickup Details</th>
        </tr>
        <tr class="md-text">
          <td>
            ${order.customerDetails.name}<br />
            <strong>Email:</strong> ${order.customerDetails.email}<br />
            <strong>Phone:</strong> ${order.customerDetails.phone}<br />
            <strong>Address:</strong> ${
              order.customerDetails.addressDetails.address
            },
            ${order.customerDetails.addressDetails.state}, ${
    order.customerDetails.addressDetails.city
  }<br />
            <strong>Pincode:</strong> ${
              order.customerDetails.addressDetails.pinCode
            }
          </td>
          <td><strong>Scheduled:</strong> ${order.schedulePickUp}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th>Product Details</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
        </tr>
        <tr>
          <td>
            <p class="md-text">
              <strong>${order.productDetails.productCategory}</strong> - ${
    order.productDetails.productName
  }
              ${
                order.productDetails.productCategory
                  .toLowerCase()
                  .includes("mobile")
                  ? ` (
              ${order.productDetails.variant.variantName} ) `
                  : ""
              }
            </p>

            <div>${filteredDeductionsHTML(order)}</div>
            <p class="md-text">
              <strong>Payment Mode:</strong> ${order.paymentMode}
            </p>
          </td>
          <td>${order.offerPrice}</td>
          <td>1</td>
          <td>${order.offerPrice}</td>
        </tr>
      </table>

      <p class="note">
        *This is a computer generated receipt. Signature not required.
      </p>
      <p class="note">
        Get in touch with us if you need any additional help:
        <a href="tel:8722288017">8722288017</a>
      </p>
      <p class="note">
        If you have any questions or concerns about your order, please email us
        at
        <a href="mailto:support@instanthub.in">support@instanthub.in</a>
      </p>

      <div class="footer">
        <p>Thanks & Regards</p>
        <p><strong>Instant Hub</strong></p>
      </div>

      <p class="rights">&copy; 2025 InstantHub. All rights reserved.</p>
    </div>
  </body>
</html>
`;
};

const ORDER_EMAIL_TEMPLATE = (order) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Summary - Email</title>
    <style>
      .title {
        font-size: 24px;
      }

      .congrats {
        font-size: 15px;
      }

      h2 {
        color: #333;
        margin-bottom: 20px;
      }

      .customer-detail p {
        font-size: small;
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

      .md-text {
        font-size: 13px;
      }

      .order-detail h1 {
        font-size: small;
      }

      .note {
        font-size: 13px;
        color: #777;
        margin: 5px 0;
      }

      .footer {
        text-align: center;
        margin-top: 30px;
        color: #555;
      }

      .footer p {
        margin: 4px 0;
      }

      .rights {
        text-align: center;
        font-size: 11px;
        color: #aaa;
      }

      /* Mobile Styles */
      @media only screen and (max-width: 600px) {
        .title {
          font-size: 15px;
        }
        .congrats {
          font-size: 12px;
        }
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

        img {
          width: 70px;
          height: 60px;
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
      <div style="text-align: center">
        <img
          src="https://api.instanthub.in/uploads/instanthub-logo.png"
          alt=""
          style="width: 100px; height: 90px"
        />
      </div>

      <h1 class="title" style="text-align: center">Sell Receipt</h1>
      <h2 class="congrats" style="text-align: center">
        Congradulations your order has been placed with InstantHub
      </h2>
      <h1 style="font-size: small">
        <a href="https://instanthub.in">InstantHub</a>
      </h1>

      <div class="customer-detail">
        <div>
          <p>Order #${order.orderId}</p>
          <p>Customer Name: ${order.customerDetails.name}</p>
        </div>

        <div>
          <p>Email: ${order.customerDetails.email}</p>
          <p>Ph # ${order.customerDetails.phone}</p>
        </div>

        <div>
          <p>
            <span>Seller Address: </span>
            <span>
              ${order.customerDetails.addressDetails.address}
              ${order.customerDetails.addressDetails.state}
              ${order.customerDetails.addressDetails.city}
              ${order.customerDetails.addressDetails.pinCode}
            </span>
          </p>
        </div>

        <div>
          <p>PickUp Scheduled ${order.schedulePickUp}</p>
        </div>
      </div>

      <table
        class="md-text"
        style="width: 100%; border-collapse: collapse; margin: 20px 0"
      >
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px">
            <b>Product Details</b>
          </td>
          <td style="border: 1px solid #ddd; padding: 8px">
            ${order.productDetails.productName}
            ${
              order.productDetails.productCategory
                .toLowerCase()
                .includes("mobile")
                ? `- ${order.productDetails.variant.variantName}`
                : ""
            }
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #ddd; padding: 8px">
            <b>Problems</b>
          </td>
          <td style="border: 1px solid #ddd; padding: 8px">
            ${filteredDeductionsHTML(order)}
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #ddd; padding: 8px">
            <b>Offered Price</b>
          </td>
          <td style="border: 1px solid #ddd; padding: 8px">
            ${order.offerPrice}
          </td>
        </tr>
      </table>

      <p class="note">Thank you for selling your product and trusting us.</p>
      <p class="note">
        Your information is protected and secured, and it will be erased.
      </p>
      <p class="note">
        Visit us again
        <a href="https://instanthub.in">instanthub.in</a>
      </p>

      <div class="footer">
        <p>Thanks & Regards</p>
        <p><strong>Instant Hub</strong></p>
      </div>

      <p class="rights">&copy; 2025 InstantHub. All rights reserved.</p>
    </div>
  </body>
</html>
`;
};

const filteredDeductionsHTML = (order) => {
  if (!order?.finalDeductionSet || order?.finalDeductionSet.length === 0) {
    return "<p class='deduction-data note'>Specifications not selected</p>";
  }

  return order.finalDeductionSet
    .filter((deduction) => {
      // Skip "bill" and "box" only for Laptop category
      if (order.productDetails.productCategory?.toLowerCase() === "laptop") {
        return (
          !deduction.type.toLowerCase().includes("bill") &&
          !deduction.type.toLowerCase().includes("box")
        );
      }
      return true; // keep all for other categories
    })
    .map(
      ({ type, conditions }) => `
        <div class="deduction-group">
          <h5 class="deduction-title">${type}:</h5>
          <div class="deduction-list">
            ${
              conditions
                ?.map(
                  (condition) =>
                    `<span class="deduction-item">${condition.conditionLabel}</span>`
                )
                .join("") || ""
            }
          </div>
        </div>
      `
    )
    .join("");
};

const ORDER_RECEIVED_PDF = (order) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Purchase Summary - PDF</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #fff;
        box-sizing: border-box;
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 25px;
      }

      .logo {
        width: 120px;
        height: auto;
        margin: 0 auto 10px;
        display: block;
      }

      .title {
        text-align: center;
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .subtitle {
        text-align: center;
        font-size: 14px;
        color: #555;
        margin-bottom: 20px;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      .purchase-block {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
      }

      .purchase-block-details {
        font-size: 13px;
        margin-top: 5px;
      }

      .block {
        display: flex;
        flex-direction: column;
      }

      .block-header {
        display: flex;
        justify-content: space-around;
      }

      .block-title {
        width: 100%;
        font-size: 16px;
        font-weight: bold;
        background-color: #7a84b0;
        color: white;
        /* padding: 10px; */
        text-align: center;
      }

      .inner-block {
        width: 100%;
        display: flex;
        border: 1px solid #ddd;
      }

      .block-items {
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      .border-right {
        border-right: 1px solid #ddd;
      }

      .border-bottom {
        border-bottom: 1px solid #ddd;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 14px;
      }

      th,
      td {
        border: 1px solid #ddd;
        padding: 10px;
        vertical-align: top;
      }

      th {
        text-align: center;
        padding: 16px;
      }

      .padding-left {
        padding-left: 10px;
      }

      .note {
        font-size: 12px;
        color: #777;
        margin: 5px 0;
      }

      .footer {
        text-align: center;
        margin-top: 30px;
        color: #555;
      }

      .footer p {
        margin: 4px 0;
      }

      .total {
        text-align: right;
        font-weight: bold;
      }

      .deduction-group {
        margin: 3px 0;
      }

      .deduction-title {
        font-weight: bold;
        font-size: 13px;
        margin: 0;
      }

      .deduction-list {
        margin-left: 8px;
        font-size: 12px;
      }

      .deduction-item {
        display: inline-block;
        margin-right: 8px;
        font-size: 11px;
      }

      .md-text {
        font-size: 13px;
      }

      .rights {
        text-align: center;
        font-size: 11px;
        color: #aaa;
      }

      @media only screen and (max-width: 600px) {
        .container {
          padding: 15px;
        }
        table {
          font-size: 12px !important;
        }
        .title {
          font-size: 18px;
        }
        .logo {
          width: 90px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">Instant Hub</div>

      <div class="subtitle">
        Thank you, your order has been completed with InstantHub.
      </div>

      <div class="purchase-block">
        <div class="block-title capitalize">
          <p>Purchase Receipt</p>
        </div>
        <div class="purchase-block-details md-text">
          <p><strong>Date:</strong> ${order.schedulePickUp}</p>
          <p>${order.orderId}</p>
          <p>${order.customerDetails.name}</p>
          <p>
            ${order.customerDetails.addressDetails.address}, ${
    order.customerDetails.addressDetails.state
  },
            ${order.customerDetails.addressDetails.city}, ${
    order.customerDetails.addressDetails.pinCode
  }
          </p>
        </div>
      </div>

      <div class="block md-text">
        <div class="block-header block-title">
          <p>Product Details</p>
        </div>
        <div class="inner-block md-text">
          <div class="block-items border-right">
            <div class="border-bottom padding-left">
              <p>Product Name</p>
            </div>
            <div class="border-bottom padding-left">
              <p>Product Variant</p>
            </div>
            <div class="padding-left">
              <p>Product ${
                order.productDetails.productCategory
                  .toLowerCase()
                  .includes("mobile")
                  ? "IMEI Number"
                  : "Serial Number"
              } </p>
            </div>
          </div>

          <div class="block-items">
            <div class="border-bottom padding-left">
              <p>${order.productDetails.productName}</p>
            </div>
            <div class="border-bottom padding-left">
              <p>${
                order.productDetails.productCategory
                  .toLowerCase()
                  .includes("mobile")
                  ? order.productDetails.variant.variantName
                  : "-"
              }</p>
            </div>
            <div class="padding-left">
              <p>
                ${
                  order.productDetails.productCategory
                    .toLowerCase()
                    .includes("mobile")
                    ? order.deviceInfo?.imeiNumber
                      ? order.deviceInfo?.imeiNumber
                      : "-"
                    : order.deviceInfo?.serialNumber
                    ? order.deviceInfo?.serialNumber
                    : "-"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <table class="md-text">
        <tr class="block-title">
          <th>Item</th>
          <th>Price</th>
        </tr>
        <tr>
          <td>
            <strong>${order.productDetails.productCategory}</strong> - ${
    order.productDetails.productName
  } ${
    order.productDetails.productCategory.toLowerCase().includes("mobile")
      ? ` (
            ${order.productDetails.variant.variantName} ) `
      : ""
  }
          </td>
          <td>${order.offerPrice}</td>
        </tr>
        <tr>
          <td>Payment Mode</td>
          <td>${order.paymentMode}</td>
        </tr>
        <tr>
          <td>Final Price</td>
          <td>${order.finalPrice}</td>
        </tr>
      </table>

      <p class="note">
        *This is a computer generated receipt. Signature not required.
      </p>
      <p class="note">
        Get in touch with us if you need any additional help:
        <a href="tel:8722288017">8722288017</a>
      </p>
      <p class="note">
        If you have any questions or concerns about your order, please email us
        at
        <a href="mailto:support@instanthub.in">support@instanthub.in</a>
      </p>

      <div class="footer">
        <p>Thanks & Regards</p>
        <p><strong>Instant Hub</strong></p>
      </div>

      <p class="rights">&copy; 2025 InstantHub. All rights reserved.</p>
    </div>
  </body>
</html>
`;
};

const ORDER_RECEIVED_TEMPLATE = (order) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Purchase Summary - Email</title>

    <style>
      h2 {
        color: #333;
        margin-bottom: 20px;
      }
      th,
      td {
        border: 1px solid #ddd;
        padding: 10px;
      }
      th {
        text-align: left;
        background-color: #f2f2f2;
      }

      .customer-detail p {
        font-size: small;
      }

      .note {
        font-size: 13px;
        color: #777;
        margin: 5px 0;
      }

      .footer {
        text-align: center;
        margin-top: 30px;
        color: #555;
      }

      .footer p {
        margin: 4px 0;
      }

      .rights {
        text-align: center;
        font-size: 11px;
        color: #aaa;
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
      <div class="sell" style="text-align: center">
        <img
          src="https://api.instanthub.in/uploads/instanthub-logo.png"
          alt=""
          style="width: 100px; height: 90px"
        />
      </div>
      <h1 class="sell" style="text-align: center">Purchased Receipt</h1>

      <div class="customer-detail">
        <div>
          <p>Order #${order.orderId}</p>
          <p>Customer Name: ${order.customerDetails.name}</p>
        </div>

        <div>
          <p>Email: ${order.customerDetails.email}</p>
          <p>Ph # ${order.customerDetails.phone}</p>
        </div>

        <div>
          <p>
            <span>Seller Address: </span>
            <span>
              ${order.customerDetails.addressDetails.address}
              ${order.customerDetails.addressDetails.state}
              ${order.customerDetails.addressDetails.city}
              ${order.customerDetails.addressDetails.pinCode}
            </span>
          </p>
        </div>
      </div>

      <table
        style="
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: small;
        "
      >
        <tr>
          <td><b>Product</b></td>
          <td>${order.productDetails.productName}</td>
        </tr>
        <tr>
          <td>
            <b>Agent Name</b>
          </td>
          <td>${order.assignmentStatus.assignedTo.name}</td>
        </tr>
        <tr>
          <td>
            <b>Pick Up Time</b>
          </td>
          <td>${order.completedAt}</td>
        </tr>
        <tr>
          <td><b>Quantity</b></td>
          <td>1</td>
        </tr>
        <tr>
          <td>
            <b>Final Price</b>
          </td>
          <td>${order.finalPrice}</td>
        </tr>
      </table>

      <p class="note">Thank you for selling your product and trusting us.</p>
      <p class="note">
        Your information is protected and secured, and it will be erased.
      </p>
      <p class="note">
        Visit us again
        <a href="https://instanthub.in">instanthub.in</a>
      </p>

      <div class="footer">
        <p>Thanks & Regards</p>
        <p><strong>Instant Hub</strong></p>
      </div>

      <p class="rights">&copy; 2025 InstantHub. All rights reserved.</p>
    </div>
  </body>
</html>
`;
};

const ORDER_CANCEL_TEMPLATE = (cancelReason) => {
  return `Dear Customer,
      
      Thank you for choosing Instant Hub to sell your product. We truly appreciate your interest in our services.
      
      Sorry to inform you that we had to cancel your order.
      Cancellation Reason: ${cancelReason}
      
      We sincerely apologize for any inconvenience this may cause. Please let us know if there is anything else we can assist you with, or feel free to reach out to us if you have any future requirements within Bangalore.
      Thank you for your understanding and support.
      
      Best regards,  
      InstantHub Team  
      support@instanthub.in  
      8722288017  
      https://www.instanthub.in/`;
};

const ORDER_ASSIGN_AGENT_TEMPLATE = (updateOrder) => {
  return `Dear ${updateOrder.customerDetails.name},
  
      We are pleased to inform you that an agent has been assigned to pick up your order. Below are the details:
  
          Order ID: ${updateOrder.orderId}
          Assigned Agent: ${updateOrder.assignmentStatus.assignedTo.name}
          Assigned At: ${updateOrder.assignmentStatus.assignedAt}
  
      Please ensure the item is ready for pickup at the scheduled time. If you have any questions or need to reschedule, feel free to contact us.
  
      Thank you for choosing Instant Hub.
  
      Best regards,
      InstantHub Team
      support@instanthub.in
      8722288017
      https://www.instanthub.in/`;
};

export {
  ORDER_PDF,
  ORDER_EMAIL_TEMPLATE,
  ORDER_RECEIVED_PDF,
  ORDER_RECEIVED_TEMPLATE,
  ORDER_CANCEL_TEMPLATE,
  ORDER_ASSIGN_AGENT_TEMPLATE,
};

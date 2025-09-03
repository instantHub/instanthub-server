const ORDER_PDF = (orderId, order) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Summary</title>
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
        background-color: #f2f2f2;
        text-align: left;
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
      <img
        src="https://api.instantpick.in/uploads/instanthub-logo.png"
        alt="Instant Hub"
        class="logo"
      />

      <div class="title">Sell Receipt</div>
      <div class="subtitle">
        Congratulations, your order has been placed with InstantHub
      </div>

      <div class="md-text">
        <p><strong>Order #:</strong> ${orderId}</p>
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
            ${order.customerName}<br />
            <strong>Email:</strong> ${order.email}<br />
            <strong>Phone:</strong> ${order.phone}<br />
            <strong>Address:</strong> ${order.addressDetails.address},
            ${order.addressDetails.state}, ${order.addressDetails.city}<br />
            <strong>Pincode:</strong> ${order.addressDetails.pinCode}
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
              <strong>${order.productCategory}</strong> - ${order.productName}
              ${
                order.productCategory.toLowerCase().includes("mobile")
                  ? ` (
              ${order.variant.variantName} ) `
                  : ""
              }
            </p>

            <div>${filteredDeductionsHTML(order)}</div>
            <p class="md-text"><strong>Payment Mode:</strong> ${
              order.paymentMode
            }</p>
          </td>
          <td>₹ ${order.offerPrice}</td>
          <td>1</td>
          <td>₹ ${order.offerPrice}</td>
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
  return `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="text-align:center; color:#2c3e50;">Thank You for Your Order!</h2>
      <p>Dear <b>${order.customerName}</b>,</p>
      <p>We’re pleased to confirm that we’ve received your order <b>#${order.orderId}</b>.</p>
      <p>You can find your detailed invoice attached as a PDF. Below is a quick summary of your order:</p>
      
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><b>Product</b></td>
          <td style="border:1px solid #ddd; padding:8px;">${order.productName}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><b>Quantity</b></td>
          <td style="border:1px solid #ddd; padding:8px;">1</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><b>Offered Price</b></td>
          <td style="border:1px solid #ddd; padding:8px;">₹ ${order.offerPrice}</td>
        </tr>
      </table>
      
      <p><b>Pickup Scheduled:</b> ${order.schedulePickUp}</p>
      <p>For any questions, feel free to reply to this email or call us at 
         <a href="tel:+918722288017">+91 87222 88017</a>.
      </p>
      <p style="margin-top:30px;">Best Regards, <br/> <b>InstantHub Team</b></p>
      <hr/>
      <p style="font-size:12px; color:#777; text-align:center;">
        This is an automated email. Please do not reply directly.  
        Visit <a href="https://instanthub.in" style="color:#007bff;">InstantHub.in</a> for more details.
      </p>
    </div>`;
};

const filteredDeductionsHTML = (order) => {
  if (!order?.finalDeductionSet || order?.finalDeductionSet.length === 0) {
    return "<p class='deduction-data note'>Specifications not selected</p>";
  }

  return order.finalDeductionSet
    .filter((deduction) => {
      // Skip "bill" and "box" only for Laptop category
      if (order.productCategory?.toLowerCase() === "laptop") {
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

const ORDER_RECEIVED_PDF = (updatedOrder) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Purchase Receipt</title>

    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #fff;
        color: #333;
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 25px;
      }

      .logo {
        width: 120px;
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

      .section {
        font-size: 13px;
        margin-bottom: 15px;
      }

      .section h4 {
        margin: 5px 0;
        font-size: 13px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 13px;
      }

      th,
      td {
        border: 1px solid #ddd;
        padding: 10px;
        vertical-align: top;
      }

      th {
        background-color: #f2f2f2;
        text-align: left;
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

      .rights {
        text-align: center;
        font-size: 11px;
        color: #aaa;
        margin-top: 15px;
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
      <!-- Logo -->
      <img
        src="https://api.instantpick.in/uploads/instanthub-logo.png"
        alt="Instant Hub"
        class="logo"
      />

      <!-- Titles -->
      <div class="title">Purchase Receipt</div>
      <div class="subtitle">
        Thank you for selling your product and trusting InstantHub.
      </div>

      <!-- Order Info -->
      <div class="section">
        <p><strong>Order #:</strong> ${updatedOrder.orderId}</p>
        <p>
          <strong>Website:</strong>
          <a href="https://instanthub.in">instanthub.in</a>
        </p>
      </div>

      <!-- Customer & Seller Info -->
      <div class="section">
        <h4><strong>Customer Name:</strong> ${updatedOrder.customerName}</h4>
        <h4><strong>Email:</strong> ${updatedOrder.email}</h4>
        <h4><strong>Phone:</strong> ${updatedOrder.phone}</h4>
        <h4>
          <strong>Address:</strong>
          ${updatedOrder.addressDetails.address},
          ${updatedOrder.addressDetails.city},
          ${updatedOrder.addressDetails.state} -
          ${updatedOrder.addressDetails.pinCode}
        </h4>
      </div>

      <div class="section">
        <h4>
          <strong>Pickup Agent:</strong> ${
            updatedOrder.pickedUpDetails.agentName
          }
        </h4>
        <h4>
          <strong>Pickup Time:</strong> ${
            updatedOrder.pickedUpDetails.pickedUpDate
          }
        </h4>
      </div>

      <!-- Product Table -->
      <table>
        <tr>
          <th>Product Details</th>
          <th>Price</th>
        </tr>
        <tr>
          <td>
            <p>
              <strong>${updatedOrder.productCategory}</strong> - ${
    updatedOrder.productName
  }
            </p>
            ${
              updatedOrder.productCategory.toLowerCase().includes("mobile")
                ? `
            <p>${updatedOrder.variant.variantName}</p>
            `
                : ""
            } ${
    updatedOrder.deviceInfo?.serialNumber
      ? `
            <p>
              <strong>Serial No:</strong>
              ${updatedOrder.deviceInfo.serialNumber}
            </p>
            `
      : ""
  } ${
    updatedOrder.deviceInfo?.imeiNumber
      ? `
            <p>
              <strong>IMEI No:</strong> ${updatedOrder.deviceInfo.imeiNumber}
            </p>
            `
      : ""
  }
            <div>${filteredDeductionsHTML(updatedOrder)}</div>
          </td>

          <td>₹ ${updatedOrder.finalPrice}</td>
        </tr>
      </table>

      <!-- Notes -->
      <p class="note">
        *This is a computer generated receipt. Signature not required.
      </p>
      <p class="note">
        Get in touch with us if you need any additional help:
        <a href="tel:8722288017">8722288017</a>
      </p>
      <p class="note">
        Your information is protected and secured, and it will be erased after
        use.
      </p>
      <p class="note">
        Visit us again at
        <a href="https://instanthub.in">instanthub.in</a>
      </p>

      <!-- Footer -->
      <div class="footer">
        <p>Thanks & Regards</p>
        <p><strong>InstantHub</strong></p>
      </div>

      <p class="rights">&copy; 2025 InstantHub. All rights reserved.</p>
    </div>
  </body>
</html>
`;
};

const ORDER_RECEIVED_TEMPLATE = (order) => {
  return `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="text-align:center; color:#2c3e50;">Thank you for selling your product and trusting InstantHub!</h2>
      <p>Dear <b>${order.customerName}</p>
      <p>We’re pleased to confirm that your order #${order.orderId} has been succesfully completed.</p>
      <p>You can find your detailed invoice attached as a PDF. Below is a quick summary of your order:</p>
      
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><b>Product</b></td>
          <td style="border:1px solid #ddd; padding:8px;">${order.productName}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><b>Quantity</b></td>
          <td style="border:1px solid #ddd; padding:8px;">1</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><b>Final Price</b></td>
          <td style="border:1px solid #ddd; padding:8px;">₹ ${order.finalPrice}</td>
        </tr>
      </table>
      
      <p><b>Pickup:</b> Completed</p>
      <p>For any questions, feel free to reply to this email or call us at 
         <a href="tel:+918722288017">+91 87222 88017</a>.
      </p>
      <p style="margin-top:30px;">Best Regards, <br/> <b>InstantHub Team</b></p>
      <hr/>
      <p style="font-size:12px; color:#777; text-align:center;">
        This is an automated email. Please do not reply directly.  
        Visit <a href="https://instanthub.in" style="color:#007bff;">InstantHub.in</a> for more details.
      </p>
    </div>`;
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
  return `Dear ${updateOrder.customerName},
  
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

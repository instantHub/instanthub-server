const RECYCLE_ORDER_TEMPLATE = (recycleOrderId, order) => {
  return `<!DOCTYPE html>
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
};

const RECYCLE_ORDER_RECEIVED_TEMPLTE = (updatedOrder) => {
  return `<!DOCTYPE html>
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
              src="https://api.instantpick.in/uploads/instanthub-logo.png"
              alt="Instant Hub"
              class="logo"
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
};

const RECYCLE_ORDER_CANCEL_TEMPLATE = (cancelReason) => {
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

export {
  RECYCLE_ORDER_TEMPLATE,
  RECYCLE_ORDER_RECEIVED_TEMPLTE,
  RECYCLE_ORDER_CANCEL_TEMPLATE,
};

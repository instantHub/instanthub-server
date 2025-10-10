/**
 * Generates an HTML email template for a new executive account.
 * @param {object} executive - An object containing executive details. Should have a `name` and `email` property.
 * @param {string} password - The generated temporary password.
 * @returns {string} - The complete HTML for the email.
 */
export const ACCOUNT_CREATION = (executive, password) => {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Instant Hub</title>
      <style>
        /* Basic styles for email clients that support them */
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f7f6;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #cccccc;">
              
              <tr>
                <td align="center" style="padding: 40px 0 30px 0; color: #000;">
                  <img src="https://api.instanthub.in/uploads/instanthub-logo.png" alt="Instant Hub Logo" width="150" style="display: block;"/>
                  <h1 style="margin: 20px 0 0 0; font-size: 24px; font-weight: bold;">Welcome Aboard!</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="font-size: 20px; color: #333333; margin: 0 0 20px 0;">Hello ${executive.name},</h2>
                  <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5; color: #555555;">
                    We are thrilled to have you at Instant Hub. Your executive account for our executive platform has been created.
                  </p>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 20px;">
                    <tr>
                      <td style="font-size: 16px; color: #333333;">
                        <p style="margin: 0 0 10px 0;"><strong>Username:</strong> ${executive.email}</p>
                        <p style="margin: 0;"><strong>Password:</strong>
                          <span style="font-family: 'Courier New', Courier, monospace; background-color: #e0e0e0; padding: 3px 6px; border-radius: 4px; font-size: 16px; color: #D83F31;">
                            ${password}
                          </span>
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 25px 0 25px 0; font-size: 16px; line-height: 1.5; color: #555555;">
                    For your security, you will be required to change this password upon your first login.
                  </p>

                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="https://www.instanthub.in/dashboard-login" style="display: inline-block; padding: 15px 30px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #004AAD; text-decoration: none; border-radius: 5px;">
                          Log In & Get Started
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 30px; background-color: #f4f7f6; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #888888;">
                    If you have any questions, please contact IT Support at <a href="mailto:support@instanthub.com" style="color: #004AAD; text-decoration: none;">support@instanthub.com</a>.
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #aaaaaa;">
                    &copy; ${currentYear} Instant Hub. All Rights Reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Generates an HTML email template for an order assignment notification.
 * @param {object} updateOrder - The order object with customer and assignment details.
 * @returns {string} - The complete HTML for the email.
 */
export const ORDER_ASSIGN_AGENT_TEMPLATE = (updateOrder, executive) => {
  // Format the date for better readability. You can customize this further.
  const assignedAtFormatted = new Date(
    updateOrder.assignmentStatus.assignedAt
  ).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const agentName = executive.name;
  const agentNumber = executive.phone;
  const agentRole = updateOrder.assignmentStatus.assignedTo.role;
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agent Assigned to Your Order</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #cccccc;">
              
              <tr>
                <td align="center" style="padding: 40px 0 30px 0; color: #000;">
                  <img src="https://api.instanthub.in/uploads/instanthub-logo.png" alt="Instant Hub Logo" width="150" style="display: block;"/>
                  <h1 style="margin: 20px 0 0 0; font-size: 24px; font-weight: bold;">An Agent is on the Way</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="font-size: 20px; color: #333333; margin: 0 0 20px 0;">Hello ${updateOrder.customerDetails.name},</h2>
                  <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5; color: #555555;">
                    We are pleased to inform you that an agent has been assigned to pick up your order. Please see the details below.
                  </p>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 20px;">
                    <tr>
                      <td style="font-size: 16px; color: #333333; line-height: 1.6;">
                        <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> ${updateOrder.orderId}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Assigned ${agentRole}:</strong> ${agentName}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Contact Number:</strong> ${agentNumber}</p>
                        <p style="margin: 0;"><strong>Assigned At:</strong> ${assignedAtFormatted}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 25px 0 25px 0; font-size: 16px; line-height: 1.5; color: #555555;">
                    Please ensure the item is ready for pickup. If you have any questions, feel free to contact us.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 30px; background-color: #f4f7f6; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #888888;">
                    Thank you for choosing Instant Hub.<br>
                    <a href="mailto:support@instanthub.in" style="color: #004AAD; text-decoration: none;">support@instanthub.in</a>
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #aaaaaa;">
                    &copy; ${currentYear} Instant Hub. All Rights Reserved. <br>
                    https://www.instanthub.in/
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

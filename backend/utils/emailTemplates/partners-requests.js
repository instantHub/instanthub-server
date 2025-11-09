/**
 * Generates an HTML email template for a new executive account.
 * @param {object} partner_request - An object containing executive details. Should have a `name` and `email` property.
 * @returns {string} - The complete HTML for the email.
 */
export const PARTNER_REQUEST = (partner_request) => {
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
                  <h1 style="margin: 20px 0 0 0; font-size: 24px; font-weight: bold;">Thank you for the request!</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="font-size: 20px; color: #333333; margin: 0 0 20px 0;">Hello ${partner_request.name},</h2>
                  <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5; color: #555555;">
                    We are thrilled to have you at Instant Hub. Your request to become our partner has been received. We will get back to you shortly.
                  </p>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 20px;">
                    <tr>
                      <td style="font-size: 16px; color: #333333;">
                        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${partner_request.email}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${partner_request.phone}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Location:</strong> ${partner_request.address.city}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Request Status:</strong> ${partner_request.status}</p>
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

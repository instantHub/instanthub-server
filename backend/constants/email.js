import dotenv from "dotenv";
dotenv.config();

const HOSTINGER_HOST = "smtp.hostinger.com"; // Replace with your SMTP server
const HOSTINGER_PORT = 465; // Use 587 for TLS or 465 for SSL
const HOSTINGER_SECURE = true;

const INSTANTHUB_GMAIL = "instanthub.in@gmail.com";
const SUPPORT_EMAIL = "support@instanthub.in";
const ORDERS_EMAIL = "orders@instanthub.in";
const SERVICE_ORDER_EMAIL = "service-orders@instanthub.in";
const RECYCLE_ORDER_EMAIL = "recycle-orders@instanthub.in";

const HOSTINGER_EMAIL_AUTH = {
  user: SUPPORT_EMAIL, // Your domain email
  pass: process.env.SUPPORT_PASSWORD, // Your domain email password
};

const HOSTINGER_MAILER = {
  host: HOSTINGER_HOST, // Replace with your SMTP server
  port: HOSTINGER_PORT, // Use 587 for TLS or 465 for SSL
  secure: HOSTINGER_SECURE, // true for port 465, false for 587
  auth: HOSTINGER_EMAIL_AUTH,
};

export {
  HOSTINGER_HOST,
  HOSTINGER_PORT,
  HOSTINGER_SECURE,
  SUPPORT_EMAIL,
  INSTANTHUB_GMAIL,
  ORDERS_EMAIL,
  SERVICE_ORDER_EMAIL,
  RECYCLE_ORDER_EMAIL,
  HOSTINGER_EMAIL_AUTH,
  HOSTINGER_MAILER,
};

// const SMTP_MAILER = {
//   host: "smtp.hostinger.com", // Replace with your SMTP server
//   port: 465, // Use 587 for TLS or 465 for SSL
//   secure: true, // true for port 465, false for 587
//   auth: {
//     // Production
//     user: "support@instanthub.in", // Your domain email
//     pass: process.env.SUPPORT_PASSWORD, // Your domain email password
//   },
// };

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

// // import necessary modules
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

// import fs from 'fs';
// import path from 'path';
// import pdf from 'html-pdf';
// import nodemailer from 'nodemailer';

// // Function to create PDF
// const createPDF = (htmlContent, outputPath) => {
//   const options = { format: 'Letter' };

//   pdf.create(htmlContent, options).toFile(outputPath, (err, res) => {
//     if (err) return console.log(err);
//     console.log(res); // { filename: '/path/to/file.pdf' }
//   });
// };

// // Example HTML content
// const htmlContent = `
//   <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; }
//         .container { padding: 20px; }
//         .header { font-size: 24px; margin-bottom: 20px; }
//         .content { font-size: 16px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">Your Order Summary</div>
//         <div class="content">
//           <p>Order #17374</p>
//           <p>Customer Name: Yusuf</p>
//           <p>Item Name: iPhone 13 Pro</p>
//           <p>Variant: 128GB</p>
//           <p>Email: digitaladda86@gmail.com</p>
//           <p>Ph #: 8722220088</p>
//           <p>Address: asdfg, dhj, sff, Haryana, Chandigarh</p>
//           <p>Scheduled: Tue May 14 2024, Time Slot: 12:00 PM - 02:00 PM</p>
//           <p>Accessories:</p>
//           <ul>
//             <li>Box with same IMEI</li>
//             <li>Bill with Same IMEI Number</li>
//             <li>Original Cable</li>
//           </ul>
//           <p>Warranty: More than 11 months</p>
//           <p>Final Price: ₹ 36525</p>
//         </div>
//       </div>
//     </body>
//   </html>
// `;

// // Output file path
// const outputPath = path.join(path.resolve(), 'order-summary.pdf');

// // Generate PDF
// createPDF(htmlContent, outputPath);

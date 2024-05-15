import express from "express";
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import cookieParser from "cookie-parser";
// testing
import Admin from "./models/adminModel.js";
import jwt from "jsonwebtoken";

// Routers import
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import uploadProductsRoutes from "./routes/uploads/uploadProductRoutes.js";
import uploadSliderRoutes from "./routes/uploads/uploadSliderRoutes.js";
import uploadBrandsRoutes from "./routes/uploads/uploadBrandRoutes.js";
import uploadCategoriesRoutes from "./routes/uploads/uploadCategoryRoutes.js";
import uploadConditionLabelsRoutes from "./routes/uploads/uploadConditionLabelsRoutes.js";
import uploadCustomerProofRoutes from "./routes/uploads/uploadCustomerProof.js";
import productRoutes from "./routes/productRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import seriesRoutes from "./routes/seriesRoutes.js";

// data imports
import User from "./models/user.js";
import { dataUser } from "./data/index.js";

const PORT = process.env.PORT || 3000;

// configuration
const app = express();

const __dirname = path.resolve();

//  app.use(express.static(path.join(__dirname, "../frontend/dist")));
//  app.use(express.static(path.join(__dirname, "frontend", "dist")));

// app.use(express.json());
app.use(express.json({ limit: "10mb" })); // Set body size limit to 10mb
app.use(helmet());
//app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cors());

// Set CORS origin dynamically from an environment variable
// const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'; // Default to localhost
const corsOrigin = process.env.CORS_ORIGIN;
//app.use(
// cors({
//    origin: corsOrigin,
//      origin: 'http://localhost:5173'
//      origin: "https://instant-cash-pick-client.vercel.app",
//      credentials: true, // Include this if you need to pass credentials
// })
//);

//app.use(function (req, res, next) {
//res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//res.setHeader('Access-Control-Allow-Origin', 'https://instant-cash-pick-client.vercel.app');
//res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
// Handle preflight requests
// if (req.method === 'OPTIONS') {
// res.setHeader('Access-Control-Allow-Credentials', 'true'); // Note: 'true' as a string
//return res.status(200).end();
// }
//res.setHeader('Access-Control-Allow-Credentials', 'true');
//next();
//});

app.use(function (req, res, next) {
  // const allowedOrigins = ["https://instant-cash-pick-client.vercel.app"];
  const allowedOrigins = ["https://instantpick.in"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // Handle preflight requests
  if (req.method == "OPTIONS") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // Explicitly set the allowed origin instead of using wildcard *
    res.setHeader("Access-Control-Allow-Origin", origin);
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Middleware to enable CORS
//app.use((req, res, next) => {
// res.setHeader('Access-Control-Allow-Origin', 'http://93.127.166.173');
//res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//res.setHeader('Access-Control-Allow-Credentials', true);
//next();
//});

// app.use(
//   cors({
//     origin: "http://localhost:5173", // Adjust accordingly
//     credentials: true,
//   })
// );
// app.use(
//   cors({
//     origin: "http://93.127.166.173:5173", // Adjust accordingly
//     credentials: true,
//   })
// );
app.use(cookieParser());

//app.use(express.static(path.join(__dirname, "frontend", "dist")));
//app.get('*', (req,res) => res.sendFile(path.join(__dirname, 'frontend', 'dist','index.html')));

/* ROUTES */
app.use("/api", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/upload/categories", uploadCategoriesRoutes);
app.use("/api/brand", brandRouter);
app.use("/api/upload/brands", uploadBrandsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload/products", uploadProductsRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/upload/condition-labels", uploadConditionLabelsRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/upload/sliders", uploadSliderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload/customer-proof", uploadCustomerProofRoutes);
app.use("/api/series", seriesRoutes);

// Cookie Testing
// app.get("/contact", (req, res) => {
//   res.cookie("Test", "Yusuf");
//   res.send(`Hello Contact page`);
// });

// Testing END

// const __dirname = path.resolve();
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//if (process.env.NODE_ENV === 'production') {
//*Set static folder up in production
//  app.use(express.static(path.join(__dirname, "frontend", "dist")));

// app.use(express.static('frontend/dist'));

//app.get('*', (req,res) => res.sendFile(path.join(__dirname, 'frontend', 'dist','index.html')));
//      app.get('*', (req, res) => {
//            res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
//      });

//}

app.get("/", (req, res) => res.send("Server is ready "));

mongoose
  .connect(process.env.MONGO_URL + "/instantcashpick", {})
  .then(() => {
    app.listen(PORT, () => console.log(`Port is listening @ ${PORT}`));

    // only add data one time
    // User.insertMany(dataUser);
  })
  .catch((error) => console.log(`${error} connection failed!`));

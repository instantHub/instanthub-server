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

// Routers import
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";

// data imports
import User from "./models/user.js";
import { dataUser } from "./data/index.js";

const PORT = process.env.PORT || 3000;

// configuration
const app = express();
// app.use(express.json());
app.use(express.json({ limit: "10mb" })); // Set body size limit to 10mb
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use("/admin", adminRoutes);
app.use("/api", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/brand", brandRouter);
app.use("/api/products", productRoutes);
app.use("/api/questions", questionRoutes);

const __dirname = path.resolve();
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// if (process.env.NODE_ENV === "production") {
//   const __dirname = path.resolve();
//   app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//   app.use(express.static(path.join(__dirname, "/frontend/dist")));
//   app.use("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
//   );
// } else {
//   app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//   app.get("/", (req, res) => {
//     res.send("Api is running...");
//   });
// }

app.get("/", (req, res) => res.send("Server is ready "));

mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    app.listen(PORT, () => console.log(`Port is listening @ ${PORT}`));

    // only add data one time
    // User.insertMany(dataUser);
  })
  .catch((error) => console.log(`${error} connection failed!`));

// app.listen(PORT, () => {
//   console.log(`Port is listening @ ${PORT}`);
// });

// Penkek-8megra-xyrcod

// mongodb+srv://qureshiyusuff:NY@qureshi2@cluster0.lerztq0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// 49.37.251.250/32

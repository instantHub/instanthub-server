import express from "express";
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

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

// TODO: remove this file completely in future after full inspection
import uploadCustomerProofRoutes from "./routes/uploads/uploadCustomerProof.js";
import productRoutes from "./routes/productRoutes.js";
import processorRoutes from "./routes/processorRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import seriesRoutes from "./routes/seriesRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import deleteRoutes from "./routes/deleteRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import servicesRoutes from "./routes/services/servicesRoutes.js";
import uploadServicesRoutes from "./routes/uploads/uploadServicesRoutes.js";
import recycleRoutes from "./routes/recycleRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import SEORoutes from "./routes/seoRoutes.js";
import statsRoutes from "./routes/stats.routes.js";
import questionsPricesRoutes from "./routes/questions/prices.routes.js";
import executiveRoutes from "./routes/executiveRoutes.js";
import variantQuestionsRoutes from "./routes/questions/variantQuestions.routes.js";
import orderAnalyticsRoutes from "./routes/order-analytics.routes.js";
import partnerRoutes from "./routes/partner/partner.routes.js";
import partnerRequestRoutes from "./routes/partner/partner-request.routes.js";
import blogsRoutes from "./routes/blog.routes.js";

import { generateSitemap, getDynamicUrls } from "./generateSiteMap.js";

const PORT = process.env.PORT || 3000;

// configuration
const app = express();

const __dirname = path.resolve();
//
// app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// app.use(express.json());
app.use(express.json({ limit: "10mb" })); // Set body size limit to 10mb
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CORS_MAIN_ORIGIN =
  process.env.CORS_MAIN_ORIGIN || "https://www.instanthub.in";
const CORS_PARTNERS_ORIGIN =
  process.env.CORS_PARTNERS_ORIGIN || "https://partner.instanthub.in";

// Include any other production or staging domains here
const allowedOrigins = [CORS_MAIN_ORIGIN, CORS_PARTNERS_ORIGIN];
console.log("Allowed CORS Origins:", allowedOrigins.join(", "));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Check if the origin is in the allowed list
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // IMPORTANT: Allows cookies/headers to be sent
  })
);

app.use(cookieParser());

/* ROUTES */
app.use("/api/admin", adminRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/partners-requests", partnerRequestRoutes);
app.use("/api/executives", executiveRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/upload/categories", uploadCategoriesRoutes);
app.use("/api/brand", brandRouter);
app.use("/api/upload/brands", uploadBrandsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload/products", uploadProductsRoutes);
app.use("/api/processors", processorRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/upload/condition-labels", uploadConditionLabelsRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/upload/sliders", uploadSliderRoutes);
app.use("/api/orders", orderRoutes);

// TODO: we have replaced this in orders route itself, delete this after everything goes well
// app.use("/api/upload/customer-proof", uploadCustomerProofRoutes);

app.use("/api/series", seriesRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/upload/services", uploadServicesRoutes);
app.use("/api/recycle", recycleRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/seo", SEORoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/questions/pricing", questionsPricesRoutes);
app.use("/api/variant/questions", variantQuestionsRoutes);
app.use("/api/orders/analytics", orderAnalyticsRoutes);
app.use("/api/blogs", blogsRoutes);

// Delete Image Route
app.use("/api/delete", deleteRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/sitemap.xml", async (req, res) => {
  try {
    const urls = await getDynamicUrls();

    const sitemap = generateSitemap(urls);

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    res.status(500).send("Error generating sitemap", error);
  }
});

app.get("/", (req, res) => res.send("Server is ready "));

mongoose
  .connect(process.env.MONGO_URL + "/instantcashpick", {})
  .then(() => {
    app.listen(PORT, () => console.log(`Port is listening @ ${PORT}`));
  })
  .catch((error) => console.log(`${error} connection failed!`));

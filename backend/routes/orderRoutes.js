import express from "express";
import multer from "multer";
import path from "path";
import {
  getOrders,
  geOrderById,
  createOrder,
  deleteOrder,
  orderCancel,
  getOrdersCounts,
  getTodaysOrders,
  getPendingOrders,
  getCompletedOrders,
  getCancelledOrders,
  completeOrderWithProofs,
  rescheduleOrder,
} from "../controllers/orderController.js";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorization.js";
import { ROLES } from "../constants/auth.js";

const router = express.Router();

// --- Multer Configuration (Reused from your code) ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/customer-proof/"); // The directory to save files
  },
  filename(req, file, cb) {
    cb(
      null,
      `${path.parse(file.originalname).name}-${
        file.fieldname
      }-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or WEBP images are allowed!"), false);
  }
}

const upload = multer({ storage, fileFilter });

// Public/unauthenticated or less restricted
router.post("/", createOrder);

// This route accepts all form data and files in one go.
router.post(
  "/complete-order",
  auth,
  authorize(ROLES.admin, ROLES.executive),
  upload.fields([
    { name: "customerProofFront", maxCount: 1 },
    { name: "customerProofBack", maxCount: 1 },
    { name: "customerOptional1", maxCount: 1 },
    { name: "customerOptional2", maxCount: 1 },
  ]),
  completeOrderWithProofs
);

router.put(
  "/:id/reschedule",
  auth,
  authorize(ROLES.admin, ROLES.executive),
  rescheduleOrder
);

router.put(
  "/cancel/:orderId",
  auth,
  authorize(ROLES.admin, ROLES.executive),
  orderCancel
);

// router.put(
//   "/complete",
//   auth,
//   authorize(ROLES.admin, ROLES.executive),
//   orderComplete
// );
router.delete(
  "/delete-order/:orderId",
  auth,
  authorize(ROLES.admin, ROLES.executive),
  deleteOrder
);

// Admin only routes
router.use(auth, authorize(ROLES.admin));

// Specific GET routes
router.get("/count", getOrdersCounts);
router.get("/today", getTodaysOrders);
router.get("/pending", getPendingOrders);
router.get("/completed", getCompletedOrders);
router.get("/cancelled", getCancelledOrders);

// Default GET all orders
router.get("/", getOrders);

router.get("/:orderId", geOrderById);

export default router;

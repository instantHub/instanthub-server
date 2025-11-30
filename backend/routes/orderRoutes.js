import express from "express";
import multer from "multer";
import path from "path";
import {
  geOrderById,
  createOrder,
  deleteOrder,
  orderCancel,
  completeOrderWithProofs,
  rescheduleOrder,
  getOrderStats,
  getOrdersByStatus,
  orderReopen,
} from "../controllers/orderController.js";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorization.js";
import { ROLES } from "../constants/auth.js";
import { compressCustomerProofImages } from "../middleware/index.js";

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
  compressCustomerProofImages,
  completeOrderWithProofs
);

router.put(
  "/:id/reopen",
  auth,
  authorize(ROLES.admin, ROLES.executive),
  orderReopen
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

router.delete(
  "/delete-order/:orderId",
  auth,
  authorize(ROLES.admin, ROLES.executive),
  deleteOrder
);

// Admin only routes
router.use(auth, authorize(ROLES.admin));

router.get("/stats", getOrderStats);
router.get("/by-status", getOrdersByStatus);

router.get("/:orderId/order-details", geOrderById);

/**
 * API ENDPOINTS:
 *
 * 1. GET /api/orders/stats
 *    - Returns overall, today's, and tomorrow's order statistics
 *    - No parameters required
 *
 * 2. GET /api/orders/by-status
 *    - Returns filtered orders based on status and date
 *    - Query parameters:
 *      - status (required): pending | completed | cancelled | in-progress | unassigned | all
 *      - dateFilter (optional): today | tomorrow
 *      - page (optional, default: 1)
 *      - limit (optional, default: 20)
 *      - sortBy (optional, default: createdAt)
 *      - order (optional, default: desc)
 *
 *    Examples:
 *    - /api/orders/by-status?status=pending
 *    - /api/orders/by-status?status=pending&dateFilter=today
 *    - /api/orders/by-status?status=unassigned&dateFilter=tomorrow
 *    - /api/orders/by-status?status=completed&page=2&limit=50
 *    - /api/orders/by-status?status=all&sortBy=finalPrice&order=asc
 *
 */

export default router;

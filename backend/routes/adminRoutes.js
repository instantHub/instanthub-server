import express from "express";
import {
  loginAdmin,
  dashboardDetail,
  getAdmin,
  getAdminProfile,
  logout,
  registerAdmin,
  updateAdmin,
  validateToken,
  getAllAdmins,
  deleteAdmin,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/index.js";
import { sendInvoice } from "../controllers/sendBillToCustomer.js";

const router = express.Router();

router.post("/check/bill", sendInvoice);

router.get("/", getAdmin);

router.get("/admins", getAllAdmins);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

router.get("/validate-token", validateToken);
router.post("/register", registerAdmin);
router.post("/auth", loginAdmin);
router.post("/logout", logout);

// Since JWT token is getting saved now in browser using protected routes
// router.get("/admin-profile", protect, getAdminProfile);
// router.put("/update-admin", protect, updateAdmin);

router.get("/admin-profile", authenticate, getAdminProfile);

// Dashboard Detail
router.get("/admin/dashboard", dashboardDetail);

export default router;

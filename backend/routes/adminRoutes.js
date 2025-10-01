import express from "express";
import {
  loginAdmin,
  dashboardDetail,
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

router.post("/auth", loginAdmin);
router.post("/logout", logout);

router.use(authenticate);

router.post("/check/bill", sendInvoice);

router.get("/all-admin", getAllAdmins);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

router.get("/validate-token", validateToken);
router.post("/register", registerAdmin);

router.get("/admin-profile", getAdminProfile);

// Dashboard Detail
router.get("/dashboard", dashboardDetail);

export default router;

import express from "express";
import {
  loginAdmin,
  getAdminProfile,
  logout,
  registerAdmin,
  updateAdmin,
  getAllAdmins,
  deleteAdmin,
} from "../controllers/adminController.js";
import { auth, authorize } from "../middleware/index.js";
import { sendInvoice } from "../controllers/sendBillToCustomer.js";
import { ROLES } from "../constants/auth.js";

const router = express.Router();

router.post("/auth", loginAdmin);
router.post("/logout", logout);

router.get(
  "/profile",
  auth,
  authorize(ROLES.admin, ROLES.sub_admin, ROLES.executive),
  getAdminProfile
);

router.use(auth, authorize(ROLES.admin));

router.post("/check/bill", sendInvoice);

router.get("/all-admin", getAllAdmins);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

router.post("/register", registerAdmin);

export default router;

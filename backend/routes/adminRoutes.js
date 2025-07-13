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
} from "../controllers/adminController.js";
import { protect, authenticate } from "../middleware/index.js";

const router = express.Router();

router.get("/", getAdmin);
router.get("/validate-token", validateToken);
router.post("/register", registerAdmin);
router.post("/auth", loginAdmin);
router.post("/logout", logout);

// Since JWT token is getting saved now in browser using protected routes
// router.get("/admin-profile", protect, getAdminProfile);
// router.put("/update-admin", protect, updateAdmin);

router.get("/admin-profile", authenticate, getAdminProfile);
router.put("/update-admin", updateAdmin);

// Dashboard Detail
router.get("/admin/dashboard", dashboardDetail);

export default router;

import express from "express";
import {
  authAdmin,
  getAdmin,
  getAdminProfile,
  logout,
  registerAdmin,
  updateAdmin,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAdmin);
router.post("/register", registerAdmin);
router.post("/auth", authAdmin);
router.post("/logout", logout);

// Since JWT token is getting saved now in browser using protected routes
// router.get("/admin-profile", protect, getAdminProfile);
// router.put("/update-admin", protect, updateAdmin);

router.get("/admin-profile", getAdminProfile);
router.put("/update-admin", updateAdmin);

export default router;

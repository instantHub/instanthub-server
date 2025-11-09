import express from "express";
import {
  createPartner,
  deletePartner,
  getPartnerProfile,
  getPartners,
  loginPartner,
  updatePartner,
} from "../../controllers/index.js";
import { auth, authorize } from "../../middleware/index.js";
import { ROLES } from "../../constants/auth.js";

const router = express.Router();

router.post("/auth", loginPartner);

// All routes in this file are protected
router.get("/", auth, authorize(ROLES.admin), getPartners);
router.post("/", auth, authorize(ROLES.admin), createPartner);
router.delete("/:id", auth, authorize(ROLES.admin), deletePartner);
router.put("/:id", auth, authorize(ROLES.admin, ROLES.partner), updatePartner);

router.use(auth, authorize(ROLES.partner));

router.get("/profile", getPartnerProfile);

export default router;

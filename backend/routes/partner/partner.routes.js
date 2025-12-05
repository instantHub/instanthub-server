import express from "express";
import {
  createPartner,
  createPartnerExecutive,
  deletePartner,
  deletePartnerExecutive,
  getPartnerExecutives,
  getPartnerProfile,
  getPartners,
  partnerLogin,
  partnerLogout,
  updatePartner,
} from "../../controllers/index.js";
import { auth, authorize } from "../../middleware/index.js";
import { ROLES } from "../../constants/auth.js";

// routes :- "/api/partners"

const router = express.Router();

router.post("/auth", partnerLogin);
router.post("/logout", partnerLogout);

router.get("/", auth, authorize(ROLES.admin), getPartners);
router.post("/", auth, authorize(ROLES.admin), createPartner);
router.delete("/:id", auth, authorize(ROLES.admin), deletePartner);
router.put("/:id", auth, authorize(ROLES.admin, ROLES.partner), updatePartner);

router.get(
  "/executive",
  auth,
  authorize(ROLES.admin, ROLES.partner),
  getPartnerExecutives
);
router.post(
  "/executive",
  auth,
  authorize(ROLES.admin, ROLES.partner),
  createPartnerExecutive
);
router.delete(
  "/:id/executive",
  auth,
  authorize(ROLES.admin, ROLES.partner),
  deletePartnerExecutive
);
router.put(
  "/:id/executive",
  auth,
  authorize(ROLES.admin, ROLES.partner, ROLES.partner_executive),
  updatePartner
);

router.get(
  "/profile",
  auth,
  authorize(ROLES.admin, ROLES.partner, ROLES.partner_executive),
  getPartnerProfile
);

export default router;

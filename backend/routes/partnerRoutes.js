import express from "express";
import {
  createPartner,
  deletePartner,
  getPartnerProfile,
  getPartners,
  loginPartner,
  updatePartner,
} from "../controllers/partnerController.js";
import { authenticate, partner_authenticate } from "../middleware/index.js";

const router = express.Router();

router.post("/auth", loginPartner);
// TODO: Add logout route for partners
// router.post("/logout", logout);

// All routes in this file are protected

router.get("/", authenticate, getPartners);

router.use(partner_authenticate);

router.route("/").post(createPartner);

router.get("/partner-profile", getPartnerProfile);

router.route("/:id").put(updatePartner).delete(deletePartner);

export default router;

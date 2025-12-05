import express from "express";
import {
  deletePartnerRequest,
  getPartnerRequests,
  rejectPartnerRequest,
  submitPartnerRequest,
} from "../../controllers/index.js";

const router = express.Router();

router.post("/", submitPartnerRequest);
router.get("/", getPartnerRequests);
router.put("/:id/reject", rejectPartnerRequest);
router.delete("/:id", deletePartnerRequest);

export default router;

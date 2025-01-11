import express from "express";
import {
  complaintsAcknowledge,
  createComplaint,
  deleteComplaint,
  getComplaints,
} from "../controllers/complaintController.js";

const router = express.Router();

router.get("/", getComplaints);
router.post("/", createComplaint);
router.patch("/:complaintId", complaintsAcknowledge);
router.delete("/:complaintId", deleteComplaint);

export default router;

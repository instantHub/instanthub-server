import express from "express";
import {
  assignOrderToPartner,
  getMyAssignedOrders,
  getOrdersByLocation,
  getPartnerOrderId,
} from "../../controllers/index.js";
import { auth, authorize } from "../../middleware/index.js";
import { ROLES } from "../../constants/auth.js";

const router = express.Router();

// route :- /api/partners-orders

// This route should be accessible by partner-executive as well
router.get(
  "/my-orders",
  auth,
  authorize(ROLES.partner, ROLES.partner_executive),
  getMyAssignedOrders
);

router.get("/by-location", auth, authorize(ROLES.partner), getOrdersByLocation);
router.post(
  "/assign-order",
  auth,
  authorize(ROLES.partner),
  assignOrderToPartner
);

router.get(
  "/:id",
  auth,
  authorize(ROLES.partner, ROLES.partner_executive),
  getPartnerOrderId
);

export default router;

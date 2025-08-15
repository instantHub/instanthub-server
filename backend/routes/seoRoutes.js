import express from "express";
import {
  updateBrandMetaTags,
  updateCategoryMetaTags,
  updateProductMetaTags,
} from "../controllers/seoController.js";

const router = express.Router();

router.put("/category/:uniqueURL", updateCategoryMetaTags);
router.put("/brand/:uniqueURL", updateBrandMetaTags);
router.put("/product/:uniqueURL", updateProductMetaTags);

export default router;

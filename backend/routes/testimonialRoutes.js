import express from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getPublicTestimonials,
  getSingleTestimonial,
  getTestimonials,
  updateTestimonial,
  updateTestimonialFeature,
  updateTestimonialStatus,
} from "../controllers/testimonialController.js";

const router = express.Router();

// Get all testimonials (for admin)
router.get("/", getTestimonials);

// Get active testimonials for public display
router.get("/public", getPublicTestimonials);

// Get single testimonial
router.get("/:id", getSingleTestimonial);

// Create testimonial
router.post("/", createTestimonial);

// Update testimonial
router.put("/:id", updateTestimonial);

// Delete testimonial
router.delete("/:id", deleteTestimonial);

// Toggle testimonial status
router.patch("/:id/toggle-status", updateTestimonialStatus);

// Toggle featured status
router.patch("/:id/toggle-featured", updateTestimonialFeature);

export default router;

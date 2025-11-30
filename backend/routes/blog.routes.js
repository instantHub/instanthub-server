import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  publishBlog,
  archiveBlog,
  getBlogStats,
  getAllTags,
  searchBlogs,
} from "../controllers/blog.controller.js";
import { auth, compressBlogImage } from "../middleware/index.js";
import {
  validateBlog,
  validateBlogUpdate,
} from "../validators/blog.validator.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/blogs/"); // The directory to save files
  },
  filename(req, file, cb) {
    cb(
      null,
      `${path.parse(file.originalname).name}-${
        file.fieldname
      }-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or WEBP images are allowed!"), false);
  }
}

const upload = multer({ storage, fileFilter });

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/tags", getAllTags);
router.get("/search", searchBlogs);

// Protected routes (require authentication)
router.post(
  "/",
  auth,
  // TODO: Currently we get validation error if we use this middleware which needs to be updated
  // validateBlog,
  upload.fields([{ name: "featuredImage", maxCount: 1 }]),
  compressBlogImage,
  createBlog
);

router.get("/stats", auth, getBlogStats);
router.get("/:id", auth, getBlogById);
router.put(
  "/:id",
  auth,
  // TODO: Currently we get validation error if we use this middleware which needs to be updated
  // validateBlogUpdate,
  upload.fields([{ name: "featuredImage", maxCount: 1 }]),
  compressBlogImage,
  updateBlog
);
router.delete("/:id", auth, deleteBlog);
router.patch("/:id/publish", auth, publishBlog);
router.patch("/:id/archive", auth, archiveBlog);

export default router;

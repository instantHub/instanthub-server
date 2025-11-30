// // validators/blog.validator.js
// import { body, validationResult } from "express-validator";

// const handleValidationErrors = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       message: "Validation failed",
//       errors: errors.array(),
//     });
//   }
//   next();
// };

// export const validateBlog = [
//   body("content.title")
//     .trim()
//     .notEmpty()
//     .withMessage("Title is required")
//     .isLength({ min: 10, max: 200 })
//     .withMessage("Title must be between 10 and 200 characters"),

//   body("content.leadParagraph")
//     .trim()
//     .notEmpty()
//     .withMessage("Lead paragraph is required")
//     .isLength({ min: 50 })
//     .withMessage("Lead paragraph must be at least 50 characters"),

//   body("content.body")
//     .trim()
//     .notEmpty()
//     .withMessage("Body content is required")
//     .isLength({ min: 200 })
//     .withMessage("Body must be at least 200 characters"),

//   body("content.readingTime")
//     .trim()
//     .notEmpty()
//     .withMessage("Reading time is required"),

//   body("seo.metaTitle")
//     .trim()
//     .notEmpty()
//     .withMessage("Meta title is required")
//     .isLength({ max: 60 })
//     .withMessage("Meta title must not exceed 60 characters"),

//   body("seo.metaDescription")
//     .trim()
//     .notEmpty()
//     .withMessage("Meta description is required")
//     .isLength({ max: 160 })
//     .withMessage("Meta description must not exceed 160 characters"),

//   body("slug")
//     .optional()
//     .trim()
//     .matches(/^[a-z0-9-]+$/)
//     .withMessage(
//       "Slug must contain only lowercase letters, numbers, and hyphens"
//     ),

//   handleValidationErrors,
// ];

// export const validateBlogUpdate = [
//   body("content.title")
//     .optional()
//     .trim()
//     .isLength({ min: 10, max: 200 })
//     .withMessage("Title must be between 10 and 200 characters"),

//   body("seo.metaTitle")
//     .optional()
//     .trim()
//     .isLength({ max: 60 })
//     .withMessage("Meta title must not exceed 60 characters"),

//   body("seo.metaDescription")
//     .optional()
//     .trim()
//     .isLength({ max: 160 })
//     .withMessage("Meta description must not exceed 160 characters"),

//   handleValidationErrors,
// ];

// validators/blog.validator.js
// import { validationResult } from "express-validator";

// Middleware to parse and validate blog data
export const validateBlog = (req, res, next) => {
  console.log("validateBlog - req.body", req.body);

  try {
    // Parse JSON fields from FormData
    if (req.body.seo && typeof req.body.seo === "string") {
      req.body.seo = JSON.parse(req.body.seo);
    }

    if (req.body.content && typeof req.body.content === "string") {
      req.body.content = JSON.parse(req.body.content);
    }

    const errors = [];

    // Validate content
    if (!req.body.content) {
      errors.push({ field: "content", message: "Content is required" });
    } else {
      const { title, leadParagraph, body, readingTime } = req.body.content;

      if (!title || title.trim().length === 0) {
        errors.push({ field: "content.title", message: "Title is required" });
      } else if (title.length < 10 || title.length > 200) {
        errors.push({
          field: "content.title",
          message: "Title must be between 10 and 200 characters",
        });
      }

      if (!leadParagraph || leadParagraph.trim().length === 0) {
        errors.push({
          field: "content.leadParagraph",
          message: "Lead paragraph is required",
        });
      } else if (leadParagraph.length < 50) {
        errors.push({
          field: "content.leadParagraph",
          message: "Lead paragraph must be at least 50 characters",
        });
      }

      if (!body || body.trim().length === 0) {
        errors.push({
          field: "content.body",
          message: "Body content is required",
        });
      } else if (body.length < 200) {
        errors.push({
          field: "content.body",
          message: "Body must be at least 200 characters",
        });
      }

      if (!readingTime || readingTime.trim().length === 0) {
        errors.push({
          field: "content.readingTime",
          message: "Reading time is required",
        });
      }
    }

    // Validate SEO
    if (!req.body.seo) {
      errors.push({ field: "seo", message: "SEO metadata is required" });
    } else {
      const { metaTitle, metaDescription } = req.body.seo;

      if (!metaTitle || metaTitle.trim().length === 0) {
        errors.push({
          field: "seo.metaTitle",
          message: "Meta title is required",
        });
      } else if (metaTitle.length > 60) {
        errors.push({
          field: "seo.metaTitle",
          message: "Meta title must not exceed 60 characters",
        });
      }

      if (!metaDescription || metaDescription.trim().length === 0) {
        errors.push({
          field: "seo.metaDescription",
          message: "Meta description is required",
        });
      } else if (metaDescription.length > 160) {
        errors.push({
          field: "seo.metaDescription",
          message: "Meta description must not exceed 160 characters",
        });
      }
    }

    // Validate slug if provided
    if (req.body.slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(req.body.slug)) {
        errors.push({
          field: "slug",
          message:
            "Slug must contain only lowercase letters, numbers, and hyphens",
        });
      }
    }

    // Return errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format in form data",
      error: error.message,
    });
  }
};

export const validateBlogUpdate = (req, res, next) => {
  console.log("validateBlogUpdate - req.body", req.body);

  try {
    // Parse JSON fields from FormData
    if (req.body.seo && typeof req.body.seo === "string") {
      req.body.seo = JSON.parse(req.body.seo);
    }

    if (req.body.content && typeof req.body.content === "string") {
      req.body.content = JSON.parse(req.body.content);
    }

    const errors = [];

    // Validate content fields if provided
    if (req.body.content) {
      const { title, leadParagraph, body } = req.body.content;

      if (title !== undefined && (title.length < 10 || title.length > 200)) {
        errors.push({
          field: "content.title",
          message: "Title must be between 10 and 200 characters",
        });
      }

      if (leadParagraph !== undefined && leadParagraph.length < 50) {
        errors.push({
          field: "content.leadParagraph",
          message: "Lead paragraph must be at least 50 characters",
        });
      }

      if (body !== undefined && body.length < 200) {
        errors.push({
          field: "content.body",
          message: "Body must be at least 200 characters",
        });
      }
    }

    // Validate SEO fields if provided
    if (req.body.seo) {
      const { metaTitle, metaDescription } = req.body.seo;

      if (metaTitle !== undefined && metaTitle.length > 60) {
        errors.push({
          field: "seo.metaTitle",
          message: "Meta title must not exceed 60 characters",
        });
      }

      if (metaDescription !== undefined && metaDescription.length > 160) {
        errors.push({
          field: "seo.metaDescription",
          message: "Meta description must not exceed 160 characters",
        });
      }
    }

    // Validate slug if provided
    if (req.body.slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(req.body.slug)) {
        errors.push({
          field: "slug",
          message:
            "Slug must contain only lowercase letters, numbers, and hyphens",
        });
      }
    }

    // Return errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format in form data",
      error: error.message,
    });
  }
};

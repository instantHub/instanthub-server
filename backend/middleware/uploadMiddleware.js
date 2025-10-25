import multer from "multer";
import path from "path";
import fs from "fs";

// A generic file filter for common image types
const imageFileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }

  cb(
    new Error(
      "File type not supported. Only JPG, PNG, or WEBP images are allowed."
    ),
    false
  );
};

/**
 * Creates a Multer upload middleware with a dynamic destination path.
 * @param {string} subfolder - The subfolder within './uploads' to save files to.
 * @returns {multer.Instance} - The configured Multer instance.
 */
export const createUploadMiddleware = (subfolder) => {
  const fullPath = path.join("uploads", subfolder);

  // Ensure the destination directory exists
  fs.mkdirSync(fullPath, { recursive: true });

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, fullPath); // Use the dynamically created path
    },
    filename(req, file, cb) {
      const uniqueSuffix = `${file.fieldname}-${Date.now()}`;
      cb(
        null,
        `${path.parse(file.originalname).name}-${uniqueSuffix}${path.extname(
          file.originalname
        )}`
      );
    },
  });

  return multer({ storage, fileFilter: imageFileFilter });
};

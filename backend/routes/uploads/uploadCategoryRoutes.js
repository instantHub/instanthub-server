import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    console.log("destination", req.body);
    cb(null, "uploads/categories/");
  },
  // destination: getDestination,

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
  console.log("fileFilter", req.body);

  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Images Only"), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

router.post("/", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    res.status(200).send({
      message: "Category Image Uploaded Successfully",
      image: `/${req.file.path}`,
    });
  });
});

export default router;

import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      // `${file.fieldname}-${Date.now()}-${file.originalname}`
      `${path.parse(file.originalname).name}-${
        file.fieldname
      }-${Date.now()}${path.extname(file.originalname)}`
    );
    // console.log(extname(file.originalname));
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
      message: "Image Uploaded Successfully",
      image: `/${req.file.path}`,
      //   image: `/${req.body}`,
    });
  });
});

export default router;

// const upload = multer({ dest: "uploads/" });

// router.post("/", upload.single("image"), async (req, res) => {
//   console.log("Image received:", req.body);
//   res.send("Image uploaded successfully");
// });

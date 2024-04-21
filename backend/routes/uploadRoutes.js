import path from "path";
import express from "express";
import multer from "multer";
import uploadCategoryRoutes from "./uploads/uploadCategoryRoutes.js";

const router = express.Router();

// Function to dynamically set the destination directory
const getDestination = (req, file, cb) => {
  const uploadDir = req.body.uploadDir; // Assuming you pass uploadDir as a parameter in the request body
  console.log("test", req.body.uploadDir);
  cb(null, `uploads/${uploadDir}/`);
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    console.log("destination", req.body);
    cb(null, "uploads/");
  },
  // destination: getDestination,

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
  console.log("upload router.post", req.body);

  // TESTING
  // Check if uploadURL is "category"
  if (req.body.uploadURL === "category") {
    console.log("route matched");
    // If it is, route to uploadCategoryRoutes middleware
    return uploadCategoryRoutes(req, res);
  }
  // else {
  //   res.status(201).json({ message: "Provide a valid route" });
  // }

  // TESTING ENDS

  uploadSingleImage(req, res, (err) => {
    console.log("uploadSingleImage", req.body);
    // // Check if uploadURL is "category"
    // if (req.body.uploadURL === "category") {
    //   console.log("route matched");
    //   // If it is, route to uploadCategoryRoutes middleware
    //   return uploadCategoryRoutes(req, res);
    // }
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

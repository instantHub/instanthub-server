import path from "path";
import fs from "fs";

export function deleteImage(image) {
  console.log("In delete image");
  const __dirname = path.resolve();
  const imagePath = path.join(__dirname, image);
  console.log("imagePath", image);

  try {
    fs.unlink(imagePath, (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          console.log(`Image ${imagePath} does not exist.`);
        } else {
          console.error(`Error deleting image ${imagePath}:`, err);
        }
      } else {
        console.log(`Image ${imagePath} deleted successfully.`);
      }
    });
  } catch (err) {
    console.error(`Error deleting image ${imagePath}:`, err);
  }
}

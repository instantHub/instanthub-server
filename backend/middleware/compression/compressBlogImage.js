import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

export const compressBlogImage = async (req, res, next) => {
  try {
    console.log("Compress middleware triggered");
    // console.log("req.files:", req.files);

    if (!req.files || !req.files.featuredImage || !req.files.featuredImage[0]) {
      console.log("No image to compress");
      return next();
    }

    const file = req.files.featuredImage[0];
    console.log("Original file:", file.originalname, "Size:", file.size);
    console.log("Saved at:", file.path); // This is the key - file is already on disk!

    // Generate compressed filename
    const filename = `${path.parse(file.originalname).name}-${Date.now()}.webp`;
    const compressedPath = path.join("uploads/blogs/", filename);

    console.log("Compressing from:", file.path);
    console.log("Compressing to:", compressedPath);

    // Read from saved file and compress
    await sharp(file.path) // ← Use file.path, not file.buffer!
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(compressedPath);

    // Delete original uncompressed file
    await fs.unlink(file.path);
    console.log("✓ Deleted original:", file.path);

    // Verify compressed file was created
    const stats = await fs.stat(compressedPath);
    console.log("✓ Compressed file saved! New size:", stats.size, "bytes");
    console.log(
      "✓ Saved:",
      ((1 - stats.size / file.size) * 100).toFixed(1) + "%"
    );

    // Update file info for controller
    req.files.featuredImage[0] = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: "image/webp",
      filename: filename,
      path: compressedPath,
      size: stats.size,
    };

    next();
  } catch (error) {
    console.error("Compression error:", error);
    next(error);
  }
};

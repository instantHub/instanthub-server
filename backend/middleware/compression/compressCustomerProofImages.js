import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

export const compressCustomerProofImages = async (req, res, next) => {
  try {
    console.log("Customer proof compression middleware triggered");
    // console.log("req.files:", req.files);

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No images to compress");
      return next();
    }

    // Define all possible image fields
    const imageFields = [
      "customerProofFront",
      "customerProofBack",
      "customerOptional1",
      "customerOptional2",
    ];

    // Process each image field
    for (const fieldName of imageFields) {
      if (req.files[fieldName] && req.files[fieldName][0]) {
        const file = req.files[fieldName][0];

        console.log(`\nProcessing ${fieldName}:`);
        console.log("  Original file:", file.originalname);
        console.log("  Original size:", file.size, "bytes");
        console.log("  Saved at:", file.path);

        // Generate compressed filename
        const filename = `${
          path.parse(file.originalname).name
        }-${Date.now()}.webp`;
        const compressedPath = path.join("uploads/customer-proof/", filename);

        console.log("  Compressing to:", compressedPath);

        try {
          // Read from saved file and compress
          await sharp(file.path)
            .resize(1920, 1920, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .webp({ quality: 85 }) // Slightly higher quality for proof images
            .toFile(compressedPath);

          // Delete original uncompressed file
          await fs.unlink(file.path);
          console.log("  ✓ Deleted original:", file.path);

          // Get compressed file stats
          const stats = await fs.stat(compressedPath);
          const compressionRatio = ((1 - stats.size / file.size) * 100).toFixed(
            1
          );

          console.log("  ✓ Compressed! New size:", stats.size, "bytes");
          console.log("  ✓ Saved:", compressionRatio + "%");

          // Update file info for controller
          req.files[fieldName][0] = {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: "image/webp",
            filename: filename,
            path: compressedPath,
            size: stats.size,
          };
        } catch (compressionError) {
          console.error(
            `  ✗ Error compressing ${fieldName}:`,
            compressionError.message
          );
          // Continue with other images even if one fails
        }
      }
    }

    console.log("\n✓ All images processed\n");
    next();
  } catch (error) {
    console.error("Customer proof compression error:", error);
    next(error);
  }
};

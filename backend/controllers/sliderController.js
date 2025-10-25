import Slider from "../models/sliderModel.js";
import path from "path";
import fs from "fs";
import { deleteImage } from "../utils/deleteImage.js";

export const getAllSliders = async (req, res) => {
  console.log("getAllSliders Controller");

  try {
    const slidersList = await Slider.find();
    res.status(200).json(slidersList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getActiveSliders = async (req, res) => {
  console.log("getActiveSliders Controller");

  try {
    const slidersList = await Slider.find({ status: "Active" });
    // console.log(slidersList);
    res.status(200).json(slidersList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.sliderId);
    if (!slider) {
      return res.status(404).json({ message: "Slider not found" });
    }
    res.status(200).json(slider);
  } catch (error) {
    console.error("Error fetching slider by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createSlider = async (req, res) => {
  // Multer (using .fields) places the file info in req.files
  // and text fields in req.body
  const { status } = req.body;

  // The key 'slider' matches the name from the middleware
  const file = req.files.slider[0];

  if (!file) {
    return res.status(400).json({ message: "No slider image uploaded." });
  }

  // The path to the uploaded file on your server
  const imagePath = file.path;

  try {
    // Now create the slider in your database with the status and imagePath
    const newSlider = await Slider.create({
      image: imagePath, // Save the path or full URL
      status: status,
    });

    res
      .status(201)
      .json({ message: "Slider created successfully", slider: newSlider });
  } catch (error) {
    console.error("Error creating slider:", error);
    res.status(500).json({ message: "Server error while creating slider." });
  }
};

export const updateSlider = async (req, res) => {
  const { sliderId } = req.params;
  const { status } = req.body;

  try {
    const slider = await Slider.findById(sliderId);
    if (!slider) {
      return res.status(404).json({ message: "Slider not found." });
    }

    // Check if a new file was uploaded
    if (req.file) {
      const oldImagePath = slider.image;

      try {
        deleteImage(oldImagePath);
      } catch (err) {
        console.error(`Failed to delete old image: ${oldImagePath}`, err);
      }

      // Update the image path to the new file's path
      slider.image = req.file.path;
    }

    // Update the status (if provided)
    if (status) {
      slider.status = status;
    }

    const updatedSlider = await slider.save();

    res.status(200).json({
      message: "Slider updated successfully",
      slider: updatedSlider,
    });
  } catch (error) {
    console.error("Server error while updating slider:", error);
    res.status(500).json({ message: "Server error while updating slider." });
  }
};

// DELETE Slider
export const deleteSlider = async (req, res) => {
  console.log("deleteSlider controller");
  const sliderId = req.params.sliderId;
  console.log(sliderId);

  try {
    // 1. Delete brand
    const deletedSlider = await Slider.findByIdAndDelete(sliderId);
    console.log("deletedSlider", deletedSlider);

    // 2. Delete image from uploads/ of the deleted Brand
    deleteImage(deletedSlider.image);

    // Delete the corresponding image file from the uploads folder
    function deleteImage(image) {
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

    return res
      .status(201)
      .json({ data: deletedSlider, message: "Slider deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};

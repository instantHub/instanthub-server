import Slider from "../models/sliderModel.js";
import path from "path";
import fs from "fs";

export const getSliders = async (req, res) => {
  console.log("getSliders Controller");

  try {
    const slidersList = await Slider.find();
    // console.log(slidersList);
    res.status(200).json(slidersList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createSlider = async (req, res) => {
  console.log("createSlider Controller");
  console.log(req.body);

  try {
    let slider = await Slider.create(req.body);
    slider.save();
    res.status(200).json({ success: true, data: slider });
    // res.status(200).json("create slider");Þ
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateSlider = async (req, res) => {
  console.log("updateSlider Controller");
  const { sliderId } = req.params;
  console.log(sliderId);
  console.log(req.body);

  try {
    let slider = await Slider.findByIdAndUpdate(sliderId, req.body, {
      new: true,
    });
    slider.save();
    res.status(200).json({ success: true, data: slider });
    // res.status(200).json("create slider");Þ
  } catch (error) {
    res.status(404).json({ message: error.message });
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
    console.log("deleteOrder", deletedSlider);

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

import Series from "../models/seriesModel.js";
import Brand from "../models/brandModel.js";

export const getSeries = async (req, res) => {
  console.log("getSeries Controller");

  try {
    const seriesList = await Series.find()
      .populate("category", "name")
      .populate("brand", "name");
    // console.log(seriesList);
    res.status(200).json(seriesList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSeriesByBrand = async (req, res) => {
  console.log("getSeriesByBrand Controller");
  const { brandUniqueURL } = req.params;
  // console.log("brandUniqueURL", brandUniqueURL);

  try {
    const brand = await Brand.findOne({ uniqueURL: brandUniqueURL });
    // console.log("brand:", brand);
    const brandSeries = await Series.find({ brand: brand._id });
    //   .populate("category", "name")
    //   .populate("brand", "name");
    // console.log("brandSeries:", brandSeries);
    res.status(200).json(brandSeries);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createSeries = async (req, res) => {
  console.log("createSeries Controller");
  console.log(req.body);

  try {
    const series = await Series.find({
      brand: req.body.brand,
      category: req.body.category,
    });

    if (series.length > 0) {
      let duplicate = false;

      series.map((s) => {
        // console.log(typeof product.name);
        if (s.name.toLowerCase() === req.body.name.toLowerCase()) {
          duplicate = true;
        }
      });
      console.log(duplicate);

      if (duplicate == false) {
        const seriesCreated = await Series.create(req.body);
        seriesCreated.save();
        res.status(200).json({ success: true, data: seriesCreated });
      } else if (duplicate == true) {
        // TODO Task, Unique Name Validation not working
        res.status(200).send({
          success: false,
          data: "Duplicate SeriesName",
          message: "Series " + req.body.name + " already exist ",
        });
      }
    } else {
      const seriesCreated = await Series.create(req.body);
      seriesCreated.save();
      res.status(200).json({ success: true, data: seriesCreated });
    }

    // res.status(200).json("create series");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateSeries = async (req, res) => {
  console.log("updateSeries Controller");
  const { seriesId } = req.params;
  console.log(seriesId);
  console.log(req.body);

  try {
    const series = await Series.find({
      brand: req.body.brand,
      category: req.body.category,
      _id: { $ne: seriesId }, // Exclude the series with the specified seriesId
    });

    if (series.length > 0) {
      let duplicate = false;

      series.map((s) => {
        // console.log(typeof product.name);
        if (s.name.toLowerCase() === req.body.name.toLowerCase()) {
          duplicate = true;
        }
      });
      console.log(duplicate);

      if (duplicate == false) {
        const updatedSeries = await Series.findByIdAndUpdate(
          seriesId,
          {
            name: req.body.name,
          },
          { new: true }
        );
        updatedSeries.save();
        res.status(200).json({ success: true, data: updatedSeries });
      } else if (duplicate == true) {
        // TODO Task, Unique Name Validation not working
        res.status(200).send({
          success: false,
          data: "Duplicate SeriesName",
          message:
            "Cannot Update Series Name To " +
            req.body.name +
            ", as this name already exist ",
        });
      }
    } else {
      const updatedSeries = await Series.findByIdAndUpdate(
        seriesId,
        {
          name: req.body.name,
        },
        { new: true }
      );
      updatedSeries.save();
      res.status(200).json({ success: true, data: updatedSeries });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// DELETE Slider
export const deleteSeries = async (req, res) => {
  console.log("deleteSeries controller");
  const seriesId = req.params.seriesId;
  console.log(seriesId);

  try {
    // 1. Delete brand
    const deletedSeries = await Series.findByIdAndDelete(seriesId);
    // console.log("deletedSeries", deletedSeries);

    return res
      .status(201)
      .json({ data: deletedSlider, message: "Series deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};

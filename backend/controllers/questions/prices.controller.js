import Product from "../../models/productModel.js";
import Processor from "../../models/processorModel.js";
import Brand from "../../models/brandModel.js";

/**
 * Update ALL Laptop Configurations (simpleDeductions)
 * Route: PUT /api/questions/pricing/configurations/all
 */
export const updateAllLaptopConfigurations = async (req, res) => {
  console.log("updateAllLaptopConfigurations controller");

  try {
    const { productId, updatedProduct } = req.body; // productId from body to get category
    const { brand } = req.query;

    const product = await Product.findById(productId).populate("brand");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const categoryId = product.category;

    const appleBrand = await Brand.findOne({
      category: categoryId,
      name: "Apple",
    }).select("_id name category");

    const result = await Product.updateMany(
      {
        category: categoryId,
        brand:
          appleBrand?.name === brand
            ? appleBrand._id
            : { $ne: appleBrand?._id },
      },
      { $set: { simpleDeductions: updatedProduct.simpleDeductions } }
    );

    res
      .status(200)
      .json({ message: "All laptop configurations updated", result });
  } catch (error) {
    console.error("Error updating all laptop configs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update SINGLE Laptop Configuration
 * Route: PUT /api/questions/pricing/configurations/single/:productId
 */
export const updateSingleLaptopConfiguration = async (req, res) => {
  console.log("updateSingleLaptopConfiguration controller");

  try {
    const { productId } = req.params;
    const { updatedProduct } = req.body;

    const productUpdated = await Product.findByIdAndUpdate(
      productId,
      { $set: { simpleDeductions: updatedProduct.simpleDeductions } },
      { new: true }
    );

    if (!productUpdated)
      return res.status(404).json({ message: "Product not found" });

    res
      .status(200)
      .json({ message: "Single laptop configuration updated", productUpdated });
  } catch (error) {
    console.error("Error updating single laptop config:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update SINGLE Laptop Processor Problems
 * Route: PUT /api/questions/pricing/problems/single/:productId
 */
export const updateSingleLaptopProcessorProblems = async (req, res) => {
  console.log("updateSingleLaptopProcessorProblems controller");

  try {
    const { updatedData } = req.body;

    const processorUpdated = await Processor.updateOne(
      {
        category: updatedData.category.id,
        processorId: updatedData.processorId,
      },
      { $set: { deductions: updatedData.deductions } },
      { new: true }
    );

    console.log("Update Result:", processorUpdated); // 🔹 see matched & modified counts

    if (processorUpdated.matchedCount === 0) {
      return res.status(404).json({ message: "Processor not found" });
    }

    res
      .status(200)
      .json({ message: "Single processor problems updated", processorUpdated });
  } catch (error) {
    console.error("Error updating single processor problems:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update ALL Laptop Processor Problems (per category)
 * Route: PUT /api/questions/pricing/problems/all
 */
export const updateAllLaptopProcessorProblems = async (req, res) => {
  try {
    const { updatedData } = req.body;

    const processorUpdated = await Processor.updateMany(
      { category: updatedData.category.id },
      { $set: { deductions: updatedData.deductions } }
    );

    if (processorUpdated.matchedCount === 0) {
      return res.status(404).json({ message: "Processors not found" });
    }

    res
      .status(200)
      .json({ message: "All processor problems updated", processorUpdated });
  } catch (error) {
    console.error("Error updating all processor problems:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

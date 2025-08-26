export const updateLaptopConfigurationsPriceDrop = async (req, res) => {
  console.log("updateLaptopConfigurationsPriceDrop Controller");
  // console.log("req.body", req.body);
  try {
    const productId = req.params.productId;
    console.log("productId", productId);
    const type = req.query.type;
    console.log("type", type);
    const brand = req.query.brand;
    console.log("brand from req.query", brand);

    const updatedProduct = req.body;
    // console.log("updatedProduct", updatedProduct);

    const product = await Product.findById(productId).populate("brand");
    // console.log("product", product);
    const categoryId = product.category;
    // const categoryFound = await Category.findById(categoryId);
    // const brandId = Product.brand;

    const APPLEBRAND = await Brand.findOne({
      category: categoryId,
      name: "Apple",
    }).select("_id name category");

    console.log("APPLEBRAND", APPLEBRAND);

    let { name: appleBrandName, _id: appleBrandId } = APPLEBRAND;
    console.log("brand name & ID from ", appleBrandName, appleBrandId);

    // console.log("updatedDeductions", updatedDeductions);
    // console.log("processor", updatedDeductions[1]);

    let updatedDeductions = req.body.simpleDeductions;

    if (type.toLowerCase().includes("alllaptopconfig")) {
      console.log("Updating ALL Laptops CONFIGURATIONS");

      // Update the product with the complete updated data
      const result = await Product.updateMany(
        {
          category: categoryId,
          brand:
            appleBrandName === brand ? appleBrandId : { $ne: appleBrandId }, // Dynamic brand match
        },
        { $set: { simpleDeductions: updatedDeductions } }
      );

      console.log("productUpdated from alllaptopconfig", result);
    } else if (type.toLowerCase().includes("singlelaptopconfig")) {
      console.log("Updating SINGLE Laptop CONFIGURATIONS: singlelaptopconfig");

      // Update the product with the complete updated data
      const productUpdated = await Product.findByIdAndUpdate(
        productId,
        { $set: { simpleDeductions: updatedProduct.simpleDeductions } },
        { new: true }
      );
      await productUpdated.save();
      console.log("productUpdated", productUpdated);
    } else if (type.includes("SingleLaptopProblems")) {
      console.log("*********************************");
      console.log("Updating Single Processor Based Problems");
      // Update the product with the complete updated data

      let selectedProcessorDeduction = req.body;
      // console.log("selectedProcessorDeduction", selectedProcessorDeduction);
      console.log(
        "category",
        selectedProcessorDeduction.category.id,
        "productId",
        selectedProcessorDeduction.processorId
      );

      // Update the Processor with the complete updated data
      const processorUpdated = await Processor.updateOne(
        {
          category: selectedProcessorDeduction.category.id, // Match by category
          processorId: selectedProcessorDeduction.processorId, // Match by processorId
        },
        {
          $set: {
            deductions: selectedProcessorDeduction.deductions, // Set the new deductions data
          },
        }
      );

      console.log("processorUpdated", processorUpdated);

      // console.log("productUpdated", productUpdated);
    } else if (type.includes("AllLaptopProblems")) {
      console.log("*********************************");
      console.log("Updating ALL Processor Based Problems");

      let selectedProcessorDeduction = req.body;
      // console.log("selectedProcessorDeduction", selectedProcessorDeduction);
      console.log(
        "category",
        selectedProcessorDeduction.category.id,
        "productId",
        selectedProcessorDeduction.processorId
      );

      // Update the Processor with the complete updated data
      const processorUpdated = await Processor.updateMany(
        {
          category: selectedProcessorDeduction.category.id, // Match by category
          // processorId: selectedProcessorDeduction.processorId, // Match by processorId
        },
        {
          $set: {
            deductions: selectedProcessorDeduction.deductions, // Set the new deductions data
          },
        }
      );

      console.log("processorUpdated", processorUpdated);
    }

    res.status(200).json({ message: "Products updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

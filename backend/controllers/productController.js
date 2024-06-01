import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";
import path from "path";
import fs from "fs";

export const getAllProducts = async (req, res) => {
  console.log("getAllProducts Controller");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  try {
    // Escape special characters in the search term
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");
    const query = {
      name: { $regex: search, $options: "i" },
    };
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .populate("brand", "name");

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsByBrand = async (req, res) => {
  console.log("GetProductsByBrand Controller");
  try {
    const search = req.query.search || "";
    // console.log(search);

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const brandId = req.params.brandId;
    console.log(brandId);

    // Find products matching the search query
    const products = await Product.find(query).where("brand").equals(brandId);

    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getProductDetails = async (req, res) => {
  console.log("productsController GetProductDetails");
  try {
    const prodId = req.params.prodId;
    console.log(prodId);
    const product = await Product.findById(prodId)
      .populate("category", "name")
      .populate("brand", "name");

    // console.log(product);

    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  console.log("createProduct Controller");
  console.log(req.body);
  // console.log(req.body.series);
  try {
    const products = await Product.find({ brand: req.body.brand });
    const productBrand = await Brand.findById(req.body.brand);
    const productCategory = await Category.findById(req.body.category);
    const conditionsList = await Condition.find({
      category: req.body.category,
    });
    const conditionLabelsList = await ConditionLabel.find({
      category: req.body.category,
    });

    console.log("productCategory", productCategory);

    if (products.length > 0) {
      let duplicate = false;

      products.map((product) => {
        // console.log(product.name);
        if (product.name.toLowerCase() === req.body.name.toLowerCase()) {
          duplicate = true;
        }
      });
      console.log(duplicate);

      if (duplicate == false) {
        // TESTING

        // Create Product
        let product = await Product.create({
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
          category: req.body.category,
          brand: req.body.brand,
          variants: req.body.variants,
          status: req.body.status,
          ...(req.body.series !== null && { series: req.body.series }),
        });
        await product.save();

        let deductionsList;

        if (productCategory.name !== "Mobile") {
          console.log("Others Deductions");
          // let deductions = [
          let deductions = [
            {
              conditionId: "",
              conditionName: "",
              conditionLabels: [
                {
                  conditionLabelId: "",
                  conditionLabel: "",
                  conditionLabelImg: "",
                },
              ],
            },
          ];

          deductionsList = await createOthersDeductions(
            deductions,
            conditionsList,
            conditionLabelsList
          );

          console.log("New deductions for Others: ", deductionsList);
          product.simpleDeductions = deductionsList;
        } else if (productCategory.name === "Mobile") {
          console.log("Mobiles Deductions");
          deductionsList = await createDeductions(
            product.variants,
            conditionsList,
            conditionLabelsList
          );

          console.log("New deductions for Mobile: ", deductionsList);
          product.variantDeductions = deductionsList;
        }

        // let deductionsList = await createDeductions(
        //   product.variants,
        //   conditionsList,
        //   conditionLabelsList
        // );

        await product.save();

        // push the new product into its brand's products array & save
        productBrand.products.push(product);
        productBrand.save();

        res.status(200).json(product);
      } else if (duplicate == true) {
        // TODO Task, Unique Name Validation not working
        res.status(200).send({
          success: false,
          data: "Duplicate productName",
          message: "Product " + req.body.name + " already exist ",
        });
      }
    } else {
      // let product = await Product.create({
      //   name: req.body.name,
      //   uniqueURL: req.body.uniqueURL,
      //   image: req.body.image,
      //   category: req.body.category,
      //   brand: req.body.brand,
      //   variants: req.body.variants,
      //   deductions: deductionsList,
      //   status: req.body.status,
      //   ...(req.body.series !== null && { series: req.body.series }),
      // });

      console.log(".");
      // Create Product
      let product = await Product.create({
        name: req.body.name,
        uniqueURL: req.body.uniqueURL,
        image: req.body.image,
        category: req.body.category,
        brand: req.body.brand,
        variants: req.body.variants,
        status: req.body.status,
        ...(req.body.series !== null && { series: req.body.series }),
      });
      await product.save();

      let deductionsList;

      if (productCategory.name !== "Mobile") {
        console.log("Others Deductions");
        // let deductions = [
        let deductions = [
          {
            conditionId: "",
            conditionName: "",
            conditionLabels: [
              {
                conditionLabelId: "",
                conditionLabel: "",
                conditionLabelImg: "",
              },
            ],
          },
        ];

        deductionsList = await createOthersDeductions(
          deductions,
          conditionsList,
          conditionLabelsList
        );

        console.log("New deductions for Others: ", deductionsList);

        // Add deductions to the product
        product.simpleDeductions = deductionsList;
      } else if (productCategory.name === "Mobile") {
        console.log("Mobiles Deductions");
        deductionsList = await createDeductions(
          product.variants,
          conditionsList,
          conditionLabelsList
        );

        console.log("New deductions for Mobile: ", deductionsList);

        // Add deductions to the product
        product.variantDeductions = deductionsList;
      }

      await product.save();

      // push the new product into its brand's products array & save
      productBrand.products.push(product);
      productBrand.save();

      res.status(200).json(product);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  console.log("updateProduct Controller");
  // console.log(req.body);
  // const prodId = req.params.prodId;
  const productId = req.params.productId;
  console.log("productId", req.params);
  // console.log("New Variants: ", req.body.variants);
  // console.log("Old Variants: ", req.body.oldVariants);

  try {
    // const products = await Product.find({ brand: req.body.brand });
    // Query to find products with the given brand excluding the product with the specified productId
    const products = await Product.find({
      brand: req.body.brand,
      _id: { $ne: productId }, // Exclude the product with the specified productId
    });
    console.log("remaining products", products);

    const productCategory = await Category.findById(req.body.category);
    console.log("productCategory", productCategory);
    const conditionsList = await Condition.find({
      category: req.body.category,
    });
    const conditionLabelsList = await ConditionLabel.find({
      category: req.body.category,
    });

    if (products.length > 0) {
      let duplicate = false;

      products.map((product) => {
        // console.log(typeof product.name);
        if (product.name.toLowerCase() === req.body.name.toLowerCase()) {
          duplicate = true;
        }
      });
      console.log("duplicate", duplicate);

      if (duplicate == false) {
        // // Update the variantName property in the deductions array
        // updatedProduct.deductions.forEach((deduction, index) => {
        //   deduction.variantName = req.body.variants[index].name;
        // });

        // // Save the updated product with modified deductions
        // await updatedProduct.save();

        // Retrieve the current product including its variants
        let product = await Product.findById(productId);

        // console.log("product", product);
        // Update the name, uniqueURL, and image fields
        product.name = req.body.name;
        product.uniqueURL = req.body.uniqueURL;
        product.image = req.body.image;

        // Extract new and old variants from req.body
        const newVariants = req.body.variants;
        const oldVariants = product.variants;
        console.log("newVariants", newVariants);
        console.log("oldVariants", oldVariants);

        // Updating Variant based on Product Category
        if (productCategory.name !== "Mobile") {
          console.log("NON Mobile product");
          product.variants[0].price = newVariants[0].price;
          await product.save();
        } else if (productCategory.name === "Mobile") {
          console.log("Mobile product");
          // Update existing variants, add new variants, and remove deleted variants
          const updatedProduct = await updateVariants(
            product,
            newVariants,
            oldVariants,
            req.body.oldVariants,
            conditionsList,
            conditionLabelsList
          );
        }

        res.status(200).json(product);
      } else if (duplicate == true) {
        // TODO Task, Unique Name Validation not working
        res.status(200).send({
          success: false,
          data: "Duplicate productName",
          message: "Product name " + req.body.name + " already exists",
        });
      }
    } else {
      console.log("ELSE");
      // let updatedProduct = await Product.findByIdAndUpdate(productId, {
      //   name: req.body.name,
      //   uniqueURL: req.body.uniqueURL,
      //   image: req.body.image,
      //   variants: req.body.variants,
      // });
      // updatedProduct.save();

      // Retrieve the current product including its variants
      let product = await Product.findById(productId);
      // console.log("product", product);

      // Update the name, uniqueURL, and image fields
      product.name = req.body.name;
      product.uniqueURL = req.body.uniqueURL;
      product.image = req.body.image;

      // Extract new and old variants from req.body
      const newVariants = req.body.variants;
      const oldVariants = product.variants;
      console.log("newVariants", newVariants);
      console.log("oldVariants", oldVariants);

      let updatedProduct;

      if (productCategory.name !== "Mobile") {
        console.log("NON Mobile product");
        product.variants[0].price = newVariants[0].price;
        await product.save();
      } else if (productCategory.name === "Mobile") {
        console.log("Mobile product");
        // Update existing variants, add new variants, and remove deleted variants
        updatedProduct = await updateVariants(
          product,
          newVariants,
          oldVariants,
          req.body.oldVariants,
          conditionsList,
          conditionLabelsList
        );
      }

      res.status(200).json(product);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  console.log("DeleteProduct Controller");
  const productId = req.params.productId;
  // console.log(productId);

  const deletedProduct = await Product.findByIdAndDelete(productId);
  // console.log(deletedProduct);

  const brand = await Brand.findById(deletedProduct.brand);
  // console.log(brand);
  brand.products.pull(productId);
  await brand.save();

  // Delete the corresponding image file from the uploads folder
  const __dirname = path.resolve();
  const imagePath = path.join(__dirname, deletedProduct.image);
  console.log("imagePath", deletedProduct.image);

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

  // try {
  //   fs.unlink(imagePath, (err) => {
  //     if (err) {
  //       console.error("Error deleting image:", err);
  //       return res.status(201).json({ message: "Error deleting image" });
  //     }
  //   });
  //   // fs.unlink(imagePath);
  //   // console.log("Image deleted successfully");
  // } catch (err) {
  //   if (err.code === "ENOENT") {
  //     // Handle the case where the file doesn't exist
  //     console.log(`Image ${imagePath} does not exist.`);
  //   } else {
  //     // Handle other errors
  //     console.error(`Error deleting image ${imagePath}:`, err);
  //   }
  // }

  res.status(200).json({ data: deletedProduct });
};

// update Product's Deductions PRICEDROP value for a single Product
export const updatePriceDrop = async (req, res) => {
  console.log("updatePriceDrop Controller");
  const productId = req.params.productId;
  console.log(productId);
  let updatedProductData = req.body;
  console.log("updatedProductsData", updatedProductData);

  updatedProductData = {
    ...updatedProductData,
    category: updatedProductData.category.id,
    brand: updatedProductData.brand.id,
  };

  // console.log("After updatedProductData", updatedProductData);
  updatedProductData.variantDeductions.map((vd) => {
    // console.log(vd);
    vd.deductions.map((d) => {
      console.log(d);
    });
  });

  try {
    // Update the product with the complete updated data
    await Product.findByIdAndUpdate(productId, updatedProductData, {
      new: true,
    });

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// FUNCTIONS SECTION
// Async function to create deductions
const createDeductions = async (
  variants,
  conditionsList,
  conditionLabelsList
) => {
  console.log("Creating variant deductions for Mobile Products", variants);
  const promises = variants.map(async (variant) => {
    const variantDeductions = [];

    for (const condition of conditionsList) {
      const conditionLabels = conditionLabelsList
        .filter((label) => label.conditionNameId == condition.id)
        .map((label) => ({
          conditionLabelId: label.id,
          conditionLabel: label.conditionLabel,
          conditionLabelImg: label.conditionLabelImg,
          priceDrop: 0,
          operation: "Subtrack",
        }));

      variantDeductions.push({
        conditionId: condition.id,
        conditionName: condition.conditionName,
        page: condition.page,
        conditionLabels,
      });
    }

    return {
      variantId: variant._id,
      variantName: variant.name,
      deductions: variantDeductions,
    };
  });

  return Promise.all(promises);
};

const createOthersDeductions = async (
  deductions,
  conditionsList,
  conditionLabelsList
) => {
  console.log("createOthersDeductions", deductions);
  // Map conditions and condition labels to deductions array
  deductions = conditionsList.map((condition) => ({
    conditionId: condition.id,
    conditionName: condition.conditionName,
    page: condition.page,
    conditionLabels: conditionLabelsList
      .filter((label) => label.conditionNameId == condition.id)
      .map((label) => ({
        conditionLabelId: label.id,
        conditionLabel: label.conditionLabel,
        conditionLabelImg: label.conditionLabelImg,
        operation: "Subtrack",
        // priceDrop: 0, // Default price drop, can be updated later
      })),
  }));

  return Promise.all(deductions);
};

const updateVariants = async (
  product,
  newVariants,
  oldVariants,
  reqOldVariants,
  conditionsList,
  conditionLabelsList
) => {
  console.log("Updating variant for Mobile Category");
  // Remove deleted variants
  oldVariants.forEach((oldVariant, index) => {
    const variantExists = newVariants.some(
      (v) => v.variantId === oldVariant._id.toString()
    );
    if (!variantExists) {
      // Variant not found in new variants, remove it from product's variants
      product.variants.splice(index, 1);
      console.log("removed", product.variants);
      // await product.save();
      product.variantDeductions.splice(index, 1);
      console.log("product variantDeductions variant removed");
    }
    // const varId = product.variantDeductions[index].id;
    // console.log("varId", varId);
    // const varDedExists = product.variants.map
  });
  await product.save();

  // Update variant OR Add new variant to product's variants
  for (const newVariant of newVariants) {
    const existingVariant = oldVariants.find(
      (v) => v._id.toString() === newVariant.variantId
    );
    console.log("existingVariant", existingVariant);

    const newVariantExists = newVariant.variantId === "New";
    console.log("newVariantExists: ", newVariantExists);

    if (existingVariant) {
      product.variantDeductions.map((vd) => {
        if (vd.variantName === existingVariant.name) {
          vd.variantName = newVariant.name;
        }
      });

      // Update existing variant's name and price
      existingVariant.name = newVariant.name;
      existingVariant.price = newVariant.price;
    } else if (newVariantExists) {
      // Add new variant to product's variants
      product.variants.push({
        name: newVariant.name,
        price: newVariant.price,
      });
      // console.log("oldvariants", oldVariants);

      // await product.save();
      console.log("Push", product.variants);
    }
  }
  await product.save();

  // Find new variants
  const newVariantsNames = product.variants.map((variant) => variant.name);
  const oldVariantsNames = reqOldVariants.map((variant) => variant.name);
  console.log("newVariantsNames", newVariantsNames);
  console.log("oldVariantsNames", oldVariantsNames);
  console.log("reqOldVariants", reqOldVariants);

  const newVariantsList = product.variants.filter(
    (variant) => !oldVariantsNames.includes(variant.name)
  );

  // await newVariantsList.map((nv) => (nv.variantId = String(nv.variantId)));

  console.log("New Variants:", newVariantsList);

  if (newVariantsList.length > 0) {
    let deductionsList;
    console.log("adding new variant to deductions");

    // Add new Variant to variantDeductions
    deductionsList = await addNewDeduction(
      // product.variants,
      newVariantsList,
      conditionsList,
      conditionLabelsList
    );

    console.log("New deductions for Mobile: ", deductionsList);

    // Add deductions to the product
    // product.variantDeductions = deductionsList;
    deductionsList.map((d) => product.variantDeductions.push(d));
  }
  await product.save();
};

const addNewDeduction = async (
  variants,
  conditionsList,
  conditionLabelsList
) => {
  console.log("Adding new variant deductions for Mobile Product", variants);
  const promises = variants.map(async (variant) => {
    const variantDeductions = [];

    for (const condition of conditionsList) {
      const conditionLabels = conditionLabelsList
        .filter((label) => label.conditionNameId == condition.id)
        .map((label) => ({
          conditionLabelId: label.id,
          conditionLabel: label.conditionLabel,
          conditionLabelImg: label.conditionLabelImg,
          priceDrop: 0,
          operation: "Subtrack",
        }));

      variantDeductions.push({
        conditionId: condition.id,
        conditionName: condition.conditionName,
        page: condition.page,
        conditionLabels,
      });
    }

    return {
      variantId: variant._id,
      // variantId: String(variant._id),
      variantName: variant.name,
      deductions: variantDeductions,
    };
  });

  return Promise.all(promises);
};

import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";

import Processor from "../models/processorModel.js";
import { getCategoryType } from "../utils/helper.js";
import { APPLE } from "../constants/general.js";
import { slugify } from "../utils/slugify.js";
import { deleteImage } from "../utils/deleteImage.js";

export const getAllProducts = async (req, res) => {
  console.log("getAllProducts Controller");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) < 10 ? 20 : parseInt(req.query.limit);
  const search = req.query.search || "";
  const categoryId = req.query.categoryId || "";

  try {
    // Escape special characters in the search term
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");
    const query = {
      name: { $regex: search, $options: "i" },
      ...(categoryId ? { category: categoryId } : {}), // Add category only if categoryId exists
    };

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .select("-processorBasedDeduction -simpleDeductions")
      .populate("category", "name image categoryType uniqueURL")
      .populate("brand", "name image uniqueURL");

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
  const { brandUniqueURL } = req.params;
  console.log("brandUniqueURL:", brandUniqueURL);

  try {
    // 1. Find brand by slug
    const brand = await Brand.findOne({ uniqueURL: brandUniqueURL });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // 2. Use brand._id to find products
    const products = await Product.find({ brand: brand._id })
      .select("-processorBasedDeduction -variantDeductions -simpleDeductions")
      .populate("category", "-brands -createdAt -updatedAt")
      .populate("brand", "-products -series -createdAt -updatedAt");

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by brand slug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductDetails = async (req, res) => {
  console.log("productsController GetProductDetails");
  try {
    const { productUniqueURL } = req.params;
    // console.log("GetProductDetails productUniqueURL", productUniqueURL);
    // const product = await Product.findById(prodId)
    const product = await Product.findOne({ uniqueURL: productUniqueURL })
      .populate("category", "-brands -createdAt -updatedAt")
      .populate("brand", "-products -series -createdAt -updatedAt");

    // console.log("GetProductDetails product", product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  console.log("createProduct Controller");
  const { name, brand, category, image, uniqueURL, variants, status, series } =
    req.body;

  const refinedUniqueURL = slugify(uniqueURL);

  try {
    const [
      existingProducts,
      productBrand,
      productCategory,
      conditionsList,
      conditionLabelsList,
    ] = await Promise.all([
      Product.find({ brand }),
      Brand.findById(brand),
      Category.findById(category),
      Condition.find({ category }),
      ConditionLabel.find({ category }),
    ]);

    // const isMobile = productCategory.name === MOBILE;

    const { MULTI_VARIANTS, PROCESSOR_BASED } = await getCategoryType(
      productCategory
    );

    const isDuplicate = existingProducts.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(200).send({
        success: false,
        data: "Duplicate productName",
        message: `Product ${name} already exists`,
      });
    }

    const product = new Product({
      name,
      uniqueURL: refinedUniqueURL,
      image,
      category,
      brand,
      variants,
      status,
      ...(series && { series }),
      // ...(req.body.series !== null && { series: req.body.series }),
    });

    if (existingProducts.length > 0) {
      // if (isLaptopDesktop(productCategory.name)) {
      if (PROCESSOR_BASED) {
        console.log(
          "Creating PROCESSOR_BASED with deductions from existing product"
        );

        // TODO: Need to update this code for a first laptop product to create initial simpleDeduction & initial processorBasedDeduction

        const existingLaptop = await Product.findOne({ category, brand });
        if (existingLaptop) {
          product.simpleDeductions = existingLaptop.simpleDeductions;
          product.processorBasedDeduction =
            existingLaptop.processorBasedDeduction;
        } else {
          console.log("No existing laptop/desktop to copy deductions from");
        }
      } else if (MULTI_VARIANTS) {
        console.log("Creating MULTI_VARIANTS with variant deductions");
        product.variantDeductions = await createDeductions(
          variants,
          conditionsList,
          conditionLabelsList
        );
      } else {
        console.log("Creating Other product type with simple deductions");
        product.simpleDeductions = await createOthersDeductions(
          [
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
          ],
          conditionsList,
          conditionLabelsList
        );
      }
    } else {
      console.log(`Creating First Product for brand: ${productBrand.name}`);
      // if (isLaptopDesktop(productCategory.name)) {
      if (PROCESSOR_BASED) {
        const isApple = productBrand.name === APPLE;

        if (isApple) {
          const appleProd = await Product.findOne({ category, brand });
          if (appleProd) {
            product.simpleDeductions = appleProd.simpleDeductions;
            product.processorBasedDeduction = appleProd.processorBasedDeduction;
          }
        } else {
          const appleBrand = await Brand.findOne({
            category,
            name: APPLE,
          }).select("category name _id");

          const windowsProd = await Product.findOne({
            category,
            brand: { $ne: appleBrand._id },
          });

          if (windowsProd) {
            product.simpleDeductions = windowsProd.simpleDeductions;
            product.processorBasedDeduction =
              windowsProd.processorBasedDeduction;
          }
        }
      } else if (MULTI_VARIANTS) {
        product.variantDeductions = await createDeductions(
          variants,
          conditionsList,
          conditionLabelsList
        );
      } else {
        console.log("Simple Deductions for all other products");
        product.simpleDeductions = await createOthersDeductions(
          [
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
          ],
          conditionsList,
          conditionLabelsList
        );
      }
    }

    await product.save();
    productBrand.products.push(product);
    await productBrand.save();

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error while creating a product:", error);
    res.status(404).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  console.log("updateProduct Controller");
  console.log(req.body);

  const productSlug = req.params.productSlug;
  console.log("productSlug", productSlug);

  try {
    const [productCategory, conditionsList, conditionLabelsList] =
      await Promise.all([
        Category.findById(req.body.category),
        Condition.find({ category: req.body.category }),
        ConditionLabel.find({ category: req.body.category }),
      ]);

    const products = await Product.find({
      brand: req.body.brand,
      _id: { $ne: req.body.productID },
    });

    const isDuplicate = products.some(
      (p) => p.name.toLowerCase() === req.body.name.toLowerCase()
    );

    console.log("isDuplicate", isDuplicate);

    if (isDuplicate) {
      return res.status(200).send({
        success: false,
        data: "Duplicate productName",
        message: `Product name ${req.body.name} already exists`,
      });
    }

    // const product = await Product.findById(productSlug);
    const product = await Product.findOne({ uniqueURL: productSlug });

    const { variants: newVariants, oldVariants: oldVariantsFromBody } =
      req.body;
    const oldVariants = product.variants;

    // Update shared fields
    product.name = req.body.name;
    product.uniqueURL = req.body.uniqueURL;
    product.image = req.body.image;
    product.status = req.body.status;

    const { MULTI_VARIANTS, PROCESSOR_BASED } = await getCategoryType(
      productCategory
    );

    // if (productCategory.name !== MOBILE) {
    if (!MULTI_VARIANTS) {
      product.variants[0].price = newVariants[0].price;
      await product.save();
    } else {
      await updateVariants(
        product,
        newVariants,
        oldVariants,
        oldVariantsFromBody,
        conditionsList,
        conditionLabelsList
      );
      await product.save();
    }

    // await product.save();

    console.log("product", product);

    res.status(200).json(product);
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
  deleteImage(deletedProduct.image);

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

export const getProcessorDeductions = async (req, res) => {
  console.log("productsController getProcessorDeductions");
  try {
    const processorId = req.params.processorId;
    const from = req.query.from; // Access the "from" query parameter

    // console.log("Processor ID:", processorId);

    if (from == "finalPriceCal") {
      console.log("resulting for", from);
      const processorName = req.params.processorId;
      const category = req.query.category; // Access the "category" query parameter
      // console.log("Category:", category);

      const processor = await Processor.findOne({
        category: category,
        processorName: processorName,
      }).populate("category", "name");

      res.status(200).json(processor);
      return;
    }

    const processor = await Processor.findOne({
      processorId: processorId,
    }).populate("category", "name");

    // console.log(processor);

    res.status(200).json(processor);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getAllProcessorDeductions = async (req, res) => {
  console.log("productsController getAllProcessorDeductions");
  try {
    const processors = await Processor.find().populate("category", "name");

    // console.log(processors);

    res.status(200).json(processors);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Check Empty Pricing
export const checkEmptyPricing = async (req, res) => {
  console.log("productsController checkEmptyPricing");

  try {
    const MIN_ZERO_PRICING = 4; // Define the threshold

    // MongoDB Aggregation Pipeline
    const pipeline = [
      { $unwind: "$variantDeductions" },
      { $unwind: "$variantDeductions.deductions" },
      { $unwind: "$variantDeductions.deductions.conditionLabels" },
      {
        $match: {
          "variantDeductions.deductions.conditionLabels.priceDrop": { $lte: 0 },
        },
      },
      {
        $group: {
          _id: {
            productName: "$name",
            variantName: "$variantDeductions.variantName",
          },
          zeroOrNegativeCount: { $sum: 1 },
        },
      },
      {
        $match: {
          zeroOrNegativeCount: { $gt: MIN_ZERO_PRICING },
        },
      },
      {
        $group: {
          _id: "$_id.productName",
          variants: { $push: "$_id.variantName" },
        },
      },
      {
        $project: {
          _id: 0,
          productName: "$_id",
          variants: 1,
        },
      },
    ];

    const products = await Product.aggregate(pipeline);
    console.log(products.length);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in checkEmptyPricing:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
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
        keyword: condition?.keyword,
        description: condition?.description,
        isMandatory: condition?.isMandatory,
        isYesNoType: condition?.isYesNoType,
        multiSelect: condition?.multiSelect,
        showLabelsImage: condition?.showLabelsImage,
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
  // Map conditions and condition labels to deductions array
  deductions = conditionsList.map((condition) => ({
    conditionId: condition.id,
    conditionName: condition.conditionName,
    page: condition.page,
    description: condition?.description,
    keyword: condition?.keyword,
    isMandatory: condition?.isMandatory,
    isYesNoType: condition?.isYesNoType,
    multiSelect: condition?.multiSelect,
    showLabelsImage: condition?.showLabelsImage,
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
  console.log("createOthersDeductions", deductions);

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
        keyword: condition?.keyword,
        description: condition?.description,
        isMandatory: condition?.isMandatory,
        isYesNoType: condition?.isYesNoType,
        multiSelect: condition?.multiSelect,
        showLabelsImage: condition?.showLabelsImage,
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

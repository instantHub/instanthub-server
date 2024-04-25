import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";
import path from "path";
import fs from "fs";

// export const getAllProducts = async (req, res) => {
//   console.log("getAllProducts Controller");
//   // const { product, category, filter } = req.query;
//   const search = req.query.search || "";
//   const limit = req.query.limit || "";
//   console.log("search", search);
//   console.log("limit", limit);

//   console.log("req.params", req.query);

//   const query = {
//     name: { $regex: search, $options: "i" },
//   };

//   try {
//     const products = await Product.find(query)
//       .limit(limit)
//       .populate("category", "name")
//       .populate("brand", "name");
//     // console.log(products);

//     res.status(200).json(products);
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

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

    console.log(product);

    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  console.log("createProduct Controller");
  console.log(req.body);
  console.log(req.body.series);
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

    if (products.length > 0) {
      let duplicate = false;

      products.map((product) => {
        // console.log(typeof product.name);
        if (product.name.toLowerCase() === req.body.name.toLowerCase()) {
          duplicate = true;
        }
      });
      console.log(duplicate);

      if (duplicate == false) {
        let deductions = [
          {
            conditionName: "",
            conditionLabels: [
              {
                conditionLabel: "",
                conditionLabelImg: "",
              },
            ],
          },
        ];

        // Map conditions and condition labels to deductions array
        deductions = conditionsList.map((condition) => ({
          conditionId: condition.id,
          conditionName: condition.conditionName,
          conditionLabels: conditionLabelsList
            .filter((label) => label.conditionNameId == condition.id)
            .map((label) => ({
              conditionLabelId: label.id,
              conditionLabel: label.conditionLabel,
              conditionLabelImg: label.conditionLabelImg,
              // priceDrop: 0, // Default price drop, can be updated later
            })),
        }));

        console.log("deductions", deductions);

        let product = await Product.create({
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
          category: req.body.category,
          brand: req.body.brand,
          variants: req.body.variants,
          deductions: deductions,
          ...(req.body.series !== null && { series: req.body.series }),
        });
        product.save();

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
      let deductions = [
        {
          conditionName: "",
          conditionLabels: [
            {
              conditionLabel: "",
              conditionLabelImg: "",
            },
          ],
        },
      ];

      // Map conditions and condition labels to deductions array
      deductions = conditionsList.map((condition) => ({
        conditionId: condition.id,
        conditionName: condition.conditionName,
        conditionLabels: conditionLabelsList
          .filter((label) => label.conditionNameId == condition.id)
          .map((label) => ({
            conditionLabelId: label.id,
            conditionLabel: label.conditionLabel,
            conditionLabelImg: label.conditionLabelImg,
            // priceDrop: 0, // Default price drop, can be updated later
          })),
      }));

      let product = await Product.create({
        name: req.body.name,
        uniqueURL: req.body.uniqueURL,
        image: req.body.image,
        category: req.body.category,
        brand: req.body.brand,
        variants: req.body.variants,
        deductions: deductions,
      });
      product.save();

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
  // const prodId = req.params.prodId;
  const productId = req.params.productId;
  console.log("productId", req.params);
  // console.log(req.body);

  try {
    // const products = await Product.find({ brand: req.body.brand });
    // Query to find products with the given brand excluding the product with the specified productId
    const products = await Product.find({
      brand: req.body.brand,
      _id: { $ne: productId }, // Exclude the product with the specified productId
    });
    console.log(products);

    if (products.length > 0) {
      let duplicate = false;

      products.map((product) => {
        // console.log(typeof product.name);
        if (product.name.toLowerCase() === req.body.name.toLowerCase()) {
          duplicate = true;
        }
      });
      console.log(duplicate);

      if (duplicate == false) {
        let updatedProduct = await Product.findByIdAndUpdate(productId, {
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
          variants: req.body.variants,
        });
        updatedProduct.save();

        res.status(200).json(updatedProduct);
      } else if (duplicate == true) {
        // TODO Task, Unique Name Validation not working
        res.status(200).send({
          success: false,
          data: "Duplicate productName",
          message: "Product name " + req.body.name + " already exists",
        });
      }
    } else {
      let updatedProduct = await Product.findByIdAndUpdate(productId, {
        name: req.body.name,
        uniqueURL: req.body.uniqueURL,
        image: req.body.image,
        variants: req.body.variants,
      });
      updatedProduct.save();

      res.status(200).json(updatedProduct);
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
  // console.log("updatedProductsData", updatedProductData);

  updatedProductData = {
    ...updatedProductData,
    category: updatedProductData.category.id,
    brand: updatedProductData.brand.id,
  };

  // console.log("After updatedProductData", updatedProductData);

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

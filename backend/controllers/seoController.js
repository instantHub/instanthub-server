import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

export const updateCategoryMetaTags = async (req, res) => {
  try {
    const { uniqueURL } = req.params;

    const existingCategory = await Category.findOne({ uniqueURL });
    if (!existingCategory) {
      return res.status(404).json({ msg: `Category doesn't exist.` });
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { uniqueURL },
      {
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        metaKeywords: req.body.metaKeywords,
        canonicalUrl: req.body.canonicalUrl,
      },
      { new: true }
    );

    return res.status(200).json(updatedCategory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateBrandMetaTags = async (req, res) => {
  try {
    const { uniqueURL } = req.params;

    const existingBrand = await Brand.findOne({ uniqueURL });
    if (!existingBrand) {
      return res.status(404).json({ msg: `Brand doesn't exist.` });
    }

    const updatedBrand = await Brand.findOneAndUpdate(
      { uniqueURL },
      {
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        metaKeywords: req.body.metaKeywords,
        canonicalUrl: req.body.canonicalUrl,
      },
      { new: true }
    );

    return res.status(200).json(updatedBrand);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProductMetaTags = async (req, res) => {
  try {
    const { uniqueURL } = req.params;

    const existingProduct = await Product.findOne({ uniqueURL });
    if (!existingProduct) {
      return res.status(404).json({ msg: `Product doesn't exist.` });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { uniqueURL },
      {
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        metaKeywords: req.body.metaKeywords,
        canonicalUrl: req.body.canonicalUrl,
      },
      { new: true }
    );

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

import {
  ServiceCategory,
  ServiceBrand,
  ServiceProblem,
} from "../../models/servicesModel.js";
import { deleteImage } from "../../utils/deleteImage.js";

// ============ Category ============

export const createCategory = async (req, res) => {
  try {
    const category = new ServiceCategory(req.body);
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllCategories = async (_req, res) => {
  try {
    const categories = await ServiceCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updated = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updated) return res.status(404).json({ error: "Category not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await ServiceCategory.findByIdAndDelete(
      req.params.id
    );

    if (!deletedCategory)
      return res.status(404).json({ error: "Category not found" });

    deleteImage(deletedCategory.image);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============ Brand ============

export const createBrand = async (req, res) => {
  try {
    const brand = await ServiceBrand.create(req.body);
    await brand.save();
    res.status(201).json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBrandByCategory = async (req, res) => {
  console.log("getBrandByCategory controller");
  try {
    const { categoryId } = req.params; // ✅ correctly destructure
    console.log("categoryId", categoryId);

    const brands = await ServiceBrand.find({ serviceCategoryId: categoryId });

    res.json(brands);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getBrandById = async (req, res) => {
  try {
    const brand = await ServiceBrand.findById(req.params.id).populate(
      "serviceCategoryId"
    );
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const updated = await ServiceBrand.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updated) return res.status(404).json({ error: "Brand not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const deletedBrand = await ServiceBrand.findByIdAndDelete(req.params.id);

    if (!deletedBrand)
      return res.status(404).json({ error: "Brand not found" });

    deleteImage(deletedBrand.image);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============ Problem ============

export const createProblem = async (req, res) => {
  try {
    const problem = await ServiceProblem(req.body);
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getProblemsByCategory = async (req, res) => {
  console.log("getProblemsByCategory controller");
  try {
    const { categoryId } = req.params;
    console.log("categoryId", categoryId);

    const problems = await ServiceProblem.find({
      serviceCategoryId: categoryId,
    });

    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const problem = await ServiceProblem.findById(req.params.id).populate(
      "serviceCategoryId"
    );
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const updated = await ServiceProblem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updated) return res.status(404).json({ error: "Problem not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const deletedProblem = await ServiceProblem.findByIdAndDelete(
      req.params.id
    );
    if (!deletedProblem)
      return res.status(404).json({ error: "Problem not found" });

    deleteImage(deletedProblem.image);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

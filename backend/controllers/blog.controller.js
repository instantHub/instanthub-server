import Blog from "../models/blog.model.js";
import { deleteImage } from "../utils/deleteImage.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { slugify } from "../utils/slugify.js";

// Create new blog
export const createBlog = async (req, res) => {
  console.log("createBlog controller");

  try {
    const { slug, seo, content, status } = req.body;
    console.log("req.body", req.body);

    // Parse JSON fields if they're strings (from form-data)
    const parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;

    // Generate slug if not provided
    const finalSlug = slug || slugify(parsedContent.title);

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: finalSlug });
    if (existingBlog) {
      // Delete uploaded image if slug exists
      if (req.files?.featuredImage?.[0]) {
        deleteImage(req.files.featuredImage[0].path);
      }
      return errorResponse(res, "Blog with this slug already exists", 400);
    }

    // Handle featured image upload
    let featuredImagePath = parsedContent.featuredImage || null;
    console.log("featuredImagePath 1", featuredImagePath);

    if (req.files?.featuredImage?.[0]) {
      // Store relative path
      featuredImagePath = `/uploads/blogs/${req.files.featuredImage[0].filename}`;
    }
    console.log("featuredImagePath 2", featuredImagePath);

    // Create blog
    const blog = new Blog({
      slug: finalSlug,
      seo: parsedSeo,
      content: {
        ...parsedContent,
        featuredImage: featuredImagePath,
      },
      status: status || "draft",
      author: req.user._id,
    });

    await blog.save();

    return successResponse(res, "Blog created successfully", blog, 201);
  } catch (error) {
    console.error("Create blog error:", error);

    // Clean up uploaded file if error occurs
    if (req.files?.featuredImage?.[0]) {
      deleteImage(req.files.featuredImage[0].path);
    }

    return errorResponse(res, error.message, 500);
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  console.log("updateBlog controller");

  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Parse JSON fields if they're strings (from form-data)
    if (typeof updateData.seo === "string") {
      updateData.seo = JSON.parse(updateData.seo);
    }
    if (typeof updateData.content === "string") {
      updateData.content = JSON.parse(updateData.content);
    }

    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      // Delete uploaded image if blog doesn't exist
      if (req.files?.featuredImage?.[0]) {
        deleteImage(req.files.featuredImage[0].path);
      }
      return errorResponse(res, "Blog not found", 404);
    }

    // Check if slug is being updated and if it's unique
    if (updateData.slug && updateData.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug: updateData.slug });
      if (existingBlog) {
        // Delete uploaded image if slug exists
        if (req.files?.featuredImage?.[0]) {
          deleteImage(req.files.featuredImage[0].path);
        }
        return errorResponse(res, "Blog with this slug already exists", 400);
      }
    }

    // Handle featured image upload
    if (req.files?.featuredImage?.[0]) {
      // Delete old featured image if exists
      if (blog.content?.featuredImage) {
        deleteImage(blog.content?.featuredImage);
      }

      // Set new featured image path
      const newImagePath = `/uploads/blogs/${req.files.featuredImage[0].filename}`;

      if (updateData.content) {
        updateData.content.featuredImage = newImagePath;
      } else {
        updateData.content = {
          ...blog.content.toObject(),
          featuredImage: newImagePath,
        };
      }
    } else {
      // CRITICAL FIX: Preserve existing featured image if no new image is uploaded
      if (updateData.content && blog.content?.featuredImage) {
        // If content is being updated but no new image provided, preserve the old one
        if (!updateData.content.featuredImage) {
          updateData.content.featuredImage = blog.content.featuredImage;
        }
      }
    }

    // console.log("updateData content", updateData.content.featuredImage);
    // console.log("existing blog", blog);

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("author", "name email");

    // console.log("updatedBlog", updatedBlog);

    return successResponse(res, "Blog updated successfully", updatedBlog);
  } catch (error) {
    console.error("Update blog error:", error);

    // Clean up uploaded file if error occurs
    if (req.files?.featuredImage?.[0]) {
      deleteImage(req.files.featuredImage[0].path);
    }

    return errorResponse(res, error.message, 500);
  }
};

// Get all blogs with pagination and filters
export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      tags,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (tags) {
      query["content.tags"] = { $in: tags.split(",") };
    }

    if (search) {
      query.$or = [
        { "content.title": { $regex: search, $options: "i" } },
        { "content.leadParagraph": { $regex: search, $options: "i" } },
        { "seo.metaTitle": { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "desc" ? -1 : 1;

    // Execute query
    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Blog.countDocuments(query);

    return successResponse(res, "Blogs retrieved successfully", {
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all blogs error:", error);
    return errorResponse(res, error.message, 500);
  }
};

// Get single blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug })
      .populate("author", "name email")
      .lean();

    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }

    // Increment views (async, don't wait)
    Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: false }
    ).exec();

    return successResponse(res, "Blog retrieved successfully", blog);
  } catch (error) {
    console.error("Get blog by slug error:", error);
    return errorResponse(res, error.message, 500);
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate("author", "name email")
      .lean();

    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }

    return successResponse(res, "Blog retrieved successfully", blog);
  } catch (error) {
    console.error("Get blog by ID error:", error);
    return errorResponse(res, error.message, 500);
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }

    // Delete associated featured image
    if (blog.content?.featuredImage) {
      deleteImage(blog.content.featuredImage);
    }

    return successResponse(res, "Blog deleted successfully", { id });
  } catch (error) {
    console.error("Delete blog error:", error);
    return errorResponse(res, error.message, 500);
  }
};

// Publish blog
export const publishBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        status: "published",
        publishedAt: new Date(),
      },
      { new: true }
    ).populate("author", "name email");

    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }

    return successResponse(res, "Blog published successfully", blog);
  } catch (error) {
    console.error("Publish blog error:", error);
    return errorResponse(res, error.message, 500);
  }
};

// Archive blog
export const archiveBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    ).populate("author", "name email");

    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }

    return successResponse(res, "Blog archived successfully", blog);
  } catch (error) {
    console.error("Archive blog error:", error);
    return errorResponse(res, error.message, 500);
  }
};

// Get blog statistics
export const getBlogStats = async (req, res) => {
  try {
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalViews = await Blog.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$views" },
        },
      },
    ]);

    const topBlogs = await Blog.find({ status: "published" })
      .sort({ views: -1 })
      .limit(5)
      .select("slug content.title views")
      .lean();

    return successResponse(res, "Blog statistics retrieved successfully", {
      statusCounts: stats,
      totalViews: totalViews[0]?.total || 0,
      topBlogs,
    });
  } catch (error) {
    console.error("Get blog stats error:", error);
    return errorResponse(res, error.message, 500);
  }
};

// Get all unique tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await Blog.distinct("content.tags");

    return successResponse(res, "Tags retrieved successfully", tags);
  } catch (error) {
    console.error("Get all tags error:", error);
    return errorResponse(res, error.message, 500);
  }
};

// Search blogs
export const searchBlogs = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return errorResponse(res, "Search query is required", 400);
    }

    const blogs = await Blog.find({
      $or: [
        { "content.title": { $regex: q, $options: "i" } },
        { "content.leadParagraph": { $regex: q, $options: "i" } },
        { "content.tags": { $regex: q, $options: "i" } },
        { "seo.keywords": { $regex: q, $options: "i" } },
      ],
      status: "published",
    })
      .select("slug content.title content.leadParagraph content.date")
      .limit(parseInt(limit))
      .lean();

    return successResponse(res, "Search results retrieved successfully", blogs);
  } catch (error) {
    console.error("Search blogs error:", error);
    return errorResponse(res, error.message, 500);
  }
};

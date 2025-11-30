import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // SEO Metadata
    seo: {
      metaTitle: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160,
      },
      keywords: {
        type: [String],
        default: [],
      },
      canonicalUrl: {
        type: String,
        trim: true,
      },
      openGraph: {
        title: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          default: "article",
          enum: ["article", "website", "blog"],
        },
        image: {
          type: String,
          trim: true,
        },
      },
    },

    // Content
    content: {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: Date,
        required: true,
        default: Date.now,
      },
      readingTime: {
        type: String,
        required: true,
      },
      tags: {
        type: [String],
        default: [],
      },
      leadParagraph: {
        type: String,
        required: true,
        trim: true,
      },
      body: {
        type: String,
        required: true,
      },
      featuredImage: {
        type: String,
        trim: true,
      },
    },

    // Management
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "User",
      ref: "Admin",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ "content.date": -1 });
blogSchema.index({ "content.tags": 1 });
blogSchema.index({ createdAt: -1 });

// Virtual for full URL
blogSchema.virtual("fullUrl").get(function () {
  return `/blog/${this.slug}`;
});

// Pre-save middleware to set publishedAt
blogSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;

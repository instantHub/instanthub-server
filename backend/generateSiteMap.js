import fs from "fs";
import path from "path";
import Brand from "./models/brandModel.js";
import Category from "./models/categoryModel.js";
import Product from "./models/productModel.js";

export const generateSitemap = (urls) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
    <url>
      <loc>${url.loc}</loc>
      <lastmod>${url.lastmod}</lastmod>
      <priority>${url.priority}</priority>
    </url>`
    )
    .join("")}
  </urlset>`;
  return sitemap;
};

export const getDynamicUrls = async () => {
  const staticUrls = [
    {
      loc: "https://www.instanthub.in/",
      lastmod: new Date().toISOString(),
      priority: "1.00",
    },
    {
      loc: "https://www.instanthub.in/services",
      lastmod: new Date().toISOString(),
      priority: "0.80",
    },
    {
      loc: "https://www.instanthub.in/recycle-categories",
      lastmod: new Date().toISOString(),
      priority: "0.80",
    },
    {
      loc: "https://www.instanthub.in/about",
      lastmod: new Date().toISOString(),
      priority: "0.80",
    },
    {
      loc: "https://www.instanthub.in/contact",
      lastmod: new Date().toISOString(),
      priority: "0.64",
    },
  ];

  console.log("before dynamic");
  const dynamicRoutes = await generateDynamicRoutes();
  //   console.log("dynamicRoutes", dynamicRoutes);

  return [...staticUrls, ...dynamicRoutes];
};

const generateDynamicRoutes = async () => {
  //   console.log("Sitemaps Brands", brands);
  const categories = await Category.find().select("_id");
  const brands = await Brand.find().select("_id");
  const products = await Product.find().select("_id");

  //   console.log("Sitemaps Categories", categories);
  const allIds = [...categories, ...brands, ...products];
  // console.log("allIds", allIds);
  console.log("allIds.length", allIds.length);

  const polices = [
    {
      loc: `https://www.instanthub.in/privacy-policies`,
      lastmod: new Date().toISOString(),
      priority: "0.60",
    },
    {
      loc: `https://www.instanthub.in/service-policy`,
      lastmod: new Date().toISOString(),
      priority: "0.60",
    },
    {
      loc: `https://www.instanthub.in/terms-conditions`,
      lastmod: new Date().toISOString(),
      priority: "0.60",
    },
    {
      loc: `https://www.instanthub.in/terms-of-use`,
      lastmod: new Date().toISOString(),
      priority: "0.60",
    },
  ];

  const brandsURLs = categories.map((category) => ({
    loc: `https://www.instanthub.in/categories/brands/${category._id}`,
    lastmod: new Date().toISOString(),
    priority: "0.64",
  }));

  const productsURLs = brands.map((brand) => ({
    loc: `https://www.instanthub.in/categories/brands/products/${brand._id}`,
    lastmod: new Date().toISOString(),
    priority: "0.64",
  }));

  return [...brandsURLs, ...productsURLs, ...polices];
  //   return allIds.map((ids) => ({
  //     loc: `https://www.instanthub.in/categories/brands/${ids._id}`,
  //     lastmod: new Date().toISOString(),
  //     priority: "0.64",
  //   }));
  //   return categoriesList.map((category) => ({
  //     loc: `https://www.instanthub.in/categories/brands/${category.id}`,
  //     lastmod: new Date().toISOString(),
  //     priority: "0.64",
  //   }));
};

// module.exports = generateSitemap;

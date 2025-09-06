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
    {
      loc: "https://www.instanthub.in/blogs",
      lastmod: new Date().toISOString(),
      priority: "0.64",
    },
  ];

  // console.log("before dynamic");
  const dynamicRoutes = await generateDynamicRoutes();

  return [...staticUrls, ...dynamicRoutes];
};

const generateDynamicRoutes = async () => {
  const categories = await Category.find().select("uniqueURL");
  const brands = await Brand.find().select("uniqueURL").populate("category");
  const products = await Product.find()
    .select("uniqueURL")
    .populate("category")
    .populate("brand");

  const now = new Date().toISOString();

  const dynamicURLs = [];

  // ✅ Categories
  categories.forEach((category) => {
    dynamicURLs.push({
      loc: `https://www.instanthub.in/${category.uniqueURL}`,
      lastmod: now,
      priority: "0.64",
    });
  });

  // ✅ Brands
  brands.forEach((brand) => {
    dynamicURLs.push({
      loc: `https://www.instanthub.in/${brand.category.uniqueURL}/${brand.uniqueURL}`,
      lastmod: now,
      priority: "0.64",
    });
  });

  // ✅ Products
  products.forEach((product) => {
    dynamicURLs.push({
      loc: `https://www.instanthub.in/${product.category.uniqueURL}/${product.brand.uniqueURL}/${product.uniqueURL}`,
      lastmod: now,
      priority: "0.64",
    });
  });

  console.log("all generated urls length:", [...dynamicURLs].length);
  return [...dynamicURLs];
};

// const polices = [
//   {
//     loc: `https://www.instanthub.in/privacy-policies`,
//     lastmod: now,
//     priority: "0.60",
//   },
//   {
//     loc: `https://www.instanthub.in/service-policy`,
//     lastmod: now,
//     priority: "0.60",
//   },
//   {
//     loc: `https://www.instanthub.in/terms-conditions`,
//     lastmod: now,
//     priority: "0.60",
//   },
//   {
//     loc: `https://www.instanthub.in/terms-of-use`,
//     lastmod: now,
//     priority: "0.60",
//   },
// ];

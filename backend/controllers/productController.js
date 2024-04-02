import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log(products);

    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const brandId = req.params.brandId;
    console.log(brandId);

    const brandWithProducts = await Brand.findById(brandId).populate(
      "products"
    );

    console.log("productsController GetProducts");
    console.log(brandWithProducts);

    const products = brandWithProducts.products;

    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const prodId = req.params.prodId;
    console.log(prodId);
    const product = await Product.findById(prodId);

    console.log("productsController GetProductDetails");
    console.log(product);

    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const products = await Product.find();
    const productBrand = await Brand.findById(req.body.brand);

    console.log("productsController", req.body);
    console.log(products.length);
    console.log("productBrand Found", productBrand);

    if (products.length > 0) {
      let checking = false;

      products.map((product) => {
        // console.log(typeof product.name);
        if (product.name.toLowerCase() === req.body.name.toLowerCase()) {
          checking = true;
        }
      });
      console.log(checking);

      if (checking == false) {
        let product = await Product.create({
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
          category: req.body.category,
          brand: req.body.brand,
          variants: req.body.variants,
        });
        product.save();

        // push the new product into its brand's products array & save
        productBrand.products.push(product);
        productBrand.save();

        res.status(200).json(product);
      } else if (checking == true) {
        // TODO Task, Unique Name Validation not working
        res.status(200).send({
          msg: "Product (" + req.body.name + ") already exist ",
        });
      }
    } else {
      let product = await Product.create({
        name: req.body.name,
        uniqueURL: req.body.uniqueURL,
        image: req.body.image,
        category: req.body.category,
        brand: req.body.brand,
        variants: req.body.variants,
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

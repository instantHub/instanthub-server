import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";

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

      if (checking == false) {
        let product = await Product.create({
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
          category: req.body.category,
          brand: req.body.brand,
        });
        product.save();

        // push the new product into its brand's products array & save
        productBrand.products.push(product);
        productBrand.save();

        res.status(200).json(product);
      } else {
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

export const getProducts = (req, res) => {};

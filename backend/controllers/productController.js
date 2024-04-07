import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Question from "../models/questionModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("brand", "name");
    // console.log(products);

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

        console.log(deductions);

        let product = await Product.create({
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
          category: req.body.category,
          brand: req.body.brand,
          variants: req.body.variants,
          deductions: deductions,
          // questions: categoryHasQuestions ? categoryQuestion.id : undefined,
        });
        product.save();

        // push the new product into its brand's products array & save
        // productBrand.products.push(product);
        // productBrand.save();

        res.status(200).json(product);
        // res.status(200).json(deductions);
      } else if (duplicate == true) {
        // TODO Task, Unique Name Validation not working
        res.status(200).send({
          msg: "Product (" + req.body.name + ") already exist ",
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
        // questions: categoryHasQuestions ? categoryQuestion.id : undefined,
      });
      product.save();

      // push the new product into its brand's products array & save
      // productBrand.products.push(product);
      // productBrand.save();

      res.status(200).json(product);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getProductQuestions = async (req, res) => {
  try {
    const prodId = req.params.prodId;
    console.log(prodId);
    const product = await Product.findById(prodId).populate("questions");

    console.log("productsController getProductQuestions");
    // console.log(product.questions);

    res.status(200).json({
      msg: "productsController getProductQuestions",
      data: product.questions,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

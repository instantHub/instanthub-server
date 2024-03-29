import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";

export const getAllBrands = async (req, res) => {
  try {
    const brand = await Brand.find();
    console.log(brand);

    res.status(200).json(brand);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getBrands = async (req, res) => {
  const catId = req.params.catId;
  //   console.log("catId from brandController", catId);
  try {
    const categoryWithBrands = await Category.findById(catId).populate(
      "brands"
    );
    console.log(categoryWithBrands);

    const brands = categoryWithBrands.brands;
    // console.log("brands from brandController", brands);

    res.status(200).json(brands);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addBrand = async (req, res) => {
  try {
    let brands = await Brand.find();

    // console.log("req.body", req.body);
    console.log("req.body.category", req.body.category);

    let categoryFound = await Category.findById(req.body.category);

    // console.log("category from brandController", categoryFound);

    if (categoryFound) {
      if (brands.length > 0) {
        let checking = false;

        brands.map((brand, i) => {
          if (brand.name.toLowerCase() === req.body.name.toLowerCase()) {
            console.log(brand.category, req.body.category);
            console.log("brand.category", brand.category == req.body.category);
            if (brand.category == req.body.category) {
              checking = true;
            }
          }
        });

        if (checking == false) {
          let brand = await Brand.create({
            category: req.body.category,
            name: req.body.name,
            uniqueURL: req.body.uniqueURL,
            image: req.body.image,
          });
          brand.save();

          // push the brand into its category's brands array & save
          categoryFound.brands.push(brand);
          categoryFound.save();

          res.status(200).json(brand);
        } else {
          res.status(200).send({
            msg:
              "Brand (" +
              req.body.name +
              ") in the category (" +
              req.body.category +
              ")already exist ",
          });
        }
      } else {
        let brand = await Brand.create({
          category: req.body.category,
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
        });
        brand.save();
        categoryFound.brands.push(brand);
        categoryFound.save();
        res.status(200).json(brand);
      }
    } else {
      res
        .status(404)
        .json({ msg: "Category (" + req.body.category + ") doesn't exist " });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

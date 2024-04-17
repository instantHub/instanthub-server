import Category from "../models/categoryModel.js";

export const addCategory = async (req, res) => {
  try {
    let categories = await Category.find();
    if (categories.length > 0) {
      let checking = false;

      categories.map((cat, i) => {
        if (cat.name.toLowerCase() === req.body.name.toLowerCase()) {
          checking = true;
        }

        // if (cat.name === req.body.name) {
        //   checking = true;
        // }
      });

      if (checking == false) {
        let category = await Category.create({
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
        });
        category.save();
        res.status(200).json(category);
      } else {
        res
          .status(200)
          .send({ msg: "category (" + req.body.name + ") already exist " });
      }
    } else {
      let category = await Category.create({
        name: req.body.name,
        uniqueURL: req.body.uniqueURL,
        image: req.body.image,
      });
      category.save();
      res.status(200).json(category);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCategory = async (req, res) => {
  // filter = {"category":["smartphone","laptops"]}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  // let condition = {};
  // if (!req.query.admin) {
  //   condition.deleted = { $ne: true };
  // }

  // let condition = {};

  // let query = Category.find(condition);
  // console.log("query", query);
  // // let totalProductsQuery = Product.find(condition);

  // console.log(req.query);

  // if (req.query._sort && req.query._order) {
  //   query = query.sort({ [req.query._sort]: req.query._order });
  // }

  // try {
  //   const docs = await query.exec();
  //   // res.set('X-Total-Count', totalDocs);
  //   res.status(200).json(docs);
  // } catch (err) {
  //   res.status(400).json(err);
  // }

  try {
    const categories = await Category.find().populate("brands", "name");
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Error in GET categories" + error.message });
  }
};

export const updateCategory = async (req, res) => {
  console.log("Update Category controller");
  const catId = req.params.catId;
  console.log(catId);

  console.log("body", req.body);

  try {
    const updatedCategory = await Category.findByIdAndUpdate(catId, req.body, {
      new: true,
    });
    return res.status(201).json(updatedCategory);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

export const deleteCategory = async (req, res) => {
  console.log("Delete Category controller");
};

import {
  ServiceCategory,
  ServiceBrand,
  ServiceProblem,
  ServiceSubCategory,
  ServiceSubProduct,
} from "../../models/servicesModel.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const getCategoryServices = async (req, res) => {
  console.log("getCategoryServices Controller");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  try {
    // Escape special characters in the search term
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");
    const query = {
      name: { $regex: search, $options: "i" },
    };

    // const query = {
    //   name: { $regex: regex }, // Search by name
    //   "services.status": "Active", // Include only active services
    // };

    const skip = (page - 1) * limit;

    const services = await ServiceCategory.find(query).skip(skip).limit(limit);

    const totalServices = await ServiceCategory.countDocuments(query);

    res.status(200).json({
      page,
      limit,
      totalServices,
      totalPages: Math.ceil(totalServices / limit),
      services,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (req, res) => {
  console.log("getServices Controller!!!");
  try {
    // const services = await Services.find().populate("subServices");
    const serviceCategories = await ServiceCategory.find();
    const serviceBrands = await ServiceBrand.find().populate(
      "serviceCategoryId"
    );
    const serviceProblems = await ServiceProblem.find().populate(
      "serviceCategoryId"
    );
    // .populate("serviceBrandId");
    const serviceSubCategories = await ServiceSubCategory.find().populate(
      "serviceCategoryId"
    );
    const serviceSubProducts = await ServiceSubProduct.find()
      .populate("serviceCategoryId")
      .populate("subServiceId");

    // console.log(serviceCategories);
    // console.log(serviceBrands);
    // console.log(serviceProblems);
    // console.log(serviceSubCategories);

    res.status(200).json({
      serviceCategories,
      serviceBrands,
      serviceProblems,
      serviceSubCategories,
      serviceSubProducts,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addServices = async (req, res) => {
  console.log("addServices Controller");
  console.log("req.body:- ", req.body);

  const {
    serviceFor,
    type,
    serviceName,
    inspectionCharges,
    status,
    serviceImage,
    subServiceName,
    subServiceImage,
    brandName,
    brandImage,
    brandProblemName,
    // brandProblemDescription,
    brandProblemImage,
    // brandProblemPrice,
    serviceCategoryId,
    serviceBrandId,

    subServiceId,
    productName,
    subProdDesc,
    prodDisPer,
    productPrice,
    productImage,
  } = req.body;

  // brandProblemImage;

  try {
    console.log("Try Block");

    if (serviceFor === "serviceCategory") {
      console.log("serviceCategory");
      let serviceCategory = await ServiceCategory.findOne({
        name: serviceName,
      });

      console.log("existing serviceCategory", serviceCategory);

      if (!serviceCategory) {
        console.log("new serviceCategory");
        // serviceCategory = new ServiceCategory({
        serviceCategory = await ServiceCategory.create({
          type,
          name: serviceName,
          inspectionCharges: inspectionCharges,
          status,
          image: serviceImage,
        });
        await serviceCategory.save();
        console.log(serviceCategory);
        res
          .status(201)
          .json({ message: "Service created successfully", serviceCategory });
      } else {
        res.status(500).json({
          message: "Service Already Exists!!",
          serviceCategory,
        });
      }
    } else if (serviceFor === "serviceBrand" && type === "Brand") {
      console.log("serviceBrand");
      let brand = await ServiceBrand.findOne({
        name: brandName,
        serviceCategoryId,
      });
      console.log("existing Brand", brand);

      if (!brand) {
        // brand = new ServiceBrand({
        brand = await ServiceBrand.create({
          serviceCategoryId,
          name: brandName,
          image: brandImage,
        });
        await brand.save();
        console.log("new Brand", brand);
        res.status(201).json({
          message: "Service Brand created successfully",
          brand,
        });
      } else {
        res.status(500).json({
          message: "Service Brand Already Exists!!",
          brand,
        });
      }
    } else if (serviceFor === "serviceBrandProblem") {
      console.log("serviceBrandProblem");
      let problem = await ServiceProblem.findOne({
        name: brandProblemName,
        serviceBrandId,
      });
      console.log("existing problem", problem);
      if (!problem) {
        problem = await ServiceProblem.create({
          serviceCategoryId,
          name: brandProblemName,
          image: brandProblemImage,
          // serviceBrandId,
          // description: brandProblemDescription,
          // price: brandProblemPrice,
        });
        await problem.save();
        console.log("new problem", problem);
        res.status(201).json({
          message: "Service Brand Problem created successfully",
          problem,
        });
      } else {
        res.status(500).json({
          message: "Service Brand Problem Already Exists!!",
          problem,
        });
      }
    } else if (
      serviceFor === "serviceSubCategory" &&
      type === "ServiceSubCategory"
    ) {
      console.log("serviceSubCategory");
      let serviceSubCategory = await ServiceSubCategory.findOne({
        name: subServiceName,
        serviceCategoryId,
      });
      console.log("existing serviceSubCategory", serviceSubCategory);

      if (!serviceSubCategory) {
        console.log("new serviceSubCategory");
        serviceSubCategory = await ServiceSubCategory.create({
          // serviceCategoryId: serviceCategory._id,
          serviceCategoryId,
          name: subServiceName,
          image: subServiceImage,
        });
        await serviceSubCategory.save();
        console.log(serviceSubCategory);
        res.status(201).json({
          message: "Service Sub Category created successfully",
          serviceSubCategory,
        });
      } else {
        res.status(500).json({
          message: "Service Sub Category Already Exists!!",
          serviceSubCategory,
        });
      }
    } else if (serviceFor === "serviceSubProduct") {
      console.log("serviceSubProduct");
      let subProduct = await ServiceSubProduct.findOne({
        name: productName,
        subServiceId,
      });
      console.log("existing subProduct", subProduct);
      if (!subProduct) {
        // try {
        console.log("new subProduct");
        subProduct = await ServiceSubProduct.create({
          serviceCategoryId,
          subServiceId,
          name: productName,
          description: subProdDesc,
          discount: prodDisPer,
          price: productPrice,
          image: productImage,
        });
        await subProduct.save();

        console.log(subProduct);
        // }
        // catch (err) {
        //   console.log("ERROR", err);
        // }

        res.status(201).json({
          message: "Service Sub Product created successfully",
          subProduct,
        });
      } else {
        res.status(500).json({
          message: "Service Sub Product Already Exists!!",
          subProduct,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error });
  }
};

export const updateService = async (req, res) => {
  console.log("updateService Controller");
  // console.log(req.body);

  const serviceId = req.params.serviceId;
  console.log("serviceId", serviceId);
  console.log("req.body", req.body);

  const {
    serviceFrom,
    type,
    name,
    inspectionCharges,
    status,
    image,
    description,
    discount,
    price,
  } = req.body;

  // brandProblemImage;

  try {
    if (serviceFrom === "serviceCategory") {
      console.log("serviceCategory");
      // let serviceCategory = await ServiceCategory.findOne({
      //   name,
      // });
      let serviceCategory = await ServiceCategory.findById(serviceId);

      console.log("existing serviceCategory", serviceCategory);

      if (serviceCategory) {
        serviceCategory = await ServiceCategory.findByIdAndUpdate(
          serviceId,
          {
            name,
            inspectionCharges,
            status,
            image,
          },
          { new: true }
        );
        await serviceCategory.save();
        console.log("Updated serviceCategory", serviceCategory);
        res
          .status(201)
          .json({ message: "Service updated successfully", serviceCategory });
      } else {
        res
          .status(500)
          .json({ message: "Service Category Not Found", serviceCategory });
      }
    } else if (serviceFrom === "serviceBrand") {
      console.log("serviceBrand");
      let brand = await ServiceBrand.findById(serviceId);
      console.log("existing Brand", brand);

      if (brand) {
        brand = await ServiceBrand.findByIdAndUpdate(
          serviceId,
          {
            name,
            image,
          },
          { new: true }
        );
        await brand.save();
        res.status(201).json({
          message: "Service Brand updated successfully",
          brand,
        });
      } else {
        res.status(500).json({ message: "Service Brand Not Found", brand });
      }
    } else if (serviceFrom === "serviceBrandProblem") {
      console.log("serviceBrandProblem");
      let problem = await ServiceProblem.findById(serviceId);
      console.log("existing problem", problem);
      if (problem) {
        problem = await ServiceProblem.findByIdAndUpdate(
          serviceId,
          {
            name,
            image,
          },
          { new: true }
        );
        await problem.save();
        console.log("updated problem", problem);

        res.status(201).json({
          message: "Service Brand Problem updated successfully",
          problem,
        });
      } else {
        res.status(500).json({ message: "Service Problem Not Found..!" });
      }
    } else if (serviceFrom === "serviceSubCategory") {
      console.log("serviceSubCategory");
      let serviceSubCategory = await ServiceSubCategory.findById(serviceId);
      console.log("existing serviceSubCategory", serviceSubCategory);

      if (serviceSubCategory) {
        serviceSubCategory = await ServiceSubCategory.findByIdAndUpdate(
          serviceId,
          {
            name,
            image,
          },
          { new: true }
        );
        await serviceSubCategory.save();
        console.log("updated serviceSubCategory", serviceSubCategory);
        res.status(201).json({
          message: "Sub Service Category updated successfully",
          serviceSubCategory,
        });
      } else {
        res.status(500).json({ message: "Sub Service Category Not Found..!" });
      }
    } else if (serviceFrom === "serviceSubProduct") {
      console.log("serviceSubProduct");
      let subProduct = await ServiceSubProduct.findById(serviceId);
      console.log("existing subProduct", subProduct);
      if (subProduct) {
        subProduct = await ServiceSubProduct.findByIdAndUpdate(
          serviceId,
          {
            name,
            description,
            discount,
            price,
            image,
          },
          { new: true }
        );

        subProduct.save();

        console.log("updated subProduct", subProduct);
        res.status(201).json({
          message: "Service Sub Product created successfully",
          subProduct,
        });
      } else {
        res.status(500).json({ message: "Sub Service Product Not Found..!" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error });
  }
};

export const deleteService = async (req, res) => {
  console.log("deleteService controller");
  const serviceId = req.query.serviceId;
  const serviceType = req.query.serviceType;
  const serviceFrom = req.query.serviceFrom;
  console.log(serviceId, serviceType, serviceFrom);
  try {
    const serviceCategory = await ServiceCategory.findById(serviceId);
    console.log("serviceCategory", serviceCategory);

    if (serviceFrom === "serviceCategory") {
      console.log("From serviceCategory");
      if (serviceType === "DirectService") {
        const serviceToDelete = await ServiceCategory.findById(serviceId);
        console.log("DirectService to delete", serviceToDelete);

        const deletedService = await ServiceCategory.findByIdAndDelete(
          serviceId
        );
        console.log("deletedService", deletedService);
        deleteImages(serviceToDelete.image);
        return res.status(201).json(`Service Deleted ${deletedService}`);
      } else if (serviceType === "Brand") {
        const serviceToDelete = await ServiceCategory.findById(serviceId);
        console.log("Brand Service to delete", serviceToDelete);

        // Delete Service Category
        const deletedService = await ServiceCategory.findByIdAndDelete(
          serviceId
        );
        console.log("deletedService", deletedService);
        deleteImages(serviceToDelete.image);

        // Begin Delete Associated Brands of the Service
        const associatedBrands = await ServiceBrand.find({
          serviceCategoryId: serviceId,
        });
        console.log("associatedBrands", associatedBrands);

        // call deleteImages function for each conditionLabel of the condition and unlink its images
        associatedBrands.map((brand) => {
          deleteImages(brand.image);
        });

        const deletedBrands = await ServiceBrand.deleteMany({
          serviceCategoryId: serviceId,
        });
        console.log(
          "Deleted ",
          deletedBrands.deletedCount,
          " associated brands"
        );
        // END Associated Brands Delete

        // Begin Delete Associated Problems of the Brand
        const associatedBrandProblems = await ServiceProblem.find({
          serviceCategoryId: serviceId,
        });
        console.log("associatedBrandProblems", associatedBrandProblems);

        // call deleteImages function for each conditionLabel of the condition and unlink its images
        associatedBrandProblems.map((bp) => {
          deleteImages(bp.image);
        });

        const deletedBrandProblems = await ServiceProblem.deleteMany({
          serviceCategoryId: serviceId,
        });

        console.log(
          "Deleted ",
          deletedBrandProblems.deletedCount,
          " associated Brand Problems"
        );
        // END Associated Brand Problems Delete

        return res.status(201).json(`Service Deleted ${deletedService}`);
      } else if (serviceType === "ServiceSubCategory") {
        const serviceToDelete = await ServiceCategory.findById(serviceId);
        console.log("Sub Service to delete", serviceToDelete);

        // Delete Service Category
        const deletedService = await ServiceCategory.findByIdAndDelete(
          serviceId
        );
        console.log("deletedService", deletedService);
        deleteImages(serviceToDelete.image);

        // Begin Delete Associated Sub Services of the Service
        const associatedSubServices = await ServiceSubCategory.find({
          serviceCategoryId: serviceId,
        });
        console.log("associatedSubServices", associatedSubServices);

        // call deleteImages function for each conditionLabel of the condition and unlink its images
        associatedSubServices.map((ss) => {
          deleteImages(ss.image);
        });

        const deletedSubServices = await ServiceSubCategory.deleteMany({
          serviceCategoryId: serviceId,
        });
        console.log(
          "Deleted ",
          deletedSubServices.deletedCount,
          " associated SubServices"
        );
        // END Associated Sub Services Delete

        // Begin Delete Associated Products of the Sub Service
        const associatedProducts = await ServiceSubProduct.find({
          serviceCategoryId: serviceId,
        });
        console.log("associatedProducts", associatedProducts);

        // call deleteImages function for each conditionLabel of the condition and unlink its images
        associatedProducts.map((ssp) => {
          deleteImages(ssp.image);
        });

        const deletedSubProducts = await ServiceSubProduct.deleteMany({
          serviceCategoryId: serviceId,
        });

        console.log(
          "Deleted ",
          deletedSubProducts.deletedCount,
          " associated SubProducts"
        );
        // END Associated Products Delete

        return res.status(201).json(`Service Deleted ${deletedService}`);
      }
    } else if (serviceFrom === "serviceBrand") {
      console.log("From serviceBrand");
      // Begin Delete Brand of the Service
      const serviceBrand = await ServiceBrand.findById(serviceId);
      console.log("serviceBrand", serviceBrand);

      // call deleteImages function to delete image of the Brand and unlink its image
      deleteImages(serviceBrand.image);

      const deletedBrand = await ServiceBrand.findByIdAndDelete(serviceId);
      console.log("Deleted Brand", deletedBrand);
      // END Associated Brands Delete

      return res.status(201).json(`Service Deleted ${deletedBrand}`);
    } else if (serviceFrom === "serviceProblem") {
      console.log("From serviceProblem");
      // Begin Delete Problem of the Service
      const serviceProblem = await ServiceProblem.findById(serviceId);
      console.log("serviceProblem", serviceProblem);

      // call deleteImages function to delete image of the Brand and unlink its image
      deleteImages(serviceProblem.image);

      const deletedServiceProblem = await ServiceProblem.findByIdAndDelete(
        serviceId
      );
      console.log("Deleted Service Problem", deletedServiceProblem);
      // END Associated Brands Delete

      return res.status(201).json(`Service Deleted ${serviceProblem}`);
    } else if (serviceFrom === "serviceSubCategory") {
      console.log("From Service Sub Category");
      // Begin Delete serviceSubCategory of the Service
      const serviceSubCategory = await ServiceSubCategory.findById(serviceId);
      console.log("serviceSubCategory", serviceSubCategory);

      // call deleteImages function to delete image of the Sub Service and unlink its image
      deleteImages(serviceSubCategory.image);

      const deletedServiceSubCategory =
        await ServiceSubCategory.findByIdAndDelete(serviceId);
      console.log("Deleted Service Sub Category", deletedServiceSubCategory);
      // END of Sub Service Delete

      // Begin Delete Associated Products of the Sub Service Category
      const associatedProducts = await ServiceSubProduct.find({
        subServiceId: serviceId,
      });
      console.log("associatedProducts", associatedProducts);

      // call deleteImages function for deleting each products of the subServiceCategory and unlink its images
      associatedProducts.map((ssp) => {
        deleteImages(ssp.image);
      });

      const deletedSubProducts = await ServiceSubProduct.deleteMany({
        subServiceId: serviceId,
      });

      console.log(
        "Deleted ",
        deletedSubProducts.deletedCount,
        " associated SubProducts"
      );
      // END Associated Products Delete

      return res.status(201).json(`Service Deleted ${serviceSubCategory}`);
    } else if (serviceFrom === "serviceSubProduct") {
      console.log("From serviceSubProduct");
      // Begin Delete Problem of the Service
      const serviceProduct = await ServiceSubProduct.findById(serviceId);
      console.log("serviceProduct", serviceProduct);

      // call deleteImages function to delete image of the Sub Service Product and unlink its image
      deleteImages(serviceProduct.image);

      const deletedServiceProduct = await ServiceSubProduct.findByIdAndDelete(
        serviceId
      );
      console.log("Deleted Service Product", deletedServiceProduct);
      // END Of Delete

      return res.status(201).json(`Service Deleted ${deletedServiceProduct}`);
    }

    // Delete the corresponding image file from the uploads folder
    function deleteImages(image) {
      console.log("In delete image");
      const __dirname = path.resolve();
      const imagePath = path.join(__dirname, image);
      console.log("imagePath", image);

      fs.unlink(imagePath, (err) => {
        // fs.unlink(deletedLabel.conditionLabelImg, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
          return res.status(500).json({ message: "Error deleting image" });
        }
        console.log("Image deleted successfully");
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

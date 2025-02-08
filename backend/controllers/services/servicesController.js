import {
  ServiceCategory,
  ServiceBrand,
  ServiceProblem,
  ServiceSubCategory,
  ServiceSubProduct,
} from "../../models/servicesModel.js";

import ServiceOrder from "../../models/serviceOrderModel.js";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
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

    // const associatedConditionLabels = await ConditionLabel.find({
    //   conditionNameId: conditionId,
    // });
    // console.log("associatedConditionLabels", associatedConditionLabels);

    // call deleteImages function for each conditionLabel of the condition and unlink its images
    // associatedConditionLabels.map((conditionLabel) => {
    //   deleteImages(conditionLabel.conditionLabelImg);
    // });

    // const deletedConditionLabels = await ConditionLabel.deleteMany({
    //   conditionNameId: conditionId,
    // });
    // console.log(
    //   "Deleted ",
    //   deletedConditionLabels.deletedCount,
    //   " associated conditionLabels"
    // );

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

// SERVICE ORDERS
export const getServicerOrders = async (req, res) => {
  console.log("getServicerOrders controller");

  try {
    const serviceOrders = await ServiceOrder.find();
    // console.log("serviceOrders", serviceOrders);
    res.status(200).json(serviceOrders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getServiceOrder = async (req, res) => {
  console.log("getServiceOrder controller");

  try {
    const serviceOrderId = req.params.serviceOrderId;
    // const ordersList = await RecycleOrder.find().populate("productId", "name");
    const serviceOrder = await ServiceOrder.findById(serviceOrderId);
    // console.log("serviceOrder",serviceOrder);
    res.status(200).json(serviceOrder);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createServiceOrder = async (req, res) => {
  console.log("CreateOrder controller");
  try {
    // const {
    //   productId,
    //   customerName,
    //   email,
    //   phone,
    //   address,
    //   pinCode,
    //   deductions,
    //   offerPrice,
    //   status,
    // } = req.body;

    // console.log(req.body);
    const totalOrders = await ServiceOrder.find();
    console.log("totalOrders", totalOrders.length);
    // console.log("totalOrders", totalOrders.count);
    // Generating Order ID
    const today = new Date(); // Current date
    const year = today.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Month with leading zero if needed
    const day = today.getDate().toString().padStart(2, "0"); // Day with leading zero if needed
    const CN = req.body.customerName
      .replace(/\s+/g, "")
      .slice(0, 2)
      .toUpperCase();
    const random = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    const orderCount = totalOrders.length + 1;

    const serviceOrderId = `SERORD${year}${month}${day}${CN}00${orderCount}`; // Concatenate date and random number

    console.log("OrderID", serviceOrderId);
    const serviceOrderData = { ...req.body, serviceOrderId };
    console.log("serviceOrderData", serviceOrderData);

    let order = await ServiceOrder.create(serviceOrderData);
    // let order = await Order.create(req.body);
    order.save();
    console.log("created order", order);

    // const orderDetail = await Order.find({ orderId: order.orderId });
    // console.log(orderDetail);

    const filteredProblemsHTML =
      order.problems && order.problems.length > 0
        ? order.problems
            .map((problem) => `<li>${problem.serviceProblem}</li>`)
            .join("")
        : "<li>Problems not selected</li>";

    let emailBody = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Order Summary</title>
          <style>
            h2 {
              color: #333;
              margin-bottom: 20px;
            }
            th,
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            th {
              text-align: left;
              background-color: #f2f2f2;
            }
      
            .order-detail h1 {
              font-size: small;
            }
      
            /* Mobile Styles */
            @media only screen and (max-width: 600px) {
              .container {
                padding: 10px;
              }
              table {
                font-size: 14px;
              }
              th,
              td {
                padding: 8px;
              }
              .logo {
                width: 100px;
                height: 80px;
              }
              h2 {
                color: #333;
                font-size: 10.2px;
              }
              .sell {
                font-size: 15px;
              }
            }
      
            .logo-header {
              display: flex;
              align-items: center;
              justify-content: start;
              gap: 15%;
            }

            .logo {
              width: 120px;
              height: 65px;
            }

            /* Mobile Styles */
            @media only screen and (max-width: 600px) {
              .logo {
                width: 80px;
                height: 55px
              }
            }
          </style>
        </head>
        <body
          style="
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
          "
        >
          <div
            class="container"
            style="
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            "
          >
            <h1 class="sell" style="text-align: center">
            <img
            src="https://api.instantpick.in/uploads/NavLogo.jpg"
            alt="Instant Hub"
            class="logo"
          />
            </h1>
            <h1 class="sell" style="text-align: center">Service Booking Receipt</h1>

            ${
              order.serviceType === "ServiceSubCategory" ||
              order.serviceType === "Brand"
                ? `
                <h2 style="text-align: center">
                  congratulations your ${order.selectedService.serviceCategoryId.name} order has been booked with InstantHub
                </h2>
                `
                : `
                <h2 style="text-align: center">
                  congratulations your ${order.selectedService.name} order has been booked with InstantHub
                </h2>
                `
            }
           
            <h1 style="font-size: small">
              <a href="https://instanthub.in">InstantHub</a>
            </h1>
      
            <div class="order-detail">
              <div>
                <h1>
                  <span>Order #</span>
                  <span>${order.serviceOrderId}</span>
                </h1>
                <h1>
                  <span>Customer Name: </span>
                  <span>${order.customerName}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span> Scheduled Date & Time: </span>
                  <span>${order.scheduleDate}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span>Email: </span>
                  <span>${order.email}</span>
                </h1>
                <h1>
                  <span>Ph #</span>
                  <span>${order.phone}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span>Billing Address: </span>
                  <span>
                    ${order.address}
                  </span>
                </h1>
              </div>
            </div>
      
            <table
              style="width: 100%; border-collapse: collapse; margin-bottom: 20px"
            >

            ${
              order.serviceType === "DirectService"
                ? `
              <tr>
                <th>Service Details</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${order.selectedService.name}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Inspection Charges</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>₹${order.inspectionCharges}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              `
                : ``
            }
            
            ${
              order.serviceType === "Brand"
                ? `
              <tr>
                <th>Device Details</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${order.selectedService.serviceCategoryId.name}</span>
                      <span>${order.selectedService.name}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Problems</th>
                <td>
                  <ol>
                    ${filteredProblemsHTML}
                  </ol>
                </td>
              </tr>
              <tr>
                <th>Inspection Charges</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>₹${order.inspectionCharges}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              `
                : ``
            }

            ${
              order.serviceType === "ServiceSubCategory"
                ? `
              <tr>
                <th>Category</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${order.selectedService.serviceCategoryId.name} - ${order.selectedService.subServiceId.name}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Product</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${order.selectedService.name}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Price</th>
                <td>₹${order.price}</td>
              </tr>
              <tr>
                <th>Delivery Charges</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>₹${order.inspectionCharges}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              `
                : ``
            }

            </table>
            <p style="text-align: center; color: #585555">
              Get in touch with us if you need any additional help:
              <a href="tel:8722288017" style="color: #007bff; text-decoration: none"
              >8722288017</a>
            </p>
            <p style="text-align: center; color: #777">
              If you have any questions or concerns about your order, please send us a
              mail at
              <a href="mailto:support@instanthub.in"
                >support@instanthub.in</a
              >.
            </p>
            
            <p
              class="min-size"
              style="font-size: smaller; text-align: right; color: #777"
            >
              GST Number: 29CSJPA4571K1ZE
            </p>
          </div>
        </body>
      </html>
      `;

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.hostinger.com", // Replace with your SMTP server
      port: 465, // Use 587 for TLS or 465 for SSL
      secure: true, // true for port 465, false for 587
      auth: {
        user: "support@instanthub.in", // Your domain email
        pass: process.env.SUPPORT_PASSWORD, // Your domain email password
      },
    });

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: "service-orders@instanthub.in", // Sender email address
      to: req.body.email, // Recipient email address
      cc: "instanthub.in@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Your Order #${serviceOrderId} has been placed ${order.customerName}`, // Subject line

      html: emailBody,
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const serviceOrderCompleted = async (req, res) => {
  console.log("serviceOrderCompleted controller");
  // const serviceOrderId = req.params.serviceOrderId;
  try {
    const serviceOrderId = req.params.serviceOrderId;
    console.log(serviceOrderId);

    const {
      // serviceOrderId,
      serviceFinalPrice,
      serviceAgent,
      serviceCompletedOn,
      additionalServices,
      status,
    } = req.body;

    const serviceOrder = await ServiceOrder.findById(serviceOrderId);
    console.log("serviceOrderFound", serviceOrder);

    const updatedServiceOrder = await ServiceOrder.findByIdAndUpdate(
      serviceOrderId,
      {
        serviceFinalPrice,
        serviceAgent,
        serviceCompletedOn,
        additionalServices,
        status,
      },
      { new: true } // This option returns the updated document
    );
    console.log("updatedServiceOrder", updatedServiceOrder);

    // const orderDetail = await Order.find({ orderId: order.orderId });
    // console.log(orderDetail);

    // Create a transporter object using SMTP transport
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   host: "smtp.example.com", // SMTP server address
    //   port: 465, // SMTP port (usually 587 for TLS, 465 for SSL)
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     // user: process.env.USER, // Your email address
    //     // user: "instantcashpick@gmail.com", // Your email address
    //     user: "instanthub.in@gmail.com", // Your email address
    //     pass: process.env.APP_PASSWORD, // Your email password
    //   },
    // });

    const filteredProblemsHTML =
      updatedServiceOrder.problems && updatedServiceOrder.problems.length > 0
        ? updatedServiceOrder.problems
            .map((problem) => `<li>${problem.serviceProblem}</li>`)
            .join("")
        : "<li>Problems not selected</li>";

    const filteredAdditionalServicesHTML =
      updatedServiceOrder.additionalServices &&
      updatedServiceOrder.additionalServices.length > 0
        ? updatedServiceOrder.additionalServices
            .map(
              (service) =>
                `<li>ServiceName: ${service.name}, Service Price: ${service.price}</li>`
            )
            .join("")
        : "<li>No Additional Service Done</li>";

    let emailBody = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Order Summary</title>
          <style>
            h2 {
              color: #333;
              margin-bottom: 20px;
            }
            th,
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            th {
              text-align: left;
              background-color: #f2f2f2;
            }
      
            .order-detail h1 {
              font-size: small;
            }
      
            /* Mobile Styles */
            @media only screen and (max-width: 600px) {
              .container {
                padding: 10px;
              }
              table {
                font-size: 14px;
              }
              th,
              td {
                padding: 8px;
              }
              .logo {
                width: 100px;
                height: 80px;
              }
              h2 {
                color: #333;
                font-size: 10.2px;
              }
              .sell {
                font-size: 15px;
              }
            }
      
            .logo-header {
              display: flex;
              align-items: center;
              justify-content: start;
              gap: 15%;
            }

            .logo {
              width: 120px;
              height: 65px;
            }

            /* Mobile Styles */
            @media only screen and (max-width: 600px) {
              .logo {
                width: 80px;
                height: 55px
              }
            }
          </style>
        </head>
        <body
          style="
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
          "
        >
          <div
            class="container"
            style="
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            "
          >
            <h1 class="sell" style="text-align: center">
            <img
            src="https://api.instantpick.in/uploads/NavLogo.jpg"
            alt="Instant Hub"
            class="logo"
          />
            </h1>
            <h1 class="sell" style="text-align: center">Service Completion Receipt</h1>

            ${
              updatedServiceOrder.serviceType === "ServiceSubCategory" ||
              updatedServiceOrder.serviceType === "Brand"
                ? `
                <h2 style="text-align: center">
                  congratulations your ${updatedServiceOrder.selectedService.serviceCategoryId.name} order has been completed by InstantHub
                </h2>
                `
                : `
                <h2 style="text-align: center">
                  congratulations your ${updatedServiceOrder.selectedService.name} order has been completed by InstantHub
                </h2>
                `
            }
           
            <h1 style="font-size: small">
              <a href="https://instanthub.in">InstantHub</a>
            </h1>
      
            <div class="order-detail">
              <div>
                <h1>
                  <span>Order #</span>
                  <span>${updatedServiceOrder.serviceOrderId}</span>
                </h1>
                <h1>
                  <span>Customer Name: </span>
                  <span>${updatedServiceOrder.customerName}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span> Scheduled Date & Time: </span>
                  <span>${updatedServiceOrder.scheduleDate}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span>Email: </span>
                  <span>${updatedServiceOrder.email}</span>
                </h1>
                <h1>
                  <span>Ph #</span>
                  <span>${updatedServiceOrder.phone}</span>
                </h1>
              </div>
      
              <div>
                <h1>
                  <span>Billing Address: </span>
                  <span>
                    ${updatedServiceOrder.address}
                  </span>
                </h1>
              </div>
            </div>
      
            <table
              style="width: 100%; border-collapse: collapse; margin-bottom: 20px"
            >

            ${
              updatedServiceOrder.serviceType === "DirectService"
                ? `
              <tr>
                <th>Service Details</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${updatedServiceOrder.selectedService.name}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              `
                : ``
            }
            
            ${
              updatedServiceOrder.serviceType === "Brand"
                ? `
              <tr>
                <th>Device Details</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${updatedServiceOrder.selectedService.serviceCategoryId.name}</span>
                      <span>${updatedServiceOrder.selectedService.name}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Selected Problems</th>
                <td>
                  <ol>
                    ${filteredProblemsHTML}
                  </ol>
                </td>
              </tr>
              <tr>
                <th>Additional Serviced Problems</th>
                <td>
                  <ol>
                    ${filteredAdditionalServicesHTML}
                  </ol>
                </td>
              </tr>
              `
                : ``
            }

            ${
              updatedServiceOrder.serviceType === "ServiceSubCategory"
                ? `
              <tr>
                <th>Category</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${updatedServiceOrder.selectedService.serviceCategoryId.name} - ${updatedServiceOrder.selectedService.subServiceId.name}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Product</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${updatedServiceOrder.selectedService.name}</span>
                    </h4>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Price</th>
                <td>₹${updatedServiceOrder.price}</td>
              </tr>
              `
                : ``
            }
            <tr>
                <th>Service Agent</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>${updatedServiceOrder.serviceAgent}</span>
                    </h4>
                  </div>
                </td>
            </tr>
            <tr>
            <th>Service Completed On</th>
            <td>
                <div style="display: flex; flex-direction: column">
                  <h4>
                    <span>${updatedServiceOrder.serviceCompletedOn}</span>
                  </h4>
                </div>
              </td>
            </tr>
            <tr>
                <th>Service Final Price</th>
                <td>
                  <div style="display: flex; flex-direction: column">
                    <h4>
                      <span>₹${updatedServiceOrder.serviceFinalPrice}</span>
                    </h4>
                  </div>
                </td>
            </tr>

            </table>
            <p style="text-align: center; color: #585555">
              Get in touch with us if you need any additional help:
              <a href="tel:8722288017" style="color: #007bff; text-decoration: none"
              >8722288017</a>
            </p>
            <p style="text-align: center; color: #777">
              If you have any questions or concerns about your order, please send us a
              mail at
              <a href="mailto:support@instanthub.in"
                >support@instanthub.in</a
              >.
            </p>
            
            <p
              class="min-size"
              style="font-size: smaller; text-align: right; color: #777"
            >
              GST Number: 29CSJPA4571K1ZE
            </p>
          </div>
        </body>
      </html>
      `;

    const transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.hostinger.com", // Replace with your SMTP server
      port: 465, // Use 587 for TLS or 465 for SSL
      secure: true, // true for port 465, false for 587
      auth: {
        user: "support@instanthub.in", // Your domain email
        pass: process.env.SUPPORT_PASSWORD, // Your domain email password
      },
    });

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: "service-orders@instanthub.in", // Sender email address
      to: updatedServiceOrder.email, // Recipient email address
      cc: "instanthub.in@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updatedServiceOrder.serviceOrderId} has been placed ${updatedServiceOrder.customerName}`, // Subject line
      html: emailBody,
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res.status(200).json({ success: true, data: updatedServiceOrder });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cancel Recycle Order
export const cancelServiceOrder = async (req, res) => {
  console.log("cancelServiceOrder controller");
  const serviceOrderId = req.params.serviceOrderId;
  console.log("serviceOrderId", serviceOrderId);

  const { status, cancelReason } = req.body;
  console.log("req.body", req.body);
  // console.log("status", status);
  // console.log("cancelReason", cancelReason);

  try {
    const updateOrder = await ServiceOrder.findByIdAndUpdate(
      serviceOrderId, // The ID of the order to update
      { $set: { status, cancelReason } }, // The fields to update using $set
      { new: true } // Option to return the updated document
    );
    // console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Service Order not found" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      // service: "gmail",
      // host: "smtp.gmail.com", // Replace with your SMTP server

      host: "smtp.hostinger.com", // Replace with your SMTP server
      port: 465, // Use 587 for TLS or 465 for SSL
      secure: true, // true for port 465, false for 587
      auth: {
        // Productio
        user: "support@instanthub.in", // Your domain email
        pass: process.env.SUPPORT_PASSWORD, // Your domain email password

        // Development
        // user: "instanthub.in@gmail.com", // Your domain email
        // pass: process.env.APP_PASSWORD, // Your domain email password
      },
    });

    // Email content
    const mailOptions = {
      // from: "instanthub.in@gmail.com", // Sender email address

      from: "support@instanthub.in", // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: "instanthub.in@gmail.com", // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updateOrder.serviceOrderId} has been cancelled ${updateOrder.customerName}`, // Subject line
      text: `Dear Customer,

Thank you for choosing Instant Hub. We truly appreciate your interest in our services.

Sorry to inform you that we had to cancel your requested service.
Cancellation Reason: ${cancelReason}

We sincerely apologize for any inconvenience this may cause. Please let us know if there is anything else we can assist you with, or feel free to reach out to us if you have any future requirements within Bangalore.
Thank you for your understanding and support.

Best regards,  
InstantHub Team  
support@instanthub.in  
8722288017  
https://www.instanthub.in/`,
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res
      .status(200)
      .json({ message: "Service Order cancelled successfully", updateOrder });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while cancelling Recycle Order.",
      error,
    });
  }
};

// DELETE SERVICE ORDER
export const deleteServiceOrder = async (req, res) => {
  console.log("deleteServiceOrder controller");
  const serviceOrderId = req.params.serviceOrderId;
  console.log(serviceOrderId);

  try {
    // 1. Delete brand
    const deletedOrder = await ServiceOrder.findByIdAndDelete(serviceOrderId);
    console.log("deleteOrder", deletedOrder);

    return res.status(201).json(deletedOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};

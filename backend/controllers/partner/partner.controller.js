import Partner from "../../models/partner/partner.model.js";
import PartnerRequest from "../../models/partner/partner-request.model.js";
import Executive from "../../models/executiveModel.js";
import { generateUniqueID } from "../../utils/helper.js";
import { ROLES } from "../../constants/auth.js";

/**
 * @desc    Create a new partner
 * @route   POST /api/partners
 * @access  Private (Admin)
 */
export const createPartner = async (req, res) => {
  console.log("createPartner controller called..!");

  try {
    const { _id, name, email, phone, companyName, password, address } =
      req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, phone, and password are required." });
    }

    const partnerExists = await Partner.findOne({
      $or: [{ email }, { phone }],
    });

    if (partnerExists) {
      return res.status(409).json({
        message: "A partner with this email or phone already exists.",
      });
    }

    const partnerID = generateUniqueID(ROLES.partner);
    console.log("partnerID", partnerID);

    const creator = {
      id: req.user.adminID,
      name: req.user.name,
      role: "admin",
    };

    const partner = await Partner.create({
      partnerID,
      creator,
      name,
      email,
      phone,
      companyName,
      address,
      password,
    });
    // console.log("created partner :- ", partner);

    const request = await PartnerRequest.findById(_id);
    if (!request || request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invalid or already processed partner request" });
    }

    request.status = "approved";
    await request.save();

    res.status(201).json(partner);
  } catch (error) {
    console.error("Error creating partner:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all partners
 * @route   GET /api/partners
 * @access  Private (Admin)
 */
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({}).sort({ createdAt: -1 });
    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update a partner
 * @route   PUT /api/partners/:id
 * @access  Private (Admin)
 */
export const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent password updates through this general-purpose endpoint
    if (req.body.password) {
      delete req.body.password;
    }

    const updatedPartner = await Partner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPartner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    res.status(200).json(updatedPartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Email or phone already in use." });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete a partner
 * @route   DELETE /api/partners/:id
 * @access  Private (Admin / Partner)
 */
export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findByIdAndDelete(id);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    res.status(200).json({ message: "Partner deleted successfully." });
  } catch (error) {
    console.error("Error deleting partner:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Create a new partner
 * @route   POST /api/partners/executive
 * @access  Private (Admin / Partner)
 */
export const createPartnerExecutive = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, phone, and password are required." });
    }

    const executiveExists = await Executive.findOne({
      $or: [{ email }, { phone }],
    });

    if (executiveExists) {
      return res.status(409).json({
        message: "A executive with this email or phone already exists.",
      });
    }

    const creator = {
      id: req.user.partnerID,
      name: req.user.name,
      role: "partner",
    };

    const executiveID = generateUniqueID(ROLES.partner_executive);

    const partner_executive = await Executive.create({
      executiveID,
      name,
      email,
      phone,
      address,
      password,
      role: "partner_executive",
      creator,
    });
    console.log("created partner_executive :- ", partner_executive);

    res.status(201).json({
      success: true,
      message: "Partner executive created successfully.",
    });
  } catch (error) {
    console.error("Error creating partner:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all partners
 * @route   GET /api/partners/executive
 * @access  Private (Admin)
 */
export const getPartnerExecutives = async (req, res) => {
  console.log("getPartnerExecutives controller called..!");

  try {
    const partnerID = req.user.partnerID;
    const executives = await Executive.find({
      "creator.id": partnerID,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json(executives);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete a partner
 * @route   DELETE /api/partners/executive:id
 * @access  Private (Admin / Partner)
 */
export const deletePartnerExecutive = async (req, res) => {
  console.log("deletePartnerExecutive controller called..!");

  try {
    const { id } = req.params;
    const executive = await Executive.findByIdAndDelete(id);

    if (!executive) {
      return res.status(404).json({ message: "Partner not found." });
    }

    res.status(200).json({ message: "Partner deleted successfully." });
  } catch (error) {
    console.error("Error deleting partner:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

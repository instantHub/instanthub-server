import nodemailer from "nodemailer";
import Partner from "../../models/partner/partner.model.js";
import PartnerRequest from "../../models/partner/partner-request.model.js";
import { HOSTINGER_MAILER, SUPPORT_EMAIL } from "../../constants/email.js";
import { PARTNER_REQUEST } from "../../utils/emailTemplates/partners-requests.js";

export const submitPartnerRequest = async (req, res) => {
  console.log("submitPartnerRequest controller");

  try {
    const request = new PartnerRequest(req.body);
    await request.save();

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    const mailOptions = {
      from: SUPPORT_EMAIL,
      to: request.email,
      subject: `Welcome to Instant Hub: Your Partner Request has been received.`,
      html: PARTNER_REQUEST(request),
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

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: "Error submitting request", error });
  }
};

export const getPartnerRequests = async (req, res) => {
  console.log("getPartnerRequests controller");
  const { status } = req.query;
  if (status) {
    const requests = await PartnerRequest.find({ status }).sort({
      createdAt: -1,
    });
    res.json(requests);
    return;
  }

  const requests = await PartnerRequest.find().sort({ createdAt: -1 });
  res.json(requests);
};

// Approve Request is not used instead we use createPartner from partner controller
export const approvePartnerRequest = async (req, res) => {
  console.log("approvePartnerRequest controller");

  const { id } = req.params;

  const request = await PartnerRequest.findById(id);
  if (!request || request.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Invalid or already processed request" });
  }

  request.status = "approved";
  await request.save();

  // 1. Create Partner Account
  const newPartner = new Partner({
    name: request.name,
    email: request.email,
    phone: request.phone,
    location: request.location,
    businessName: request.businessName,
    address: request.address,
    // any other fields required for Partner model
  });
  await newPartner.save();

  // 2. Generate a temporary password or password reset link
  const tempPassword = Math.random().toString(36).slice(-8);
  // You would normally hash this before saving, here for demo only

  // 3. Send approval email
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: request.email,
    subject: "Your Partner Request is Approved",
    html: `
      <h1>Congratulations!</h1>
      <p>Your partnership request has been approved.</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please click the link below to set up your account:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=example">Set Up Your Account</a>
    `,
  };

  await transporter.sendMail(mailOptions);

  res.json(request);
};

// Reject Request
export const rejectPartnerRequest = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  const request = await PartnerRequest.findById(id);
  //   if (!request || request.status !== "pending") {
  //     return res
  //       .status(400)
  //       .json({ message: "Invalid or already processed request" });
  //   }

  request.status = "rejected";
  request.rejectionReason = rejectionReason;
  await request.save();

  // Send rejection email
  const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

  const mailOptions = {
    from: SUPPORT_EMAIL,
    to: request.email,
    subject: `Your Partner Request has been Rejected`,
    html: `
      <h1>Partner Request Rejected</h1>
      <p>We're sorry to inform you that your partnership request has been rejected.</p>
      <p><strong>Reason:</strong> ${rejectionReason}</p>
    `,
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

  await transporter.sendMail(mailOptions);

  res.json(request);
};

// Delete Request (Admin)
export const deletePartnerRequest = async (req, res) => {
  const { id } = req.params;
  await PartnerRequest.findByIdAndDelete(id);
  res.status(204).send();
};

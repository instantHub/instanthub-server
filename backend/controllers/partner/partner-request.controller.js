import nodemailer from "nodemailer";
import Partner from "../../models/partner/partner.model.js";
import PartnerRequest from "../../models/partner/partner-request.model.js";
import {
  GMAIL_MAILER,
  HOSTINGER_MAILER,
  INSTANTHUB_GMAIL,
  SUPPORT_EMAIL,
} from "../../constants/email.js";
import { PARTNER_REQUEST } from "../../utils/emailTemplates/partners-requests.js";

export const submitPartnerRequest = async (req, res) => {
  console.log("submitPartnerRequest controller");

  try {
    const request = new PartnerRequest(req.body);
    await request.save();

    const useGmailService = process.env.USE_GMAIL_SERVICE;
    const MAILER = useGmailService ? GMAIL_MAILER : HOSTINGER_MAILER;
    const FROM = useGmailService ? INSTANTHUB_GMAIL : SUPPORT_EMAIL;

    const transporter = nodemailer.createTransport(MAILER);

    const mailOptions = {
      from: FROM,
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

// Reject Request
export const rejectPartnerRequest = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  const request = await PartnerRequest.findById(id);

  request.status = "rejected";
  request.rejectionReason = rejectionReason;
  await request.save();

  const useGmailService = process.env.USE_GMAIL_SERVICE;
  const MAILER = useGmailService ? GMAIL_MAILER : HOSTINGER_MAILER;
  const FROM = useGmailService ? INSTANTHUB_GMAIL : SUPPORT_EMAIL;

  const transporter = nodemailer.createTransport(MAILER);

  // Send rejection email
  const mailOptions = {
    from: FROM,
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

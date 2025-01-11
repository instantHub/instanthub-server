import Complaint from "../models/complaintModel.js";

// Get Complaints
export const getComplaints = async (req, res) => {
  console.log("getComplaints Controller");

  try {
    const complaints = await Complaint.find();
    // console.log(complaints);

    res.status(200).json(complaints);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Create Complaint
export const createComplaint = async (req, res) => {
  console.log("createComplaint Controller");
  console.log("req.body", req.body);

  try {
    let complaintCreated = await Complaint.create(req.body);
    complaintCreated.save();
    console.log("complaintCreated", complaintCreated);

    res.status(200).json(complaintCreated);
  } catch (error) {
    console.log("Error while creating a complaint", error);
    res.status(404).json({ message: error.message });
  }
};

// Acknowledge Complaints
export const complaintsAcknowledge = async (req, res) => {
  console.log("complaintsAcknowledge Controller");

  try {
    const { complaintId } = req.params;
    // console.log("complaintId", complaintId);

    const { status } = req.body;
    console.log("status", status);

    const updatedResource = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        $set: {
          "status.pending": status.pending,
          "status.acknowledge": status.acknowledge,
        },
      }, // Update fields
      { new: true, runValidators: true } // Options
    );
    updatedResource.save();
    console.log("updatedResource", updatedResource);

    res.status(200).json(updatedResource);
  } catch (error) {
    console.log("error", error);
    res.status(404).json({ message: error.message });
  }
};

// DELETE Complaint
export const deleteComplaint = async (req, res) => {
  console.log("deleteComplaint controller");
  const complaintId = req.params.complaintId;

  try {
    // Delete complaint
    const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);
    console.log("deletedComplaint", deletedComplaint);

    return res.status(200).json(deletedComplaint);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Brand.", error });
  }
};

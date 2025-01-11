import mongoose from "mongoose";

const complaintSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    complaint: {
      type: String,
      required: true,
    },
    status: {
      pending: { type: Boolean },
      acknowledge: { type: Boolean },
    },
  },
  { timestamps: true }
);

// Remove unique constraint on name field
complaintSchema.index({ name: 1 });

const virtual = complaintSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
complaintSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;

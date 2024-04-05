import mongoose from "mongoose";

const conditionLabelSchema = mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  conditionName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Condition",
  },

  conditionLabel: {
    type: String,
    required: true,
  },

  conditionLabelImg: {
    type: String,
    required: true,
  },
});

// Remove unique constraint on name field
// conditionSchema.index({ name: 1 });

const virtual = conditionLabelSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
conditionLabelSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const ConditionLabel = mongoose.model("ConditionLabel", conditionLabelSchema);
export default ConditionLabel;

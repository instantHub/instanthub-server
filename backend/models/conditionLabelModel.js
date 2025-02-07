import mongoose from "mongoose";

const conditionLabelSchema = mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    conditionNameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Condition",
    },

    conditionLabel: {
      type: String,
      required: true,
    },

    conditionLabelImg: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

// Define a compound unique index
// conditionLabelSchema.index(
//   { category: 1, conditionName: 1, conditionLabel: 1 },
//   { unique: true }
// );

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

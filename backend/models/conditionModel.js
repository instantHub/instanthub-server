import mongoose from "mongoose";

const conditionSchema = mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    conditionName: {
      type: String,
      required: true,
    },

    page: { type: Number },

    keyword: { type: String },
    isYesNoType: { type: Boolean },
    description: { type: String },

    conditionLabels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ConditionLabel",
      },
    ],
  },
  { timestamps: true }
);

// Define a compound unique index
conditionSchema.index({ category: 1, conditionName: 1 }, { unique: true });

const virtual = conditionSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
conditionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Condition = mongoose.model("Condition", conditionSchema);
export default Condition;

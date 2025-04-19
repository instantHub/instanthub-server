import mongoose from "mongoose";

const processorSchema = mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    processorId: {
      type: String,
    },
    processorName: {
      type: String,
    },
    deductions: [
      {
        conditionId: {
          type: String,
        },
        conditionName: {
          type: String,
        },
        page: { type: Number },

        keyword: { type: String },
        description: { type: String },

        isMandatory: { type: Boolean, default: false },
        multiSelect: { type: Boolean, default: false },
        isYesNoType: { type: Boolean, default: false },
        showLabelsImage: { type: Boolean, default: false },

        conditionLabels: [
          {
            conditionLabelId: {
              type: String,
            },
            conditionLabel: {
              type: String,
            },
            conditionLabelImg: {
              type: String,
            },
            priceDrop: {
              type: Number,
              default: 0,
            },
            operation: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const virtual = processorSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
processorSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Processor = mongoose.model("Processor", processorSchema);
export default Processor;

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

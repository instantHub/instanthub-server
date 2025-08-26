import mongoose from "mongoose";

const variantQuestionSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: { type: String, unique: true, required: true },
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
});

const VariantQuestion = mongoose.model(
  "VariantQuestion",
  variantQuestionSchema
);

export { VariantQuestion };

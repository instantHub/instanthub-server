import mongoose from "mongoose";

const variantQuestionSchema = new mongoose.Schema({
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
      isYesNoType: { type: Boolean },
      description: { type: String },

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

import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  
  conditions: [
    {
      conditionName: {
        type: String,
        required: true,
      },
      questions: [
        {
          questionName: {
            type: String,
            required: true,
          },
          priceDrop: {
            type: Number,
          },
          options: [
            {
              type: String,
            },
          ],
        },
      ],
    },
  ],
});

// Remove unique constraint on name field
questionSchema.index({ name: 1 });

const virtual = questionSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
questionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Question = mongoose.model("Question", questionSchema);
export default Question;

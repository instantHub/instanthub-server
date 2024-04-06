import mongoose from "mongoose";

// const productSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   uniqueURL: {
//     type: String,
//     required: true,
//   },
//   image: {
//     type: String,
//     required: true,
//   },
//   category: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//     },
//   ], // Reference to the Categories collection
//   brand: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Brand",
//     },
//   ], // Reference to the Brands collection
//   variants: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Variant",
//     },
//   ],
//   series: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Series",
//     },
//   ],
// questions: [
//   {
//     category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
//     conditions: [
//       {
//         conditionName: {
//           type: String,
//           required: true,
//         },
//         questions: [
//           {
//             questionName: {
//               type: String,
//               required: true,
//             },
//             priceDrop: {
//               type: Number,
//             },
//             options: [
//               {
//                 type: String,
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// ],
// });

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  uniqueURL: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  variants: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Series",
  },
  questions: {
    conditionNames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Condition",
      },
    ],

    conditionLabels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ConditionLabel",
      },
    ],
  },
  deductions: [
    {
      conditionId: {
        type: String,
      },
      conditionName: {
        type: String,
      },
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
        },
      ],
    },
  ],
});

// Define a compound unique index
// productSchema.index(
//   {
//     "deductions.condtitionNames": 1,
//     "deductions.conditionLabels.conditionLabel": 1,
//   },
//   { unique: true }
// );

const virtual = productSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;

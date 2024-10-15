import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
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
    simpleDeductions: [
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
    variantDeductions: [
      {
        variantId: {
          type: String,
        },
        variantName: {
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
    ],
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

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

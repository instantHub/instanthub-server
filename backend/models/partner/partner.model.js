import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    partnerID: { type: String, unique: true, required: true, immutable: true },
    creator: {
      id: { type: String },
      name: { type: String },
      role: {
        type: String,
        enum: ["admin"],
        default: "admin",
      },
    },
    role: {
      type: String,
      enum: ["partner"],
      default: "partner",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedOrders: [
      {
        orderObjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        orderId: { type: String },
        assignedAt: { type: Date, default: Date.now },
      },
      { _id: false },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    totalCompletedOrders: {
      type: Number,
      default: 0,
    },
    address: {
      street: { type: String },
      state: { type: String },
      city: { type: String },
      pincode: { type: Number },
    },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordChangedAt: { type: Date, default: Date.now },
    sessionTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
        ipAddress: String,
        userAgent: String,
      },
    ],
  },
  { timestamps: true }
);

// Virtual for account lock status
partnerSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

partnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  next();
});

partnerSchema.methods.matchPasswords = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Increment login attempts
partnerSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 0, lockUntil: undefined },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 minutes
  }

  return this.updateOne(updates);
};

// Clean expired session tokens
partnerSchema.methods.cleanExpiredTokens = async function () {
  this.sessionTokens = this.sessionTokens.filter(
    (token) => token.expiresAt > new Date()
  );
  return this.save();
};

const Partner = mongoose.model("Partner", partnerSchema);

export default Partner;

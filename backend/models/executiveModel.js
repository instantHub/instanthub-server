import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const executiveSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "executive", "partner"],
      default: "executive",
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
executiveSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
executiveSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  next();
});

// Method to match entered password with hashed password
executiveSchema.methods.matchPasswords = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to increment login attempts and lock account if necessary
executiveSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    // Reset attempts if lock has expired
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // Lock for 30 minutes
  }

  return this.updateOne(updates);
};

// Method to clean up expired session tokens
executiveSchema.methods.cleanExpiredTokens = async function () {
  this.sessionTokens = this.sessionTokens.filter(
    (token) => token.expiresAt > new Date()
  );
  return this.save();
};

const Executive = mongoose.model("Executive", executiveSchema);

export default Executive;

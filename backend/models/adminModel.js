import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 6 },
    role: {
      type: String,
      role: {
        type: String,
        enum: ["admin", "executive", "marketing", "partner"],
        required: true,
      },
      default: "admin",
    },
    // department: { type: String, required: true },
    isActive: { type: Boolean, default: true },
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
    permissions: [
      {
        resource: String,
        actions: [String],
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Virtual for account lock status
AdminSchema.virtual("isLocked").get(function () {
  // return !!(this.lockUntil && this.lockUntil > Date.now());
  return false;
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.matchPasswords = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

// Increment login attempts
AdminSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 minutes
  }

  return this.updateOne(updates);
};

// Clean expired session tokens
AdminSchema.methods.cleanExpiredTokens = async function () {
  this.sessionTokens = this.sessionTokens.filter(
    (token) => token.expiresAt > new Date()
  );
  return this.save();
};

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;

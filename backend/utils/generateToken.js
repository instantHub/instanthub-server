import jwt from "jsonwebtoken";

const generateToken = (res, admin) => {
  const adminId = admin._id;
  const accessToken = jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });

  console.log("accessToken from generateToken", accessToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Fixed: should be true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Fixed: for cross-origin requests
    path: "/",
    maxAge: 2 * 24 * 60 * 60 * 1000, //  minutes in milliseconds
  });

  const refreshToken = jwt.sign(
    { adminId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken }; // Optional: return accessToken for debugging
};

export default generateToken;

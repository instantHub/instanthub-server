import jwt from "jsonwebtoken";

// const generateToken = (res, adminId) => {
const generateToken = (res, admin) => {
  const adminId = admin._id;
  const token = jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  console.log("token from generateToken", token);
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict", // this will protect from CSRF attacks
    path: "/", // from stackoverflow
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;

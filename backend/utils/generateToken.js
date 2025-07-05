// import jwt from "jsonwebtoken";

// // const generateToken = (res, adminId) => {
// const generateToken = (res, admin) => {
//   const adminId = admin._id;
//   const token = jwt.sign({ adminId }, process.env.JWT_SECRET, {
//     // expiresIn: "30d",
//     expiresIn: "2m",
//   });

//   console.log("token from generateToken", token);
//   res.cookie("jwt", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV !== "development",
//     sameSite: "strict", // this will protect from CSRF attacks
//     path: "/", // from stackoverflow // Make the cookie available across the entire site
//     // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
//     maxAge: 2 * 60 * 1000, // 2 minutes in milliseconds
//   });

//   // console.log("Token set in cookie:", res.cookies);
// };

// export default generateToken;

// generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (res, admin) => {
  const adminId = admin._id;
  const token = jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: "2m",
  });

  console.log("token from generateToken", token);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Fixed: should be true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Fixed: for cross-origin requests
    path: "/",
    maxAge: 2 * 60 * 1000, // 2 minutes in milliseconds
  });

  return token; // Optional: return token for debugging
};

export default generateToken;

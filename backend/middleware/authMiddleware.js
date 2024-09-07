import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;
  console.log("token from authMiddleware", token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.adminId).select("-password");
      next();
    } catch (error) {
      res
        .status(401)
        .json({ msg: "Not authorized, invalid token", Error: error });
    }
  } else {
    res.status(401).json({ msg: "Not authorized, no token" });
  }
};

export { protect };

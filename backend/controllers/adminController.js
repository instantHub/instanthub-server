import Admin from "../models/adminModel.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

export const registerAdmin = async (req, res) => {
  console.log("registerAdmin controller");
  console.log("req", req.body);
  const { name, email, password } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(401).json({ msg: "Admin already exists" });
  }

  const admin = await Admin.create({
    name,
    email,
    password,
  });

  if (admin) {
    // generateToken(res, admin._id);
    res.status(201).json(admin);
  } else {
    res.status(401).json({ msg: "Invalid admin data" });
  }
  //   res.status(200).json({ msg: "registerAdmin Admin" });
};

export const authAdmin = async (req, res) => {
  console.log("authAdmin controller");
  const { email, password } = req.body;
  //   console.log(email, password);

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPasswords(password))) {
    // Since JWT token is getting saved now generate token and save it to browser cookie
    // generateToken(res, admin);
    // console.log("Cookies from authAdmin:", req.cookies);
    // TODO cookies are being sent but not getting stored in browser

    res.status(201).json(admin);
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }

  //   res.status(200).json({ msg: "Auth Admin" });
};

// route    POST /api/logout
// @access   Private
export const logout = async (req, res) => {
  console.log("logout controller");

  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  // res.clearCookie('jwt', { path: '/' });

  res.status(200).json({ msg: "Admin logged out" });
};

export const getAdmin = async (req, res) => {
  console.log("getAdmin controller");
  try {
    // const { id } = req.params;
    // const admin = await Admin.findById(id);
    // res.status(200).json(admin);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// route    GET /api/admin-profile
// @access   Private
export const getAdminProfile = async (req, res) => {
  console.log("getAdminProfile controller");
  // console.log(req.admin);
  res.status(200).json({ msg: "getAdminProfile Admin" });
};

export const updateAdmin = async (req, res) => {
  console.log("updateAdmin controller");
  console.log("req", req.body);
  const { name, email, password, _id } = req.body;

  const adminExists = await Admin.findById(_id);

  if (adminExists) {
    adminExists.name = name || adminExists.name;
    adminExists.email = email || adminExists.email;
    adminExists.name = name || adminExists.name;

    if (password) {
      adminExists.password = password;
    }

    const updatedAdmin = await adminExists.save();

    res
      .status(200)
      .json({ updatedAdmin, message: "Admin Updated successfully" });
  }

  //   res.status(200).json({ msg: "registerAdmin Admin" });
};

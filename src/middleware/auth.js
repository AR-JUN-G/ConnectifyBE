const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    let { accessToken } = req.cookies;
    if (!accessToken) {
      return res.status(401).json({
        message: "Access Denied. Please Log in.",
      });
    }

    const decodePayLoad = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log("JWT:",decodePayLoad);
    const user = await User.findById(decodePayLoad.userID).select('-password -updatedAt -__v -createdAt');

    if (!user) {
      return res.status(401).json({ message: "User no Longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware error", error.message);
    res.status(401).json({ message: "Invalid accessToken" });
  }
};

module.exports = auth;

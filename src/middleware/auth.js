const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    let { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        message: "Access Denied. Please Log in.",
      });
    }

    const decodePayLoad = jwt.verify(token, "secret");
    console.log("JWT:",decodePayLoad);
    const user = await User.findById(decodePayLoad.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: "User no Longer exists" });
    }

    req.user = user;
    next();
  } catch (e) {
    console.error("Auth Middleware error", e.message);
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = auth;

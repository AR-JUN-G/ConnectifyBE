const express = require("express");
const feedRouter = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

feedRouter.get("/api/sendRequest", auth, async (req, res) => {
  try {
    const feedData = await User.find({}).select("-password -emailId");
    res.status(200).json({
      message: "Feed fetched successfully",
      currentUser: req.user.firstName,
      data: feedData,
    });
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
});

module.exports = feedRouter;

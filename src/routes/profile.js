const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");

profileRouter.get("/api/profile", auth, async (req, res) => {
  const userData = req.user;
  console.log(userData);
  res.status(200).json({
    message: "User Detail Fetched Successfully",
    data: userData,
  });
});

profileRouter.patch("/api/profile", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body;

    const immutableFields = ["emailId", "createdAt", "updatedAt"];
    const containImmutableFields = Object.keys(data).some((key) => {
      return immutableFields.includes(key);
    });

    if (containImmutableFields) {
      return res
        .status(400)
        .send(
          "Update failed: You cannot modify protected fields like emailId.",
        );
    }

    if(data.password){
      const saltRound=10;
      data.password=await bcrypt.hash(data.password,saltRound);
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { returnDocument: "after",
        runValidators: true
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }  
    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Something went wrong");
  }
});

module.exports = profileRouter;

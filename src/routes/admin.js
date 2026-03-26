/*The below code is for personal use */
const express = require("express");
const adminRouter = express.Router();
const User=require("../models/user");
adminRouter.get("/api/getallusers", async (req, res) => {
  try {
    const userList=await User.find({}).select('-password');
    res.status(200).json({
        message:"User data fetched Successfully",
        data:userList
    })
  } catch (error) {
    console.log("Error occured while fetching the User data", e);
    res.status(500).json({
      message:"Something went wrong"
    });
  }
});


module.exports=adminRouter;
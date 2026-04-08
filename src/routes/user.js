const express = require("express");
const userRouter = express.Router();
const auth = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


userRouter.get("/api/users/request/received", auth, async (req, res) => {
  try {
    const userID = req.user._id;

    const requestList = await ConnectionRequest.find({
      toUserID: userID,
      status: "interested" || "accepted",
    })
      .populate("fromUserID", ["firstName", "lastName", "photourl"])
      .select("-createdAt -updatedAt -__v -_id -toUserID");

    res.status(200).json({
      message: "Data fetched Successfully",
      requests: requestList,
    });
  } catch (error) {
    console.log(error, "Error Occured while fetching the Connection request");
    res.status(500).json({
      message: "Error occured while fetching the Data",
    });
  }
});

userRouter.get("/api/users/connection", auth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    // Here i will get all the requested connection that has been accepted and connection send to the
    // user which have been accepted
    const list = await ConnectionRequest.find({
      $or: [{ fromUserID: loggedInUser }, { toUserID: loggedInUser }],
    })
      .populate("fromUserID", ["firstName", "lastName", "photourl"])
      .populate("toUserID", ["firstName", "lastName", "photourl"])
      .select("-createdAt -updatedAt -__v");

    // I will filtered the connection list which is not equal to loggedin user so that i can show the list
    // of users that i am connected with
    const ConnectedUsers = list.map((row) => {
      if (row.fromUserID._id.toString() === loggedInUser.toString()) {
        return row.toUserID;
      }
      return row.fromUserID;
    });

    res.status(200).json({
      message: "Data fetched Successfully",
      data: ConnectedUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

userRouter.get("/api/feed", auth, async (req, res) => {
  // Check the fromuserId not equal to the userid in the list and toUserId in the List
  //Get all users which are not in the List
  // Check the connection string is already made by checking the ConnectionStringDB with fromUserID and
  // ToUserID already exists.
  // If both succeed Yes then i will show the user x to currentUser;

  try {
    const userId = req.user._id;
    // How many Data i need to skip
    let limit = parseInt(req.query.limit)||10;
    let page=parseInt(req.query.page)||1;

    if (limit > 50 || limit == 0) {
      limit = 50;
     
    }

    let skip = (page-1)*limit;

    // The above request contains entire
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserID: userId }, { toUserID: userId }],
    });

    const hiddenUsers = new Set();
    connections.forEach((req) => {
      hiddenUsers.add(req.fromUserID._id);
      hiddenUsers.add(req.toUserID._id);
    });

    hiddenUsers.add(userId);

    const feedUsers = await User.find({
      _id: { $nin: Array.from(hiddenUsers) },
    })
      .select("-password -createdAt -updatedAt -__v")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "User List",
      data: feedUsers,
    });
  } catch (error) {
    console.error(error, "Error Occured in feed");
    res.status(500).json({
      message: "Error occured while fetching the Data",
    });
  }
});
module.exports = userRouter;

const express = require("express");
const feedRouter = express.Router();
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const auth = require("../middleware/auth");

feedRouter.post("/api/send/:status/:userID", auth, async (req, res) => {
  try {
    const status = req.params.status;
    const toUserID = req.params.userID;
    const fromUserID = req.user._id;
    const validStatus = ["interested", "ignored"];

    // Check a status is Valid either "interested" or "ignored"
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: `Invalid ${status} status`,
      });
    }

    //2. Check the user is trying to give request to himself

    if (toUserID === fromUserID.toString()) {
      return res.status(400).json({
        message: `Self Request not valid`,
      });
    }

    // 3. Check the receiver UserID exists (Added await)
    const isReceiverExists = await User.findById(toUserID);
    if (!isReceiverExists) {
      return res.status(400).json({
        message: `${toUserID} not found`,
      });
    }

    // 4 & 5. Check if the request is already made (Added await)
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserID, toUserID },
        { fromUserID: toUserID, toUserID: fromUserID },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Request already made",
      });
    }

    const newConnectionRequest = new ConnectionRequest({
      fromUserID,
      toUserID,
      status,
    });

    const requestUpdate = await newConnectionRequest.save();

    res.status(201).json({
      message: `${status === "interested" ? "Request send to" : "Ignored"}  ${isReceiverExists.firstName}`,
      data: requestUpdate,
    });
  } catch (error) {
    console.error("Error while sending the request", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

feedRouter.post("/api/review/:status/:requestID", auth, async (req, res) => {
  try {
    const { status, requestID } = req.params;
    const receiverID = req.user._id;
    const validStatus = ["accepted", "rejected"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: `Invalid status ${status}`,
      });
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestID,
      status: "interested",
      toUserID: receiverID,
    });

    if (!connectionRequest) {
      return res.status(400).send({
        message: "Request not found or invalid status",
      });
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    res.status(201).json({
      message: `User requested ${status} successfully`,
      data,
    });
  } catch (error) {
    console.error("Error while reviewing the Request", error);
    res.status(500).json({
      message: "Error while reviewing the Request",
    });
  }
});

module.exports = feedRouter;

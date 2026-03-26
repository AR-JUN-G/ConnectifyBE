const express = require("express");
const auth = require("../middleware/auth");
const chatRouter = express.Router();
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const MessageModel = require("../models/message");
const ChatModel = require("../models/chat");
// I Will send the latest chat list
chatRouter.get("/api/direct/chats", auth, async (req, res) => {
  try {
    const userID = req.user._id;

    const chatList = await Chat.find({ participants: userID })
      .populate("participants", "_id firstName lastName photourl")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .select("participants latestMessages");

    let chatMembers=chatList.map((chat)=>{

       let otherUser=chat.participants.find((participant)=>{
        participant._id!==userID
       });

       return {
         userID:otherUser?._id,
         firstName:otherUser?.firstName,
         lastName:otherUser?.lastName,
         photourl:otherUser?.photourl,
         latestMessage:otherUser?.latestMessage
       }
    })
    res.status(200).json({
      message: "Chat list fetched successfully",
      data: chatList,
    });
  } catch (error) {
    console.error(error, "Something went wrong");
  }
});

// GET /api/friends/available-for-chat
// Returns a list of friends the user does NOT have a 1-on-1 chat with yet
chatRouter.get(
  "/api/direct/friends/available-for-chat",
  auth,
  async (req, res) => {
    try {
      const userID = req.user._id;

      const connections = await ConnectionRequest.find({
        $or: [{ fromUserID: userID }, { toUserID: userID }],
        status: "accepted",
      }).populate("fromUserID toUserID", "_id firstName lastName photourl");

      const friends = connections.map((conn) => {
        if (conn.fromUserID._id.toString() === userID.toString()) {
          return conn.toUserID;
        }
        return conn.fromUserID;
      });

      const existingChats = await Chat.find({
        isGroupChat: false,
        participants: userID,
      });

      const usersWithExistingChats = new Set();

      console.log(existingChats, "Chats");
      existingChats.forEach((chat) => {
        chat.participants.forEach((participantID) => {
          if (participantID.toString() != userID.toString()) {
            usersWithExistingChats.add(participantID.toString());
          }
        });
      });
      console.log(usersWithExistingChats, "ExistingUser");
      const availableFriends = friends.filter((friend) => {
        if (!usersWithExistingChats.has(friend)) {
          return friend;
        }
      });

      res.status(200).json({
        message: "Available Friends Fetched",
        data: availableFriends,
      });
    } catch (error) {
      console.error(error, "something went wrong");
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },
);

chatRouter.get("/api/direct/:roomID", auth, async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let roomID = req.params.roomID;

    if (limit > 50 || limit == 0) {
      limit = 50;
    }

    let skip = (page - 1) * limit;

    let room = await ChatModel.findOne({ chatID: roomID });

    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    if (!room.participants.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this chat" });
    }
    let message = await MessageModel.find({ chatId: room._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: message,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = chatRouter;

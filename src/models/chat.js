const Mongoose = require("mongoose");

const chatSchema = new Mongoose.Schema(
  {
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    chatID: {
      type: String,
      trim: true,
    },
    participants: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
    ],
    // For showing the Latest message in sidebar
    latestMessage: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    /// The person who created the group
    adminId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const ChatModel = Mongoose.model("Chat", chatSchema);

module.exports = ChatModel;

/*
  isGroupChat -> helps to classify group and individual chats
  chatName -> we can keep them as roomName
  participants -> For Group chat many people  
               -> For direct chat only 2 People
  latestMessage -> Stored for showing the UI

*/

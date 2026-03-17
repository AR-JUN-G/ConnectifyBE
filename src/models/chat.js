const Mongoose = require("mongoose");

const chatSchema = new Mongoose.Schema(
  {
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    chatName: {
      type: String,
      trim: true,
    },
    participants: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For showing the Latest message in sidebar
    latestMessages: {
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

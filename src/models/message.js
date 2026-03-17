const Mongoose = require("mongoose");

const messageSchema = new Mongoose.Schema(
  {
    chatId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref:"Chat",
      required: true,
    },
    senderId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const MessageModel = Mongoose.model("Messages", messageSchema);

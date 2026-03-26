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

const MessageModel = Mongoose.model("Message", messageSchema);

module.exports=MessageModel;


/*
  1. ChatID tells me which chat the message Belongs
  2. Storing the SenderID for displaying the Which side of the chat it Belongs(left or right)
  3. Single Message
  4. timeStamps-> Get all the message and return them in descending order

  
*/
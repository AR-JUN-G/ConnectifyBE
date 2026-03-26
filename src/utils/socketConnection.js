const { Server } = require("socket.io");
const ChatModel = require("../models/chat");
const MessageModel = require("../models/message");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:1234",
    },
  });

  io.on("connection", (socket) => {
    /// Help user to join chat with other user in direct chat
    socket.on("joinChat", ({ fromUserID, toUserID, firstName }) => {
      const room = [fromUserID, toUserID].sort().join("_");
      console.log(`${firstName} joined the ${room}`);
      socket.join(room);
    });

    socket.on("joinGroupChat", () => {});

    socket.on(
      "sendMessage",
      async ({ fromUserID, toUserID, messageSendBy, text }) => {
        const room = [fromUserID, toUserID].sort().join("_");
        /* 
           1. Check if the room exisits
           2. If not create new Room get the _id of the newly created Room
           3. Push the Message to message DB
        */

        let chatDoc = await ChatModel.findOne({
          chatID: room,
        });

        if (!chatDoc) {
          chatDoc = await ChatModel.create({
            isGroupChat: false,
            chatID: room,
            participants: [fromUserID, toUserID],
          });
        }

        const newMessage = await MessageModel.create({
          chatId: chatDoc._id,
          senderId: fromUserID,
          message: text,
        });

        chatDoc.latestMessages = newMessage._id;
        await chatDoc.save();

        console.log("Message Saved Successfully");
        
        io.to(room).emit("messageReceived", {
          messageSendBy,
          text,
          chatID: chatDoc._id,
        });
      },
    );

    socket.on("disconnect", () => {
      console.log("Client Disconnected 🥲");
    });
  });
};

module.exports = initializeSocket;

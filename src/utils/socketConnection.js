const { Server } = require("socket.io");
const ChatModel = require("../models/chat");
const MessageModel = require("../models/message");

const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:1234",
    },
  });

  io.on("connection", (socket) => {
    const userID = socket.handshake.query.userID;

    if (userID) {
      if (!onlineUsers.has(userID)) {
        onlineUsers.set(userID, new Set());
      }

      onlineUsers.get(userID).add(socket.id);

      io.emit("getOnlineUser", Array.from(onlineUsers.keys()));
    }
    /// Help user to join chat with other user in direct chat
    socket.on(
      "joinChat",
      ({ fromUserID, toUserID, fromUserName, toUserName }) => {
        const room = [fromUserID, toUserID].sort().join("_");
        console.log(`${fromUserName} joined the ${room}`);
        socket.join(room);
      },
    );

    socket.on("joinGroupChat", () => {});

    socket.on("sendMessage", async ({ fromUserID, toUserID, text }) => {
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

      chatDoc.latestMessage = newMessage._id;
      await chatDoc.save();

      console.log("Message Saved Successfully");

      socket.to(room).emit("messageReceived", {
        _id: newMessage._id,
        senderId: fromUserID,
        message: text,
        createdAt: newMessage.createdAt,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client Disconnected 🥲");
      if (userID && onlineUsers.has(userID)) {
        const userSockets = onlineUsers.get(userID);
        userSockets.delete(socket.id);

        if (userSockets.size == 0) {
          onlineUsers.delete(userID);
          io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        }
      }
    });
  });
};

module.exports = initializeSocket;

const { socket } = require("socket.io");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.io("joinChat", () => {});
    socket.io("sendMessage", () => {});
  });
};

module.exports = initializeSocket;

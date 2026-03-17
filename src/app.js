const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const feedRouter = require("./routes/feed");
const profileRouter = require("./routes/profile");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const cors=require("cors");
const { createServer } = require('http');
const initializeSocket = require("./utils/socketConnection");

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:'http://localhost:1234',
  credentials: true
}));

app.use("/", authRouter);
app.use("/", feedRouter);
app.use("/", profileRouter);
app.use("/", adminRouter);
app.use("/",userRouter);

const server=createServer(app);
// initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Connection Established Successfully");

    server.listen(7777, () => {
      console.log("App is running");
    });
  })
  .catch(() => {
    console.log("Cant able to connect to Cluster");
  });

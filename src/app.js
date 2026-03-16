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

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/", authRouter);
app.use("/", feedRouter);
app.use("/", profileRouter);
app.use("/", adminRouter);
app.use("/",userRouter);

connectDB()
  .then(() => {
    console.log("Connection Established Successfully");

    app.listen(7777, () => {
      console.log("App is running");
    });
  })
  .catch(() => {
    console.log("Cant able to connect to Cluster");
  });

const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const feedRouter = require("./routes/feed");
const profileRouter = require("./routes/profile");

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", feedRouter);
app.use("/", profileRouter);

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

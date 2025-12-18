const express = require("express");

const app = express();

app.use("/", (req, res) => {
  res.send("Hi");
});

app.use("/user", (req, res) => {
  res.send("Details of User");
});

app.use("/profile", (req, res) => {
  res.send("ProfileDetails");
});
app.listen(3000, () => {
  console.log("App is running");
});

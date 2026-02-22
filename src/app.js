const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.use(express.json());

app.post("/api/signup", async (req, res) => {
  try {
    const body = req.body;
    await User.create(body);
    res.status(201).send("User Created");
  } catch (e) {
    let errors = {};
    console.log(e);

    if (e.name == "ValidationError") {
      Object.keys(e.errors).forEach((key) => {
        errors[key] = e.errors[key].message;
      });
      res.status(400).send(errors);
    } else if (e.code == 11000) {
      const field = Object.keys(e.keyValue)[0];
      const message = `Duplicate Field Value entered for '${field}'.Please enter new value`;
      errors[field] = message;
      res.status(409).send(errors);
    } else {
      res.status(500).send("Something went wrong");
    }
  }
});

app.get("/api/feed", async (req, res) => {
  try {
    const data = await User.find({});
    res.status(200).json(data);
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
});

app.patch("/api/updateuser/:userid", async (req, res) => {
  const userId = req.params?.userid;
  const data = req.body;

  const immutableFields = ["emailId", "createdAt", "updatedAt"];
  const containImmutableFields = Object.keys(data).some((key) => {
    return immutableFields.includes(key);
  });

  if (containImmutableFields) {
    return res
      .status(400)
      .send("Update failed: You cannot modify protected fields like emailId.");
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    return res.status(404).send("User not found");
  }

  res.status(200).json({
    message: "User updated successfully",
    data: updatedUser,
  });
});

app.delete("/api/deleteuser", async (req, res) => {
  try {
    const id = req.body.id;
    await User.deleteOne({ _id: id });
    res.status(200).send("User Deleted Successfully");
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
});

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

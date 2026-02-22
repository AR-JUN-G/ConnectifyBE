const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignupData, validateLoginData } = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json());

app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;
    const validation = validateSignupData(req.body);

    if (!validation.isValid) {
      console.log("Inside");
      return res.status(400).json({ errors: validation.errors });
    }

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    console.log(hashedPassword);
    const newUser = await User.create({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "User Created Successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        emailId: newUser.emailId,
      },
    });
  } catch (e) {
    console.error("Signup Error:", e);
    let errors = {};

    if (e.name == "ValidationError") {
      Object.keys(e.errors).forEach((key) => {
        errors[key] = e.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    if (e.code == 11000) {
      const field = Object.keys(e.keyValue)[0];
      const message = `Duplicate Field Value entered for '${field}'.Please enter new value`;
      errors[field] = message;
      return res.status(409).json({ errors });
    }

    res
      .status(400)
      .json({ message: "An Unexpected Internal Server error Occured" });
  }
});

app.post("/api/login", async (req, res) => {
  try{
    const {emailId,password}=req.body;
    const DUMMY_HASH = "$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH028YwR/9HnE3.d7j4q7.2aJ./uG";
    const validation=validateLoginData(req.body);
  
    if(!validation.isValid){
      return res.status(401).json({
        "message":"User not found"});
    }

    const getUser=await User.findOne({emailId});
    
    if(getUser){
      const hashedPassword=getUser.password;
      const isPasswordMatch=await bcrypt.compare(password, hashedPassword);
      if(!isPasswordMatch){
        return res.status(401).json({"message":"Invalid UserID or Password"});
      }
      return res.status(200).json({
        "message":"User Logged in Successfully"
      })
    }
    else{
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({
        "message":"Invalid UserID or Password"
      })
    }
  }
  catch(e){
    console.error("Login Error",e);
    res.send(500).json({
      "message":"Something went wrong"
    })
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
  try {
    const userId = req.params?.userid;
    const data = req.body;

    const immutableFields = ["emailId", "createdAt", "updatedAt"];
    const containImmutableFields = Object.keys(data).some((key) => {
      return immutableFields.includes(key);
    });

    if (containImmutableFields) {
      return res
        .status(400)
        .send(
          "Update failed: You cannot modify protected fields like emailId.",
        );
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
  } catch (e) {
    console.log(e);
    res.status(500).send("Something went wrong");
  }
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

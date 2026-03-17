const express = require("express");
const authRouter = express.Router();
const {
  validateSignupData,
  validateLoginData,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

authRouter.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;
    const validation = validateSignupData(req.body);

    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

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

authRouter.post("/api/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const DUMMY_HASH =
      "$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH028YwR/9HnE3.d7j4q7.2aJ./uG";
    const validation = validateLoginData(req.body);

    if (!validation.isValid) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const getUser = await User.findOne({ emailId });

    if (getUser) {
      const hashedPassword = getUser.password;
      const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid UserID or Password" });
      }

      const token = jwt.sign(
        {
          userId: getUser._id,
        },
        "secret",
        { expiresIn: "3d" },
      );

      res.cookie("token", token, { httpOnly: true });

      return res.status(200).json({
        message: "User Logged in Successfully",
        userID: getUser._id,
        name: getUser.firstName,
        email: getUser.emailId,
        photourl: getUser.photourl,
      });
    } else {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({
        message: "Invalid UserID or Password",
      });
    }
  } catch (e) {
    console.error("Login Error", e);
    res.send(500).json({
      message: "Something went wrong",
    });
  }
});

authRouter.post("/api/logout", async (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .status(200)
    .json({ message: "User logged Out Successfully" });
});
module.exports = authRouter;

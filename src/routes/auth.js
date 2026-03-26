const express = require("express");
const authRouter = express.Router();
const {
  validateSignupData,
  validateLoginData,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Token = require("../models/token");
const auth = require("../middleware/auth");

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
      data: {
        id: newUser._id,
        firstName: newUser.firstName,
        emailId: newUser.emailId,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    let errors = {};

    if (error.name == "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res
        .status(400)
        .json({ message: "Error Occured while Signup", errors });
    }
    if (error.code == 11000) {
      const field = Object.keys(e.keyValue)[0];
      const message = `Duplicate Field Value entered for '${field}'.Please enter new value`;
      errors[field] = message;
      return res
        .status(409)
        .json({ message: "Error Occured while Signup", errors });
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

      const accessToken = jwt.sign(
        {
          userID: getUser._id,
        },
        "secret",
        { expiresIn: "15m" },
      );

      const refreshToken = jwt.sign(
        {
          userID: getUser._id,
        },
        "secret",
        { expiresIn: "7d" },
      );

      await Token.findOneAndUpdate(
        { userID: getUser._id },
        { $push: { refreshToken: refreshToken } },
        { new: true, upsert: true },
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "User Logged in Successfully",
        userID: getUser._id,
        firstName: getUser.firstName,
        lastName: getUser.lastName,
        email: getUser.emailId,
        photourl: getUser.photourl,
      });
    } else {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({
        message: "Invalid UserID or Password",
      });
    }
  } catch (error) {
    console.error("Login Error", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// I need to delete the Refresh Token in the DB
authRouter.post("/api/auth/logout", auth, async (req, res) => {
  try {
    const userID = req.user._id;
    const refreshToken = req.cookies.refreshToken;

    await Token.updateOne(
      { userID: userID },
      {
        $pull: { refreshToken: refreshToken },
      },
    );
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "User logged Out Successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      message: "Something went wrong during logout",
    });
  }
});

authRouter.get("/api/auth/getSessionDetail", auth, async (req, res) => {
  res.status(200).json({
    message: "User Authenticated",
    user: {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      photourl: req.user.photourl,
      emailId: req.user.emailId,
    },
  });
});

authRouter.get("/api/auth/refresh", async (req, res) => {
  try {
    // 1. Grab the refresh token from the HTTP-only cookie
    const oldRefreshToken = req.cookies.refreshToken;

    // If there's no token at all, they are truly logged out
    if (!oldRefreshToken) {
      return res
        .status(401)
        .json({ message: "No refresh token found. Please log in." });
    }

    // 2. Verify the Refresh Token cryptographically
    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, "secret");
    } catch (error) {
      // If the refresh token itself is expired or tampered with
      return res
        .status(403)
        .json({ message: "Refresh token expired or invalid. Please log in." });
    }

    const userID = decoded.userID;

    // 3. The Security Check: Does this exact token exist in MongoDB?
    // We look for the user's document that contains this specific token in the array
    const tokenDoc = await Token.findOne({
      userID: userID,
      refreshToken: oldRefreshToken,
    });

    if (!tokenDoc) {
      // MASSIVE RED FLAG: The token is mathematically valid, but NOT in our database.
      // This means a hacker might be trying to use a stolen, old token.
      // Best practice: Delete ALL their tokens to secure the account.
      await Token.findOneAndDelete({ userID: userID });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res
        .status(403)
        .json({ message: "Security breach detected. All sessions revoked." });
    }

    // 4. The Rotation: Generate brand new tokens
    const newAccessToken = jwt.sign({ userID: userID }, "secret", {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign({ userID: userID }, "secret", {
      expiresIn: "7d",
    });

    // 5. Update MongoDB: Remove the old token from the array and push the new one
    await Token.updateOne(
      { userID: userID },
      {
        $pull: { refreshToken: oldRefreshToken },
      },
    );
    await Token.updateOne(
      { userID: userID },
      {
        $push: { refreshToken: newRefreshToken }, // Save the new one
      },
    );

    // 6. Set the new HTTP-only cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 7. Send success! React can now retry its failed request.
    return res.status(200).json({ message: "Tokens rotated successfully." });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during token refresh." });
  }
});
module.exports = authRouter;

const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

// initialize S3Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

profileRouter.get("/api/profile", auth, async (req, res) => {
  const userData = req.user;
  console.log(userData);
  res.status(200).json({
    message: "User Detail Fetched Successfully",
    data: userData,
  });
});

profileRouter.patch("/api/profile", auth, async (req, res) => {
  try {
    const userId = req.user._id;
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

    if (data.password) {
      const saltRound = 10;
      data.password = await bcrypt.hash(data.password, saltRound);
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { returnDocument: "after", runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

profileRouter.get("/api/upload-url", auth, async (req, res) => {
  try {
    const fileType = req.query.fileType || "image/jpeg";
    const extension = fileType.split("/")[1] || "jpg";
    const filename = crypto.randomBytes(16).toString('hex') + '.' + extension;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `profiles/${filename}`,
      ContentType: fileType,
    });

    // Create a URL valid for 60 seconds
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    res.json({
      uploadUrl,
      publicUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${filename}`,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
});

module.exports = profileRouter;

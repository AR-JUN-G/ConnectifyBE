const mongoose = require("mongoose");
const thirdPartyValidator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => {
          if (!thirdPartyValidator.isEmail(value)) {
            throw new Error("Invalid Email Address");
          }
        },
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (value) => {
          if (!thirdPartyValidator.isStrongPassword(value)) {
            throw new Error("Enter a Strong Password");
          }
        },
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate: {
        validator: (value) => {
          console.log(value);
          if (!["male", "female", "others"].includes(value)) {
            throw new Error("Invalid Gender");
          }
        },
      },
    },
    photourl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      validate: {
        validator: (value) => {
          if (!thirdPartyValidator.isURL(value)) {
            throw new Error("The request url is wrong");
          }
        },
      },
    },
    about: {
      type: String,
      default: "Hello there i am using Developer Hub",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://user:0911@nodepractice.fjegnnq.mongodb.net/DevTinder?appName=NodePractice",
  );
};

module.exports = connectDB;

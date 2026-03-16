const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb://user:0911@ac-ezadzfn-shard-00-00.fjegnnq.mongodb.net:27017,ac-ezadzfn-shard-00-01.fjegnnq.mongodb.net:27017,ac-ezadzfn-shard-00-02.fjegnnq.mongodb.net:27017/DevTinder?ssl=true&replicaSet=atlas-xwl2sk-shard-0&authSource=admin&appName=NodePractice"
  );
};

module.exports = connectDB;

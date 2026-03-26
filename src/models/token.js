const Mongoose = require("mongoose");

const TokenSchema = new Mongoose.Schema({
  userID: Mongoose.Schema.Types.ObjectId,
  refreshToken: [String],
});

const Token = Mongoose.model("Token", TokenSchema);

module.exports = Token;

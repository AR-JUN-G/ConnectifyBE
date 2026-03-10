const Mongoose = require("mongoose");

const connectionRequestSchema = new Mongoose.Schema(
  {
    fromUserID: {
      type: Mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    toUserID: {
      type: Mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: `{VALUE} is not a status type`,
      },
    },
  },
  {
    timestamps: true,
  },
);

const ConnectionRequestModel = Mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports=ConnectionRequestModel;

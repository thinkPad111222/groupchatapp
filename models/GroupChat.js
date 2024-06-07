const mongoose = require("mongoose");

const GroupChatSchema = mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    group_id: {
      type: mongoose.Types.ObjectId,
      ref: "group",
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timeStamps: true,
  }
);

const GROUPCHAT = mongoose.models.groupchat || mongoose.model("groupchat", GroupChatSchema);

module.exports = GROUPCHAT;

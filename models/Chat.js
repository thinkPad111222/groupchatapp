const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    receiver_id: {
      type: mongoose.Types.ObjectId,
      ref: "user",
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

const CHAT = mongoose.models.chat || mongoose.model("chat", ChatSchema);

module.exports = CHAT;

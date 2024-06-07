const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    is_online: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true }
);

const USER = mongoose.models.user || mongoose.model("user", UserSchema);

module.exports = USER;

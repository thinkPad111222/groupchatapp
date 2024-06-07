const mongoose = require("mongoose");

const MemberSchema = mongoose.Schema(
  {
    group_id: {
      type: mongoose.Types.ObjectId,
      ref: "group",
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
   
  },
  {
    timeStamps: true,
  }
);

const MEMBER = mongoose.models.member || mongoose.model("member", MemberSchema);

module.exports = MEMBER;

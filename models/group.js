const mongoose = require("mongoose");

const groupSchema = mongoose.Schema(
  {
    creator_id: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
      require:true,
    },
    image: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
  },
  {
    timeStamps: true,
  }
);

const GROUP = mongoose.models.group || mongoose.model("group", groupSchema);

module.exports = GROUP;

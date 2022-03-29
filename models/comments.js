const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var commentSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    dish: {
      type: Schema.Types.ObjectId,
      ref: "Dish",
    },
  },
  {
    timestamps: true,
  }
);

let Comments = mongoose.model("Comment", commentSchema);

module.exports = Comments;

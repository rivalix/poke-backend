const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  birthday: {
    type: Date,
  },
  hobbie: {
    type: String,
    default: "",
    trim: true,
  },
  doc_identity: {
    type: String,
  },
  profileImage: {
    url: { type: String },
    name: { type: String },
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

exports.User = mongoose.model("User", userSchema);

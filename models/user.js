const mongoose = require("mongoose");
const moment = require("moment");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  birthday: {
    type: Date,
  },
  age: {
    type: Number,
  },
  isAdult: {
    type: Boolean,
    default: false,
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

userSchema.pre("save", function (next) {
  if (this.birthday) {
    const age = moment().diff(this.birthday, "years");
    if (age > 18) {
      this.isAdult = true;
    }
    this.age = age;
  }
  next();
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

exports.User = mongoose.model("User", userSchema);

const mongoose = require("mongoose");
const validator = require("validator");


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    uppercase: true,
  },
  email: {
    type: String,
    required: [true, "Email address required"],
    lowercase: true,
    validate: (value) => {
      return validator.isEmail(value);
    },
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: Date()
  },
  empNo: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
      // unique: true
  },
  department: {
    type: String,
    trim: true,
    required: true
  },
  isAdmin: {
    type: Boolean, 
    default: false, // Default is not the ADMIN
  },
  isApprover: {
    type: Boolean,
    default: false // isApprover is for leave request's aprrover person
  }
});


const User = mongoose.model("User", UserSchema);

module.exports = User;

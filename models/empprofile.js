const mongoose = require('mongoose');

const empProfileSchema = new mongoose.Schema({
    //   empNo: {
    //   type: String,
    //   uppercase: true,
    //   trim: true,
    //   // required: true,
    //   unique: true
    // },
    // firstName: {
    //   type: String,
    //   trim: true
    //   // required: true
    // },
    // lastName: {
    //   type: String,
    //   trim: true
    //   // required: true
    // },
    gender: {
      type: String,
      trim: true
      // required: true
    },
    dateOfBirth: {
      type: String,
      Default: Date
      // required: true
    },
    // department: {
    //   type: String,
    //   trim: true
    //   // required: true
    // },
    jobTitle: {
      type: String,
      uppercase: true,
      trim: true
      // required: true
    },
    approver: {
      type: String,
      uppercase: true,
      trim: true
      // required: true
    },
    leaveEntitlement: {
      type: Number,
      trim: true
      // required: true
    },
    leaveBalance: {
      type: Number,
      trim: true
      // required: true
    },
    counterEL: {
      type: Number,
      min: 0,
      max: 3,
      default: 3
  },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: String,
      default: Date()
    }
  });
  
  const empProfileInfo = mongoose.model("empProfileInfo", empProfileSchema);

module.exports = empProfileInfo;
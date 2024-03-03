const mongoose = require('mongoose');

// var CounterSchema = new mongoose.Schema({
//     _id: {type: String, required: true},
//     seq: { type: Number, default: 0 }
// });
// var counter = mongoose.model('counter', CounterSchema);

const leaveInfoSchema = new mongoose.Schema({
    leaveID: {
        type: Number,
        default: 0
    },
    fullName:{
        type: String,
        trim: true
    },
    empNo: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    email:{
        type: String,
        trim: true
    },
    leavecat: {
        type: String
    },
    fromDate: {
        type: Date,
        default: new Date(),
        trim: true
    },
    toDate: {
        type: Date,
        default: new Date(),
        trim: true
    },
    day: {
        type: Number,
        trim: true
    },
    timetype: {
        type: String,
        trim: true
    },
    reason: {
        type: String,
        trim: true
    },
    approver: {
        type: String,
        trim: true
    },
    status:{
        type: String,
        trim: true,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    actionBy: {
        type: String,
        trim: true,
        default: null
    },
    submitDate: {
        type: String,
        default: Date

    },
    updateDate: {
        type: String,
        default: ' '
    },
    approvedDate: {
        type: String,
        default: ' '
    },
    updateBy: {
        type: String,
        trim: true,
        default: null
    }

});



const leaveInfo = mongoose.model('leaveInfo', leaveInfoSchema);


// function getSequenceNextValue(coll_seqName) {
//     let seq_col = tsportal.leaveInfo.findAndModify({
//     query: { leaveID: col_id },
//     update: { $inc: { seq_val: 1 } },
//     new: true
//     });
//     return seq_col.sequence_value;
//   }


// leaveInfoSchema.pre('save', function(next) {
//     var doc = this;
//     counter.findByIdAndUpdateAsync({_id: 'leaveID'}, {$inc: { seq: 1} }, {new: true, upsert: true}).then(function(count) {
//         console.log("...count: "+JSON.stringify(count));
//         doc.sort = count.seq;
//         next();
//     })
//     .catch(function(error) {
//         console.error("counter error-> : "+error);
//         throw error;
//     });
// });

module.exports = leaveInfo;



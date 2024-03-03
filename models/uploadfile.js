const mongoose = require('mongoose');


const uploadFileScheme = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        uppercase: true
    },
    newFileName: {
        type: String,
        required: true
    },
    desc: {
        type: String,  
    },
    date: {
        type: String,
        default: Date()
    }
});



const memoDetails = mongoose.model('memoDetails', uploadFileScheme);

module.exports = memoDetails;

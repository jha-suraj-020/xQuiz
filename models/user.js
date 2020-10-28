const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    admissionNo: {
        type: Number,
        required: true,
    },
    classs: {
        type: Number,
        required: true,
    },
    mobileNo: {
        type: Number,
        required: true
    },
    sec: {
        type: String,
        required: true,
    },
    feePaid: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

module.exports = new mongoose.model('user', userschema);
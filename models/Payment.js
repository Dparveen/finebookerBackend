/////models is use for define schema model
const mongoose = require('mongoose');

const FirSchema = new mongoose.Schema({
    uid: {
        type: 'ObjectId', ref: 'tbl_user',
        default: "",
        required: true
    },
    postId: {
        type: 'ObjectId', ref: 'tbl_post',
        default: ""
    },
    firId: {
        type: 'ObjectId', ref: 'tbl_fir',
        default: ""
    },
    paymentAmount: {
        type: Number,
        default: ""
    },
    assignTo: {
        type: 'ObjectId', ref: 'tbl_expert',
        default: ""
    },
    status: {
        type: String,
        default: ""
    },
}, { timestamps: true });


module.exports = mongoose.model("tbl_payment", FirSchema);
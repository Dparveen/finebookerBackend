/////models is use for define schema model
const mongoose = require('mongoose');

const DepositeRequestSchema = new mongoose.Schema({
    requestFrom: { type: String, required: true },
	amount: { type: Number, required: true },
    transectionId: { type: String, required: true},
	status: { type: Number, default: 0},
	comment: { type: String,},
}, { timestamps: true })

module.exports = mongoose.model("tbl_deposite_request", DepositeRequestSchema);
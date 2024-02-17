/////models is use for define schema model
const mongoose = require('mongoose');

const UserTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, required:true},
    value: { type: Number, required: true },
	status: { type: Number, required: true, default:1 },
}, { timestamps: true })

module.exports = mongoose.model("tbl_userType", UserTypeSchema);
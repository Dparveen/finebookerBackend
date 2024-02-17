/////models is use for define schema model
const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
    requestFrom: { type: String, required: true },
	amount: { type: Number, required: true },
    transectionId: { type: String, required: true},
    pType:{type:Number, required:true},
    ahn:{type:String},
    an:{type:String},
    ic:{type:String},
    ui:{type:String},
    m:{type:String},
    wa:{type:String},
    comment:{type:String},
	status: { type: Number, default: 0},
}, { timestamps: true })
/////////////status 0 pening, 1 conform 2 reject

module.exports = mongoose.model("tbl_withdrawal_request", WithdrawalRequestSchema);
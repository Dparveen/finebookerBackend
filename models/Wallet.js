/////models is use for define schema model
const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    fromUser: { type: String, required: true },
    toUser: { type: String, required: true },
	amount: { type: Number, required: true },
    transectionId: { type: String, required: true},
    transectionType: { type: String, required: true },
	status: { type: Number, default: 0, required: true},
}, { timestamps: true })

module.exports = mongoose.model("tbl_wallet_transection", WalletSchema);
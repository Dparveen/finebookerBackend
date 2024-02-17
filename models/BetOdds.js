/////models is use for define schema model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BetOddsSchema = new mongoose.Schema({
    userId:{type: Schema.Types.ObjectId,ref: 'tbl_user'},
    amount:{type: Number, required: true},
	liblity:{type: Number, required: true},
	profit:{type: Number, required: true},
    matchId: { type: Number, required: true},
    marketId: { type: String, required: true },
    sectionId:{type:Number, required: true},
    odds:{type: String, required: true},
    betType:{type: String, required: true},
    price:{type: Number, required: true},
    size:{type: Number, required: true},
	status: { type: Number, required: true, default:1 },
	result:{type:String, default:'Pending'}
}, { timestamps: true })

module.exports = mongoose.model("tbl_bet_odds", BetOddsSchema);
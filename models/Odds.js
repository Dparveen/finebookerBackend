/////models is use for define schema model
const mongoose = require('mongoose');

const OddsSchema = new mongoose.Schema({
    market_id: { type: String, required: true, unique: true },
	gameId:{type: Number}, comptationId:{type: Number}, eventID:{type: Number},
    isMarketDataDelayed:{type: Boolean},
    oddsStatus:{type: Number, default:1},
	status:{type: String},
    betDelay:{type: Number},
    bspReconciled:{type: Boolean,},
    complete:{type: Boolean,},
    inplay:{type: Boolean,},
    numberOfWinners:{type: Number},
    numberOfRunners:{type: Number},
    numberOfActiveRunners:{type: Number},
    lastMatchTime:{type: String,},
    totalMatched:{type: Number,},
    totalAvailable:{type: Number},
    crossMatching:{type: Boolean},
    runnersVoidable:{type: Boolean},
    version:{type: Number,},
	updateTime:{type:String},
    runners:{type: Array, default: []},
	lastUpdate:{type: Number, default: Date.now}
}, { timestamps: true })

module.exports = mongoose.model("tbl_odds", OddsSchema);
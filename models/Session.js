/////models is use for define schema model
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    matchId:{ type: Number, unique: true },
    session:{ type: Array, default:[]},
	lastUpdate:{type: Number, default: Date.now()},
	status:{type:Number, default:1}
}, { timestamps: true })

module.exports = mongoose.model("tbl_session", SessionSchema);
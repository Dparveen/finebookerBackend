/////models is use for define schema model
const mongoose = require('mongoose');

const SportsSchema = new mongoose.Schema({
    eventType:{ type: Number, required: true},
    name:{ type: String, required: true},
    marketCount:{ type: Number, required: true},
    status:{ type: Number,default: 1},
	lastUpdate:{type: Number, default: Date.now}
}, { timestamps: true })

module.exports = mongoose.model("tbl_sports", SportsSchema);
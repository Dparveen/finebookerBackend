const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
    GameId: { type: Number, required: true },
    ComponentId: { type: Number, required: true },
    EventID: { type: Number, required: true },
    marketId: { type: String, required: true, unique: true },
    marketName: { type: String },
    marketStartTime: { type: String },
    totalMatched: { type: Number },
    runners: { type: Array },
    status: { type: Number, default: 1 },
    lastUpdate: { type: Number, default: Date.now() }
}, { timestamps: true });

module.exports = mongoose.model("tbl_market", MarketSchema);

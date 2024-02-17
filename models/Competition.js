/////models is use for define schema model
const mongoose = require('mongoose');

const CompetitionSchema = new mongoose.Schema({
    EventTypeID: { type: Number, required: true },
    competitionID: { type: Number, required: true, unique: true },
    competitionName: { type: String },
    marketCount: { type: Number },
    competitionRegion: { type: String },
    status: { type: Number, default: 1 },
    lastUpdate: { type: Number, default: Date.now() }
}, { timestamps: true });

module.exports = mongoose.model("tbl_competition", CompetitionSchema);

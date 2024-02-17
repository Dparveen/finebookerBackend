const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    url: { type: String, default: '' },
    status: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model("tbl_banner", BannerSchema);

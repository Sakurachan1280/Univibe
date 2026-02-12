const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image_url: { type: String, required: true },
    target_url: { type: String, default: '' },
    position: { type: String, default: 'home' }, // e.g., 'home_top', 'search_result'
    is_active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Banner', bannerSchema);

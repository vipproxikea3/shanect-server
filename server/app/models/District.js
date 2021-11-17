const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const District = new Schema(
    {
        level2_id: { type: String },
        name: { type: String },
        type: { type: String },
        level3s: [{ type: Schema.Types.ObjectId, ref: 'Ward' }],
        own: { type: Schema.Types.ObjectId, ref: 'Province' },
    },
    { timestamps: false, collection: 'districts' }
);

module.exports = mongoose.model('District', District);

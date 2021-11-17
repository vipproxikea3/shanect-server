const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Province = new Schema(
    {
        level1_id: { type: String },
        name: { type: String },
        type: { type: String },
        level2s: [{ type: Schema.Types.ObjectId, ref: 'District' }],
    },
    { timestamps: false, collection: 'provinces' }
);

module.exports = mongoose.model('Province', Province);

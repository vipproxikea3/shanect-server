const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Ward = new Schema(
    {
        level3_id: { type: String },
        name: { type: String },
        type: { type: String },
        own: { type: Schema.Types.ObjectId, ref: 'District' },
    },
    { timestamps: false, collection: 'wards' }
);

module.exports = mongoose.model('Ward', Ward);

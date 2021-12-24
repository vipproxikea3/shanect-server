const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SaveAdvise = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        advise: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true, collection: 'saveAdvises' }
);

module.exports = mongoose.model('SaveAdvise', SaveAdvise);

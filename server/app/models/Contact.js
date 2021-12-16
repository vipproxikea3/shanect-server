const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Contact = new Schema(
    {
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
        seen: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true, collection: 'contacts' }
);

module.exports = mongoose.model('Contact', Contact);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Message = new Schema(
    {
        from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String },
        images: [{ type: String }],
        reply: { type: Schema.Types.ObjectId, ref: 'Post' },
    },
    { timestamps: true, collection: 'messages' }
);

module.exports = mongoose.model('Message', Message);

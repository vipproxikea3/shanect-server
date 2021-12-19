const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Comment = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        post: { type: Schema.Types.ObjectId, ref: 'Post' },
        content: { type: String },
    },
    { timestamps: true, collection: 'comments' }
);

module.exports = mongoose.model('Comment', Comment);

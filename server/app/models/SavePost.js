const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SavePost = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        post: { type: Schema.Types.ObjectId, ref: 'Post' },
    },
    { timestamps: true, collection: 'savePosts' }
);

module.exports = mongoose.model('SavePost', SavePost);

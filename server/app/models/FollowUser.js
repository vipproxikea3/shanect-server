const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const FollowUser = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        follow: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true, collection: 'followUsers' }
);

module.exports = mongoose.model('FollowUser', FollowUser);

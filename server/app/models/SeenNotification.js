const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SeenNotification = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    },
    { timestamps: true, collection: 'SeenNotifications' }
);

module.exports = mongoose.model('SeenNotification', SeenNotification);

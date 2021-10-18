const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const CodeLog = new Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true, collection: 'codeLogs' }
);

module.exports = mongoose.model('CodeLog', CodeLog);

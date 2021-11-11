const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Category = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: Number,
        },
        icon: {
            type: String,
        },
        subCategory: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }],
    },
    { timestamps: true, collection: 'categories' }
);

module.exports = mongoose.model('Category', Category);

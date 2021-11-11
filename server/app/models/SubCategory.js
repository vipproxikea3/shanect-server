const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SubCategory = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true, collection: 'subCategories' }
);

module.exports = mongoose.model('SubCategory', SubCategory);

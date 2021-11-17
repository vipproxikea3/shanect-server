const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Post = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        title: { type: String },
        content: { type: String },
        images: [{ type: String }],
        status: { type: Boolean, default: true },
        categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        subCategories: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }],
        areas: [
            {
                province: { type: Schema.Types.ObjectId, ref: 'Province' },
                district: { type: Schema.Types.ObjectId, ref: 'District' },
                ward: { type: Schema.Types.ObjectId, ref: 'Ward' },
            },
        ],
    },
    { timestamps: true, collection: 'posts' }
);

module.exports = mongoose.model('Post', Post);

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        gender: {
            // 0. Another - 1. Male - 2. Female
            type: Number,
            default: 0,
        },
        dateOfBirth: {
            date: {
                type: Number,
            },
            month: {
                type: Number,
            },
            year: {
                type: Number,
            },
        },
        avatar: {
            type: String,
            default:
                'https://res.cloudinary.com/shanectteam/image/upload/v1634874318/user_zjvzyj.png',
        },
        cover: {
            type: String,
            default:
                'https://res.cloudinary.com/shanectteam/image/upload/v1637330712/cover_nz218q.jpg',
        },
        role: {
            // 0. User - 1. Admin
            type: Number,
            default: 0,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        advise: {
            level: { type: Number },
            categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
            description: { type: String },
            images: [{ type: String }],
            ready: { type: Boolean, default: false },
        },
        following: { type: Boolean },
        saves: { type: Number, default: 0 },
        saved: { type: Boolean },
    },
    { timestamps: true, collection: 'users' }
);

User.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

User.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
    return token;
};

module.exports = mongoose.model('User', User);

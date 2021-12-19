const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

const subCategoryController = {
    create: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            const { post, content } = req.body;

            const comment = new Comment();
            comment.user = user._id;
            comment.post = post;
            comment.content = content;

            await comment.save();

            return res.json({ comment });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const comments = await Comment.find({});
            return res.json({ comments });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const comment = await Comment.findOne({ _id: id });
            if (!comment)
                return res.status(500).json({ msg: 'This Comment not exist' });
            return res.json({ comment });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getByPost: async (req, res) => {
        try {
            const id = req.params.id;
            const comments = await Comment.find({ post: id });
            return res.json({ comments });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = subCategoryController;

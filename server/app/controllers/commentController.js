const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

const commentController = {
    create: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            const { post, content } = req.body;

            const postTmp = await Post.findOne({ _id: post });
            if (!postTmp)
                return res.status(400).json({ msg: 'Post not found' });

            let comment = new Comment();
            comment.user = user._id;
            comment.post = post;
            comment.content = content;

            if (req.file) {
                comment.image = req.file.path;
            }

            await comment.save();

            comment = await Comment.findOne({ _id: comment._id })
                .populate({
                    path: 'user',
                    model: 'User',
                    select: 'name avatar',
                })
                .populate({
                    path: 'post',
                    model: 'Post',
                    select: 'user',
                });

            if (!postTmp.user.equals(user._id))
                req.app.io.emit('comment', { comment });

            return res.json({ comment });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const comments = await Comment.find({}).populate({
                path: 'user',
                model: 'User',
                select: 'name avatar',
            });
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
            const comments = await Comment.find({ post: id }).populate({
                path: 'user',
                model: 'User',
                select: 'name avatar',
            });
            return res.json({ comments });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getByPostOfUser: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            let notifications = await Comment.find({})
                .populate({
                    path: 'user',
                    model: 'User',
                    select: 'name avatar',
                })
                .populate({
                    path: 'post',
                    model: 'Post',
                    select: 'user',
                });

            notifications = notifications.filter(
                (item) =>
                    item.post.user.equals(user._id) &&
                    !item.user.equals(user._id)
            );

            return res.json({ notifications });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = commentController;

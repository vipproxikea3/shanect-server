const Post = require('../models/Post');

const postController = {
    create: async (req, res) => {
        try {
            const user = req.user;

            if (!user) return res.status(400).json({ msg: 'User not found' });

            const { title, content, categories, subCategories, areas } =
                req.body;

            const images = req.files.map((item) => {
                return item.path;
            });

            post = new Post();
            post.user = user._id;
            post.title = title;
            post.content = content;
            post.images = images;
            post.categories = categories;
            post.subCategories = subCategories;
            post.areas = areas;
            await post.save();
            return res.json(post);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const posts = await Post.find({})
                .populate({
                    path: 'categories',
                    model: 'Category',
                    select: 'name',
                })
                .populate({
                    path: 'subCategories',
                    model: 'SubCategory',
                    select: 'name',
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'province',
                            model: 'Province',
                            select: 'name',
                        },
                    ],
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'district',
                            model: 'District',
                            select: 'name',
                        },
                    ],
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'ward',
                            model: 'Ward',
                            select: 'name',
                        },
                    ],
                });
            return res.json(posts);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getMyPost: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });
            const posts = await Post.find({ user: user._id })
                .populate({
                    path: 'categories',
                    model: 'Category',
                    select: 'name',
                })
                .populate({
                    path: 'subCategories',
                    model: 'SubCategory',
                    select: 'name',
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'province',
                            model: 'Province',
                            select: 'name',
                        },
                    ],
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'district',
                            model: 'District',
                            select: 'name',
                        },
                    ],
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'ward',
                            model: 'Ward',
                            select: 'name',
                        },
                    ],
                });
            return res.json(posts);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const post = await Post.findOne({ _id: id });
            if (!post)
                return res.status(500).json({ msg: 'This post not exist' });
            return res.json(post);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = postController;

const Post = require('../models/Post');
const Comment = require('../models/Comment');

const postController = {
    create: async (req, res) => {
        try {
            const user = req.user;

            if (!user) return res.status(400).json({ msg: 'User not found' });

            const { title, content, categories, subCategories, areas } =
                req.body;

            post = new Post();
            post.user = user._id;
            post.title = title;
            post.content = content;
            post.categories = categories;
            post.subCategories = subCategories;
            post.areas = areas;
            if (areas == undefined) {
                post.everyWhere = true;
                post.areas = [];
            }

            if (req.files) {
                const images = req.files.map((item) => {
                    return item.path;
                });
                post.images = images;
            }

            await post.save();
            return res.json(post);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            let posts = await Post.find({})
                .sort({ createdAt: 'desc' })
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

            const { category, subCategory, province, district, ward } =
                req.query;
            if (category) {
                posts = posts.filter((post) => {
                    let categories = post.categories;
                    if (!categories.find((item) => item._id.equals(category)))
                        return false;
                    return true;
                });
            }
            if (subCategory) {
                posts = posts.filter((post) => {
                    let subCategories = post.subCategories;
                    if (
                        !subCategories.find((item) =>
                            item._id.equals(subCategory)
                        )
                    )
                        return false;
                    return true;
                });
            }

            if (province) {
                posts = posts.filter((post) => {
                    if (post.everyWhere) return true;
                    let areas = post.areas;
                    let area = areas.find((item) => {
                        if (item.province._id.equals(province)) return true;
                        return false;
                    });
                    if (area) return true;
                    return false;
                });
            }

            if (district) {
                posts = posts.filter((post) => {
                    if (post.everyWhere) return true;
                    let areas = post.areas;
                    let area = areas.find((item) => {
                        if (!item.district) return true;
                        if (item.district._id.equals(district)) return true;
                        return false;
                    });
                    if (area) return true;
                    return false;
                });
            }

            if (ward) {
                posts = posts.filter((post) => {
                    if (post.everyWhere) return true;
                    let areas = post.areas;
                    let area = areas.find((item) => {
                        if (!item.ward) return true;
                        if (item.ward._id.equals(ward)) return true;
                        return false;
                    });
                    if (area) return true;
                    return false;
                });
            }

            let { search } = req.body;
            if (search) {
                search = removeVietnameseTones(search);

                posts = posts.filter((item) => {
                    return removeVietnameseTones(item.title).includes(search);
                });
            }

            return res.json({ posts });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getMyPost: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });
            const posts = await Post.find({ user: user._id })
                .sort({ createdAt: 'desc' })
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
            return res.json({ posts });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            let post = await Post.findOne({ _id: id })
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
            if (!post)
                return res.status(500).json({ msg: 'This post not exist' });

            const comments = await Comment.find({ post: post._id });
            post.comments = comments;

            return res.json({ post });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

function removeVietnameseTones(str) {
    str.trim();
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(
        /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
        ' '
    );
    return str;
}

module.exports = postController;

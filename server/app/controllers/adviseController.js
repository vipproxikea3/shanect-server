const User = require('../models/User');

const adviseController = {
    getAll: async (req, res) => {
        try {
            const { category } = req.query;

            let users = await User.find({}).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });
            users = users.filter((user) => user.advise.ready == true);

            if (category) {
                users = users.filter((user) => {
                    let categories = user.advise.categories;
                    if (categories.find((item) => item._id.equals(category)))
                        return true;
                    return false;
                });
            }

            return res.json({ users });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const user = await User.findOne({ _id: id });

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = adviseController;

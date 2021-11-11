const Category = require('../models/Category');

const categoryController = {
    create: async (req, res) => {
        try {
            const { name, type, icon } = req.body;
            let category = await Category.findOne({ name: name });
            if (category)
                return res.status(500).json({ msg: 'This category exist' });
            category = new Category();
            category.name = name;
            category.type = type;
            category.icon = icon;
            await category.save();
            return res.json(category);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const categories = await Category.find({}).populate({
                path: 'subCategory',
                select: 'name',
            });
            return res.json(categories);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const category = await Category.findOne({ _id: id });
            if (!category)
                return res.status(500).json({ msg: 'This category not exist' });
            return res.json(category);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = categoryController;

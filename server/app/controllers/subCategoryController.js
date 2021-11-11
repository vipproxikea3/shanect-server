const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

const subCategoryController = {
    create: async (req, res) => {
        try {
            const { name, own } = req.body;
            let category = await Category.findOne({ _id: own });
            if (!category)
                return res.status(500).json({ msg: 'This category not exist' });
            subCategory = new SubCategory();
            subCategory.name = name;
            await subCategory.save();
            let subArr = category.subCategory;
            subArr.push(subCategory._id);

            category.subCategory = subArr;
            await category.save();
            return res.json(category);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const subCategories = await SubCategory.find({});
            return res.json(subCategories);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const subCategory = await SubCategory.findOne({ _id: id });
            if (!category)
                return res
                    .status(500)
                    .json({ msg: 'This subCategory not exist' });
            return res.json(subCategory);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = subCategoryController;

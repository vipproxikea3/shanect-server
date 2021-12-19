const Province = require('../models/Province');
const District = require('../models/District');
const Ward = require('../models/Ward');
const { urlencoded } = require('express');

const areaController = {
    getProvinces: async (req, res) => {
        try {
            let provinces = await Province.find({}).select('name');
            // let provinces = await Province.find({}).populate({
            //     path: 'level2s',
            //     model: 'District',
            //     select: 'name',
            // });
            return res.json({ provinces });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getProvinceById: async (req, res) => {
        try {
            const { id } = req.params;
            let province = await Province.findOne({ _id: id })
                .select('name')
                .populate({
                    path: 'level2s',
                    model: 'District',
                    select: 'name',
                });
            return res.json({ province });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getDistricts: async (req, res) => {
        try {
            const districts = await District.find({}).select('name');
            // const districts = await District.find({})
            //     .populate({
            //         path: 'level3s',
            //         model: 'Ward',
            //         select: 'name',
            //     })
            //     .populate({
            //         path: 'own',
            //         model: 'Province',
            //         select: 'name',
            //     });

            return res.json(districts);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getDistrictById: async (req, res) => {
        try {
            const { id } = req.params;
            const district = await District.findOne({ _id: id })
                .select('name')
                .populate({
                    path: 'level3s',
                    model: 'Ward',
                    select: 'name',
                })
                .populate({
                    path: 'own',
                    model: 'Province',
                    select: 'name',
                });
            // const districts = await District.find({})
            //     .populate({
            //         path: 'level3s',
            //         model: 'Ward',
            //         select: 'name',
            //     })
            //     .populate({
            //         path: 'own',
            //         model: 'Province',
            //         select: 'name',
            //     });

            return res.json({ district });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getWards: async (req, res) => {
        try {
            const wards = await Ward.find({}).select('name');
            // const wards = await Ward.find({}).populate({
            //     path: 'own',
            //     model: 'District',
            //     select: 'name',
            // });

            return res.json(wards);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = areaController;
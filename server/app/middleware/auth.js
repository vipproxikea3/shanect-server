const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (req, res, next) => {
    try {
        const token = req.headers['shanect-access-token'];
        if (!token) return res.status(403).json({ msg: 'No token provided.' });

        jwt.verify(token, process.env.JWT_KEY, (err, data) => {
            if (err) return res.status(500).json({ msg: err });

            User.findById(data._id).then((user) => {
                req.user = user;
                next();
            });
        });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

module.exports = auth;

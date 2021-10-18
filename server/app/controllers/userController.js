const User = require('../models/User');
const CodeLog = require('../models/CodeLog');
const bcrypt = require('bcrypt');

const userController = {
    register: async (req, res) => {
        try {
            const { name, username, password } = req.body;

            let user = await User.findOne({ username });

            if (user)
                return res
                    .status(400)
                    .json({ msg: 'This email or username is exist' });

            const newUser = new User({
                name,
                username,
                password,
            });

            await newUser.save();

            return res.json({ user: newUser });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res
                    .status(400)
                    .json({ msg: 'Invalid login credentials' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({ msg: 'Invalid login credentials' });
            }
            const token = await user.generateAuthToken();
            return res.json({
                user,
                token,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateEmail: async (req, res) => {
        try {
            const { username, email, code } = req.body;
            let user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            let codeLog = await CodeLog.findOne({ email: email }).sort({
                createdAt: -1,
            });

            if (!codeLog) {
                return res.status(400).json({ msg: 'Verify Code not found' });
            }

            if (code !== codeLog.code) {
                return res.status(400).json({ msg: 'Verify Code incorrect' });
            }

            user.email = email;

            await user.save();

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = userController;

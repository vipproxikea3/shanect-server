const Contact = require('../models/Contact');
const User = require('../models/User');

const contactController = {
    getMyContacts: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            let contacts = await Contact.find({})
                .populate({
                    path: 'members',
                    model: 'User',
                    select: 'name avatar',
                })
                .populate({
                    path: 'seen',
                    model: 'User',
                    select: 'name avatar',
                })
                .populate({
                    path: 'lastMessage',
                    model: 'Message',
                    select: 'content',
                });
            contacts = contacts.filter(
                (contact) =>
                    contact.members.find((member) => member.equals(user._id)) !=
                    undefined
            );

            return res.json({ contacts });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    seen: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            const { to } = req.params;

            const toUser = await User.findOne({ _id: to });
            if (!toUser)
                return res.status(400).json({ msg: 'receiver not found' });

            const contacts = await Contact.find({});
            let contact = contacts.find((item) => {
                let members = item.members;
                let check = true;
                if (!members.find((member) => member.equals(user._id)))
                    check = false;
                if (!members.find((member) => member.equals(toUser._id)))
                    check = false;
                return check;
            });

            if (contact) {
                let seen = contact.seen;

                if (!seen.find((member) => member.equals(user._id))) {
                    contact.seen = contact.members;
                }

                await contact.save();
                return res.json({ contacts });
            } else {
                return res.status(400).json({ msg: 'Contact not found' });
            }
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = contactController;

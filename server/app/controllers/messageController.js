const Message = require('../models/Message');
const Contact = require('../models/Contact');
const User = require('../models/User');

const messageController = {
    send: async (req, res) => {
        try {
            const user = req.user;
            const { content, reply } = req.body;
            const { to } = req.params;

            const toUser = await User.findOne({ _id: to });
            if (!toUser)
                return res.status(400).json({ msg: 'receiver not found' });

            if (user._id.equals(toUser._id))
                return res.json({ msg: "Can't send yourself" });

            const images = req.files.map((item) => {
                return item.path;
            });

            let message = new Message();
            message.from = user._id;
            message.to = to;
            message.content = content;
            message.reply = reply;
            message.images = images;

            await message.save();

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

            if (!contact) {
                contact = new Contact();
                contact.members = [user._id, toUser._id];
                contact.lastMessage = message._id;
                contact.seen = [user._id];
                await contact.save();
            } else {
                contact.lastMessage = message._id;
                contact.seen = [user._id];
                await contact.save();
            }

            message = await Message.findOne({ _id: message._id })
                .populate({
                    path: 'from',
                    model: 'User',
                    select: 'name avatar',
                })
                .populate({
                    path: 'to',
                    model: 'User',
                    select: 'name avatar',
                });

            contact = await Contact.findOne({ _id: contact._id })
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

            req.app.io.emit('message', { message });
            req.app.io.emit('contact', { contact });

            return res.json({ message });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getByReceiverId: async (req, res) => {
        try {
            const user = req.user;
            const { to } = req.params;
            let messages = await Message.find({})
                .populate({
                    path: 'from',
                    model: 'User',
                    select: 'name avatar',
                })
                .populate({
                    path: 'to',
                    model: 'User',
                    select: 'name avatar',
                });

            messages = messages.filter(
                (message) =>
                    (message.from._id.equals(user._id) &&
                        message.to._id.equals(to)) ||
                    (message.to._id.equals(user._id) &&
                        message.from._id.equals(to))
            );

            return res.json({ messages });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = messageController;

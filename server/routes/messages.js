const router = require('express').Router();
const multer = require('multer');
const messageController = require('../app/controllers/messageController');
const auth = require('../app/middleware/auth');
const fileUploader = require('../app/middleware/uploadMiddleware');

router.post(
    '/:to',
    fileUploader.array('images', 50),
    auth,
    messageController.send
);
router.use(multer().none());
router.get('/:to', auth, messageController.getByReceiverId);

module.exports = router;

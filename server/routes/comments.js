const router = require('express').Router();
const multer = require('multer');
const commentController = require('../app/controllers/commentController');
const auth = require('../app/middleware/auth');
const fileUploader = require('../app/middleware/uploadMiddleware');

router.post('/', auth, fileUploader.single('image'), commentController.create);
router.use(multer().none());
router.get('/', commentController.getAll);
router.get('/:id', commentController.getById);

module.exports = router;

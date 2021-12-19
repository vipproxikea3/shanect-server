const router = require('express').Router();
const multer = require('multer');
const postController = require('../app/controllers/postController');
const commentController = require('../app/controllers/commentController');
const fileUploader = require('../app/middleware/uploadMiddleware');
const auth = require('../app/middleware/auth');

router.post('/', fileUploader.array('images', 50), auth, postController.create);

router.use(multer().none());
router.get('/:id/comments', commentController.getByPost);
router.get('/:id', postController.getById);
router.get('/', postController.getAll);

module.exports = router;

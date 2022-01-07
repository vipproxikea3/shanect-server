const router = require('express').Router();
const multer = require('multer');
const postController = require('../app/controllers/postController');
const commentController = require('../app/controllers/commentController');
const fileUploader = require('../app/middleware/uploadMiddleware');
const auth = require('../app/middleware/auth');
const authFree = require('../app/middleware/authFree');

router.post('/', fileUploader.array('images', 50), auth, postController.create);

router.use(multer().none());
router.get('/:id/comments', commentController.getByPost);
router.post('/:id/save', auth, postController.save);
router.put('/:id', auth, postController.update);
router.get('/:id', authFree, postController.getById);
router.get('/', authFree, postController.getAll);

module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const postController = require('../app/controllers/postController');
const fileUploader = require('../app/middleware/uploadMiddleware');
const auth = require('../app/middleware/auth');

router.post('/', fileUploader.array('images', 50), auth, postController.create);

router.use(multer().none());
router.get('/', postController.getAll);
router.get('/:id', postController.getById);

module.exports = router;

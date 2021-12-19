const router = require('express').Router();
const multer = require('multer');
const commentController = require('../app/controllers/commentController');
const auth = require('../app/middleware/auth');

router.use(multer().none());
router.get('/', commentController.getAll);
router.get('/:id', commentController.getById);
router.post('/', auth, commentController.create);

module.exports = router;

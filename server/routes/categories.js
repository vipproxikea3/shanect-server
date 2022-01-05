const router = require('express').Router();
const multer = require('multer');
const categoryController = require('../app/controllers/categoryController');

router.use(multer().none());
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.put('/:id', categoryController.update);
router.post('/', categoryController.create);

module.exports = router;

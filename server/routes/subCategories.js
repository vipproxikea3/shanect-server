const router = require('express').Router();
const multer = require('multer');
const subCategoryController = require('../app/controllers/subCategoryController');

router.use(multer().none());
router.get('/', subCategoryController.getAll);
router.get('/:id', subCategoryController.getById);
router.post('/', subCategoryController.create);

module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const adviseController = require('../app/controllers/adviseController');

router.use(multer().none());
router.get('/', adviseController.getAll);
router.get('/:id', adviseController.getById);

module.exports = router;

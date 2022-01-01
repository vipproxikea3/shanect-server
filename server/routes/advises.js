const router = require('express').Router();
const multer = require('multer');
const adviseController = require('../app/controllers/adviseController');
const authFree = require('../app/middleware/authFree');

router.use(multer().none());
router.get('/', authFree, adviseController.getAll);
router.get('/:id', adviseController.getById);

module.exports = router;

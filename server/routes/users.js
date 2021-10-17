const router = require('express').Router();
const multer = require('multer');
const userController = require('../app/controllers/userController');

router.use(multer().none());
router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;

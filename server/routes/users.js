const router = require('express').Router();
const multer = require('multer');
const userController = require('../app/controllers/userController');
const auth = require('../app/middleware/auth');

router.use(multer().none());
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/email', userController.updateEmail);

module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const userController = require('../app/controllers/userController');
const auth = require('../app/middleware/auth');
const fileUploader = require('../app/middleware/uploadMiddleware');

router.put(
    '/avatar',
    auth,
    fileUploader.single('avatar'),
    userController.updateAvatar
);
router.put(
    '/cover',
    auth,
    fileUploader.single('cover'),
    userController.updateAvatar
);
router.use(multer().none());
router.get('/me', auth, userController.getMe);
router.get('/verify', userController.verifyUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/email', auth, userController.updateEmail);
router.put('/password', auth, userController.updatePassword);
router.post('/reset-password', userController.resetPassword);
router.put('/', auth, userController.update);

module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const userController = require('../app/controllers/userController');
const postController = require('../app/controllers/postController');
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
    userController.updateCover
);
router.put(
    '/advise-images',
    auth,
    fileUploader.array('images', 10),
    userController.updateAdviseImages
);
router.use(multer().none());
router.put('/advise-categories', auth, userController.updateAdviseCategories);
router.put('/advise-description', auth, userController.updateAdviseDescription);
router.put('/advise-ready', auth, userController.updateAdviseReady);
router.get('/me/posts', auth, postController.getMyPost);
router.get('/me', auth, userController.getMe);
router.get('/verify', userController.verifyUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/email', auth, userController.updateEmail);
router.put('/password', auth, userController.updatePassword);
router.post('/reset-password', userController.resetPassword);
router.get('/:id', userController.getUserById);
router.put('/', auth, userController.update);

module.exports = router;

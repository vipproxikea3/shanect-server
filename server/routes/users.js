const router = require('express').Router();
const multer = require('multer');
const userController = require('../app/controllers/userController');
const postController = require('../app/controllers/postController');
const commentController = require('../app/controllers/commentController');
const auth = require('../app/middleware/auth');
const authFree = require('../app/middleware/authFree');
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
router.put('/advise-level', auth, userController.updateAdviseLevel);
router.put('/advise-categories', auth, userController.updateAdviseCategories);
router.put('/advise-description', auth, userController.updateAdviseDescription);
router.put('/advise-ready', auth, userController.updateAdviseReady);
router.get('/me/posts', auth, postController.getMyPost);
router.get('/me/saved-posts', auth, postController.getMySavedPost);
router.get('/me/saved-advises', auth, userController.getMySaveAdvise);
router.get('/me/follow-users', auth, userController.getMyFollowUser);
router.get('/me/notifications', auth, commentController.getByPostOfUser);
router.get('/me', auth, userController.getMe);
router.get('/verify', userController.verifyUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/email', auth, userController.updateEmail);
router.put('/password', auth, userController.updatePassword);
router.post('/reset-password', userController.resetPassword);
router.get('/:id', authFree, userController.getUserById);
router.get('/:id/posts', userController.getPostsByUser);
router.post('/:id/follow', auth, userController.follow);
router.post('/:id/save', auth, userController.save);
router.put('/', auth, userController.update);

module.exports = router;

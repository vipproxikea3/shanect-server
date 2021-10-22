const router = require('express').Router();
const multer = require('multer');
const emailController = require('../app/controllers/emailController');

router.use(multer().none());
router.post('/send-verify-code', emailController.sendVerifyCode);

module.exports = router;

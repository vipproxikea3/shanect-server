const router = require('express').Router();
const multer = require('multer');
const emailController = require('../app/controllers/emailController');

router.use(multer().none());
router.post('/send', emailController.send);

module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const contactController = require('../app/controllers/contactController');
const auth = require('../app/middleware/auth');

router.use(multer().none());
router.post('/:to', auth, contactController.seen);
router.get('/', auth, contactController.getMyContacts);

module.exports = router;

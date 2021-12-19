const router = require('express').Router();
const multer = require('multer');
const areaController = require('../app/controllers/areaController');

router.use(multer().none());
router.get('/provinces/:id', areaController.getProvinceById);
router.get('/provinces', areaController.getProvinces);
router.get('/districts/:id', areaController.getDistrictById);
router.get('/districts', areaController.getDistricts);
router.get('/wards', areaController.getWards);

module.exports = router;

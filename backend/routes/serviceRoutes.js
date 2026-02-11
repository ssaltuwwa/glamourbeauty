const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validation');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Admin only routes
router.use(auth, admin);

router.post('/', validate('createService'), serviceController.createService);
router.put('/:id', validate('createService'), serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;
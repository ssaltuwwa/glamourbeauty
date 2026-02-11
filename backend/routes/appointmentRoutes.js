const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

router.use(auth);

router.post('/', validate('createAppointment'), appointmentController.createAppointment);
router.get('/my', appointmentController.getUserAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

const appointmentController = {
  createAppointment: async (req, res, next) => {
    try {
      const { service, date, timeSlot, notes } = req.body;
      const userId = req.user.id;

      const serviceExists = await Service.findById(service);
      if (!serviceExists) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const existingAppointment = await Appointment.findOne({
        date: new Date(date),
        timeSlot,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (existingAppointment) {
        return res.status(409).json({ 
          error: 'This time slot is already booked' 
        });
      }

      const appointment = new Appointment({
        user: userId,
        service,
        date: new Date(date),
        timeSlot,
        notes
      });

      await appointment.save();
      await appointment.populate('service');

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: { appointment }
      });

    } catch (error) {
      next(error);
    }
  },

  getUserAppointments: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      
      const filter = { user: userId };
      if (status) filter.status = status;

      const appointments = await Appointment.find(filter)
        .populate('service')
        .sort({ date: 1, timeSlot: 1 });

      res.json({
        success: true,
        count: appointments.length,
        data: { appointments }
      });
    } catch (error) {
      next(error);
    }
  },

  getAppointmentById: async (req, res, next) => {
    try {
      const appointment = await Appointment.findById(req.params.id)
        .populate('service');

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Access denied' 
        });
      }

      res.json({
        success: true,
        data: { appointment }
      });
    } catch (error) {
      next(error);
    }
  },

  updateAppointment: async (req, res, next) => {
    try {
      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Access denied' 
        });
      }

      Object.assign(appointment, req.body);
      await appointment.save();
      await appointment.populate('service');

      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: { appointment }
      });
    } catch (error) {
      next(error);
    }
  },

  cancelAppointment: async (req, res, next) => {
    try {
      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Access denied' 
        });
      }

      appointment.status = 'cancelled';
      await appointment.save();

      res.json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: { appointment }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = appointmentController;
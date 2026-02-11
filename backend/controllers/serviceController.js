const Service = require('../models/Service');

const serviceController = {
  createService: async (req, res, next) => {
    try {
      const service = new Service(req.body);
      await service.save();

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: { service }
      });
    } catch (error) {
      next(error);
    }
  },

  getAllServices: async (req, res, next) => {
    try {
      const { category, active } = req.query;
      const filter = {};

      if (category) filter.category = category;
      if (active !== undefined) filter.isActive = active === 'true';

      const services = await Service.find(filter).sort({ createdAt: -1 });

      res.json({
        success: true,
        count: services.length,
        data: { services }
      });
    } catch (error) {
      next(error);
    }
  },

  getServiceById: async (req, res, next) => {
    try {
      const service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json({
        success: true,
        data: { service }
      });
    } catch (error) {
      next(error);
    }
  },

  updateService: async (req, res, next) => {
    try {
      const service = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json({
        success: true,
        message: 'Service updated successfully',
        data: { service }
      });
    } catch (error) {
      next(error);
    }
  },

  deleteService: async (req, res, next) => {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = serviceController;
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin rights required.' 
    });
  }
  next();
};

module.exports = admin;

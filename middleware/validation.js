const { AppError } = require('./errorHandler');

// Validate required fields
const validateContact = (req, res, next) => {
  const { name, phone } = req.body;
  
  if (!name || name.trim() === '') {
    return next(new AppError('Name is required', 400));
  }
  
  if (!phone || phone.trim() === '') {
    return next(new AppError('Phone is required', 400));
  }
  
  // Basic phone validation
  const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return next(new AppError('Invalid phone number format', 400));
  }
  
  next();
};

// Validate file upload
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return next(); // No file is okay
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(req.file.mimetype)) {
    return next(new AppError('Invalid file type. Allowed: jpg, png, gif, webp', 400));
  }
  
  if (req.file.size > maxSize) {
    return next(new AppError('File too large. Max size: 5MB', 400));
  }
  
  next();
};

module.exports = { validateContact, validateFileUpload };

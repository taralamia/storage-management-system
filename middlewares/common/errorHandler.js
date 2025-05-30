const createError = require('http-errors');
const logger = require('../../utils/logger');

// 404 handler
function notFoundHandler(req, res, next) {
  next(createError(404, 'Your requested content was not found!'));
}

// Centralized error handler
function errorHandler(err, req, res, next) {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error (always in file, also to console in development)
  logger.error({
    message,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
    time: new Date().toISOString(),
  });

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

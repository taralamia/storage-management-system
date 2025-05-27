const createError = require('http-errors');

// 404 not found handler
function notFoundHandler(req, res, next) {
  next(createError(404, 'Your requested content was not found!'));
}
// default error handler
function errorHandler(err, req, res, next) {
  // Set default status code
  const statusCode = err.status || 500;
  res.locals.error =
    process.env.NODE_ENV === 'development' ? err : { message: err.message };
  // json response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
module.exports = {
  notFoundHandler,
  errorHandler,
};

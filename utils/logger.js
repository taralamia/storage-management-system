// utils/logger.js
const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log' }),
    new transports.Console({ format: format.simple() })
  ],
});

module.exports = logger;

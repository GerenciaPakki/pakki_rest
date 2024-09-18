const { createLogger, transports, format } = require('winston');

const applogger = createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: './logs/error.log', level: 'error' })
  ]
});

const apploggerWarn = createLogger({
  level: 'warn',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: './logs/error.log', level: 'warn' }),
  ]
});

const apploggerInfo = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: './logs/error.log', level: 'info' }),
  ]
});

module.exports = {
  applogger,
  apploggerWarn,
  apploggerInfo
};
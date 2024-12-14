// const { createLogger, transports, format } = require('winston');

// const applogger = createLogger({
//   level: 'error',
//   format: format.combine(
//     format.timestamp(),
//     format.json()
//   ),
//   transports: [
//     new transports.File({ filename: './logs/error.log', level: 'error' })
//   ]
// });

// const apploggerWarn = createLogger({
//   level: 'warn',
//   format: format.combine(
//     format.timestamp(),
//     format.json()
//   ),
//   transports: [
//     new transports.File({ filename: './logs/warn.log', level: 'warn' }),
//   ]
// });

// const apploggerInfo = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.timestamp(),
//     format.json()
//   ),
//   transports: [
//     new transports.File({ filename: './logs/info.log', level: 'info' }),
//   ]
// });

// module.exports = {
//   applogger,
//   apploggerWarn,
//   apploggerInfo
// };

const { createLogger, transports, format } = require('winston');

// Función para filtrar niveles específicos
const filterLevel = (level) => {
  return format((info) => {
    return info.level === level ? info : false;
  })();
};

const applogger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    // Transport para errores (solo registrará mensajes de error)
    new transports.File({
      filename: './logs/error.log',
      level: 'error',
      format: format.combine(filterLevel('error')) // Filtra solo los mensajes de error
    }),

    // Transport para advertencias (solo registrará mensajes de advertencia)
    new transports.File({
      filename: './logs/warn.log',
      level: 'warn',
      format: format.combine(filterLevel('warn')) // Filtra solo los mensajes de advertencia
    }),

    // Transport para info (solo registrará mensajes informativos)
    new transports.File({
      filename: './logs/info.log',
      level: 'info',
      format: format.combine(filterLevel('info')) // Filtra solo los mensajes informativos
    }),

    // Transport para info (solo registrará mensajes informativos)
    new transports.File({
      filename: './logs/debug.log',
      level: 'debug',
      format: format.combine(filterLevel('debug')) // Filtra solo los mensajes informativos
    }),

    // Opcional: Loguear en consola
    new transports.Console({
      format: format.simple(),
      level: 'info'
    })
  ]
});

module.exports = {
  applogger
};

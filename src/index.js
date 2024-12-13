const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const env = require('./utils/config');
const { dbConn } = require('./database/config');
const app = express();
// const version = '/api/v1';
const version = env.ROOT_API;
const port = env.PORT;

// Coneccion a Base de Datos
dbConn();
// const corsOptions = {
//   origin: ['*.pakki.click/*', 'https://admin.pakki.click', 'https://devfront.pakki.click', 'https://devback.pakki.click', 'https://pakki.click', 'http://localhost:4200', '*/localhost:*', 'http://localhost:4200/api/v1', 'http://localhost:4010'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['x-token','Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
//   credentials: true
// };
// app.use(cors(corsOptions));

const allowedOrigins = [
  'https://admin.pakki.click',
  'https://devfront.pakki.click',
  'https://devback.pakki.click',
  'https://pakki.click',
  'http://localhost:4200',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permite solicitudes sin origen (como las de herramientas como Postman).
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['x-token', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended:false}));

// Usamos para el Ambiente de dev
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use(`${version}/lg`, require('./routes/auth'));
app.use(`${version}/rgs`, require('./routes/auth'));
app.use(`${version}/rl`, require('./routes/role'));
app.use(`${version}/pf`, require('./routes/profile'));
app.use(`${version}/tc`, require('./routes/companyType'));
app.use(`${version}/cl`, require('./routes/collaborator'));
app.use(`${version}/bs`, require('./routes/business'));
app.use(`${version}/br`, require('./routes/business'));
// cargue de archivo xlxs
app.use(`${version}/dcc`, require('./routes/loadData'));
// Proveso Interno Pakki
app.use(`${version}/cd`, require('./routes/discount'));
app.use(`${version}/qts`, require('./routes/quotation'));
app.use(`${version}/sps`, require('./routes/shipment'));
app.use(`${version}/ctls`, require('./routes/control'));
app.use(`${version}/mp`, require('./routes/menuProfile'));
// Req Menu
app.use(`${version}/mn`, require('./routes/loadMenu'))
// Req checkPostalCode
app.use(`${version}/cpc`, require('./routes/checkPostalCode'))
// referencia de pago ePayco
app.use(`${version}/pay`, require('./routes/payment'))


// Agregamos un Comentarios de Prueba
// console.log('Comentario de Prueba de Carga.')



// configuramos el Servidor de express
app.listen(port, () => {
    console.log(`${env.ENVIROMENT} ${env.PORT}`);
});
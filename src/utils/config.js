const path = require('path');
const dotenv = require('dotenv');

const result = dotenv.config({
    path: path.resolve(__dirname, `../../environments/.env.${process.env.NODE_ENV}`)
});


// if (result.error) {
//     throw result.error; // Manejar errores al cargar el archivo .env
// }


const config = {
    PORT: process.env.PORT,
    PATH_GUIA: process.env.PATH_GUIA,
    URL_GUIA: process.env.URL_GUIA,
    API: process.env.ROOT_API,
    ENVIROMENT: process.env.ENVIROMENT,
    FDX_URL_XML: process.env.FDX_URL_XML,
    ROOT_API: process.env.ROOT_API,
    MONGO_URL: process.env.MONGO_URL,
    USERDB: process.env.USERDB,
    PWDDB: process.env.PWDDB,
    FDX_URL: process.env.FDX_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    FDX_QUOTATION_URL: process.env.FDX_QUOTATION_URL,
    FDX_URL_TOKEN: process.env.FDX_URL_TOKEN,
    UPS_CONFIRMATION_URL: process.env.UPS_CONFIRMATION_URL,
    UPS_ACCEPT_URL: process.env.UPS_ACCEPT_URL,
    UPS_QUOTATION_URL: process.env.UPS_QUOTATION_URL,
    DHL_URL: process.env.DHL_URL,
    DHL_QUOTATION_URL: process.env.DHL_QUOTATION_URL,
    CDR_GUIA_URL: process.env.CDR_GUIA_URL,
    CDR_ACCEPT_URL: process.env.CDR_ACCEPT_URL,
    CDR_QUOTATION_URL: process.env.CDR_QUOTATION_URL,
    DHL_USER: process.env.DHL_USER,
    DHL_PASSWORD: process.env.DHL_PASSWORD,
    DHL_ACCOUNT_NUMBER: process.env.DHL_ACCOUNT_NUMBER,
    DHL_ACCOUNT_NUMBER_IMPORT: process.env.DHL_ACCOUNT_NUMBER_IMPORT,
    UPS_USER: process.env.UPS_USER,
    UPS_PASSWORD: process.env.UPS_PASSWORD,
    UPS_ACCOUNT_NUMBER: process.env.UPS_ACCOUNT_NUMBER,
    UPS_BILLSHIPPER: process.env.UPS_BILLSHIPPER,
    FDX_USER: process.env.FDX_USER,
    FDX_PASSWORD: process.env.FDX_PASSWORD,
    FDX_ACCOUNT_NUMBER: process.env.FDX_ACCOUNT_NUMBER,
    FDX_ACCOUNT_CO: process.env.FDX_ACCOUNT_CO,
    FDX_ACCOUNT_MATER_NUMBER: process.env.FDX_ACCOUNT_MATER_NUMBER,
    CDR_USER: process.env.CDR_USER,
    CDR_PASSWORD: process.env.CDR_PASSWORD,
    CDR_ACCOUNT_NUMBER: process.env.CDR_ACCOUNT_NUMBER,
    CDR_USER_SHIP: process.env.CDR_USER_SHIP,
    CDR_PASSWORD_SHIP: process.env.CDR_PASSWORD_SHIP,
    CDR_ACCOUNT_NUMBER_SHIP: process.env.CDR_ACCOUNT_NUMBER_SHIP,
    API_FDX_SPS: process.env.API_FDX_SPS,
    API_FDX_QTS: process.env.API_FDX_QTS,
    API_FDX_PKP: process.env.API_FDX_PKP,
    APIGATEWAY_COTIZAR: process.env.APIGATEWAY_COTIZAR,
    APIGATEWAY_EMITIR: process.env.APIGATEWAY_EMITIR,
    APIGATEWAY_ETIQUETA: process.env.APIGATEWAY_ETIQUETA,
    APIGATEWAY_RECOGIDA: process.env.APIGATEWAY_RECOGIDA,
};

module.exports = config;

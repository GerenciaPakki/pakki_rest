/*
    path: '/api/v1/sps' Control de quotation
*/

const { Router } = require('express');
const { check } = require('express-validator');

const { validateJWT, validateCEI, validateDatePickup,
    validateDateWeekend, validateDateHolidays, packagingType } = require('../middleware/globalValidations');
const { shipment } = require('../controllers/shipment');
const { getViewshipment, getViewPdfs, getShipmentComment, getViewOneshipment } = require('../controllers/operationShipment');

const router = Router();



router.post('/viewpdf', [
    validateJWT,
], getViewPdfs);

router.post('/vwshipcomm', [
    validateJWT,
], getViewOneshipment);

router.post('/viewshipments', [
    validateJWT,
], getViewshipment);

router.post('/shipcomm', [
    validateJWT,
], getShipmentComment)

router.post('/', [
    validateJWT, validateDatePickup, validateDateWeekend, validateDateHolidays,
    packagingType
    //AuthFdxUs,AuthUpsUs,AuthUpsCo,
    // check('shippercity','Se Requiere la ciudad que remite de caracter obligatorio').not().isEmpty(),
    // check('shipperstateorprovincecode','Se Requiere codigo de ciudad de caracter obligatorio').not().isEmpty(),
    // check('shipperpostalcode','Se Requiere codigo postal de caracter obligatorio').not().isEmpty(),
    // check('shippercountrycode','Se Requiere el codigo del pais de caracter obligatorio').not().isEmpty(),
    // check('recipientcity','Se Requiere la ciudad de destino de caracter obligatorio').not().isEmpty(),
    // check('recipientstateorprovincecode','Se Requiere codigo de ciudad de caracter obligatorio').not().isEmpty(),
    // check('recipientpostalcode','Se Requiere el codigo postal de caracter obligatorio').not().isEmpty(),
    // check('recipientcountrycode','Se Requiere el codigo del pais de caracter obligatorio').not().isEmpty(),
], shipment );






module.exports = router;
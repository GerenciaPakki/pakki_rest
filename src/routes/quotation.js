/*
    path: '/api/v1/qts' Control de quotation
*/

const { Router } = require('express');
const { check } = require('express-validator');

const { validateJWT, validateCEI, validateDateWeekend, packagingType, validateDatePickupQuotation } = require('../middleware/globalValidations');
const { quota } = require('../controllers/quotation');
const { AuthFdxCo, AuthFdxUs, AuthUpsUs, AuthUpsCo } = require('../middleware/globalPartner');
const { quotaFormat } = require('../controllers/formatJson');


const router = Router();

router.post('/', [
    validateJWT,packagingType//AuthFdxUs,AuthUpsUs,AuthUpsCo,
    // check('shippercity','Se Requiere la ciudad que remite de caracter obligatorio').not().isEmpty(),
    // check('shipperstateorprovincecode','Se Requiere codigo de ciudad de caracter obligatorio').not().isEmpty(),
    // check('shipperpostalcode','Se Requiere codigo postal de caracter obligatorio').not().isEmpty(),
    // check('shippercountrycode','Se Requiere el codigo del pais de caracter obligatorio').not().isEmpty(),
    // check('recipientcity','Se Requiere la ciudad de destino de caracter obligatorio').not().isEmpty(),
    // check('recipientstateorprovincecode','Se Requiere codigo de ciudad de caracter obligatorio').not().isEmpty(),
    // check('recipientpostalcode','Se Requiere el codigo postal de caracter obligatorio').not().isEmpty(),
    // check('recipientcountrycode','Se Requiere el codigo del pais de caracter obligatorio').not().isEmpty(),
], quota );






module.exports = router;
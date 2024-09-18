/*
    path: '/api/discount'
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { validateJWT, validateFields } = require('../middleware/globalValidations');
const { viewCompanyDiscount, createCompanyDiscount, updateManyCompanyDiscount,
    updateOneCompanyDiscount, deleteCompanyDiscount, ViewOneCompanyDiscountWeight, viewAllCompanyDiscount, viewCompanyDiscountForID } = require('../controllers/discount');

const router = Router();

router.get('/allpro', validateJWT,
    viewAllCompanyDiscount);


router.get('/', validateJWT, [validateFields],
    viewCompanyDiscount);

router.post('/', validateJWT, [
    check('Provider', 'El Nombre del Proveedor es obligatorio').not().isEmpty(),
    check('ServiceName', 'El Nombre del ServiceName es obligatorio').not().isEmpty(),
    check('Domestic', 'El Nombre del Domestic es obligatorio').not().isEmpty(),
    check('ServiceType', 'El Nombre del serviceType es obligatorio').not().isEmpty(),
    check('Country', 'El Nombre del country es obligatorio').not().isEmpty(),
    check('Weight', 'El Nombre del Proveedor es obligatorio').not().isEmpty(),
    check('Fee', 'El Nombre del Proveedor es obligatorio').not().isEmpty(),
    check('RateIncrease', 'El Nombre del rateIncrease es obligatorio').not().isEmpty(),
    check('PakkiIncrease', 'El Nombre del PakkiIncrease es obligatorio').not().isEmpty(),
    check('PakkiDiscount', 'El Nombre del PakkiDiscount es obligatorio').not().isEmpty(),
    validateFields
], createCompanyDiscount);


router.put('/uponecd/:id', validateJWT, [
    validateFields
], updateOneCompanyDiscount);

router.put('/:id', validateJWT, [
    validateFields
], updateManyCompanyDiscount);

router.post('/fid', validateJWT, [
    validateFields
], viewCompanyDiscountForID);

router.post('/uponedis', validateJWT, [
    validateFields
], updateManyCompanyDiscount);


router.post('/vionedcwe', validateJWT, [
    validateFields
], ViewOneCompanyDiscountWeight);


router.delete('/:id', validateJWT, [
    validateFields
], deleteCompanyDiscount);



module.exports = router;
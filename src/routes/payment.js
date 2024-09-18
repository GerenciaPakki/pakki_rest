/*
    path: '/api/pay' Proceso para el pago por pasarela de pago
*/


const { Router } = require('express');
const { PaymentReferenceePayco,getPaymentReferenceePayco } = require('../controllers/payment');
const { validateJWT } = require('../middleware/globalValidations');
// const { viewOneBusBranchForNit, deleteBus } = require('../controllers/business');

const router = Router();

// router.get('/:id', [validateJWT], getPaymentReferenceePayco);
// router.get('/:id',validateJWT, getPaymentReferenceePayco);

router.post('/',[validateJWT],getPaymentReferenceePayco );

module.exports = router;
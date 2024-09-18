/*
    path: '/api/v1/ctls' RUTA PARA HACER PRUEBAS DIRECTAS
*/
const { Router } = require('express');
const { trm } = require("../middleware/globalExternals");
const { AuthFdxCo } = require('../middleware/globalPartner');
const { validateJWT } = require('../middleware/globalValidations');
const { ViewTRMxDateRange } = require('../controllers/loadData');
const { check } = require('express-validator');

const router = Router();

router.post('/', AuthFdxCo);

router.post('/trm', [
    validateJWT,
    check('dateIni', 'El dateIni es obligatorio').not().isEmpty(),
    check('dateEnd', 'El dateEnd es obligatorio').not().isEmpty(),
], ViewTRMxDateRange);

module.exports = router;
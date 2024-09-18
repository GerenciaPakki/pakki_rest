/*
    path: /api/cpc
*/

const { Router } = require('express');
const { validateJWT } = require('../middleware/globalValidations');
const { viewCountry, viewPostalCode, viewCityName, viewAllCountry, getClonePostalCode, viewClonePostalCode, getCreatePostalCode } = require('../controllers/checkPostalCode');

const router = Router();



router.get('/', [validateJWT], viewPostalCode);

router.post('/co', [validateJWT], viewCountry);
// Datos para Clonar un Postal Code
router.post('/clopc', [validateJWT], getClonePostalCode);
// Datos para Crear un Nuevo Postal Code
router.post('/creapc', [validateJWT], getCreatePostalCode);
router.post('/allco', [validateJWT], viewAllCountry);
router.post('/yt', [validateJWT], viewCityName);
router.post('/dc', [validateJWT], viewPostalCode);

// path para Visualizar los datos a Clonar
router.post('/vcldc', [validateJWT], viewClonePostalCode);

router.delete('/', [validateJWT],viewPostalCode);

module.exports = router;
/*
    path: '/api/v1/tc' creacion de tupi de Compañia
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { ViewCompanyType, CreateCompanyType, UpdateCompanyType, DeleteCompanyType } = require('../controllers/companyType');
const { validateJWT } = require('../middleware/globalValidations');

const router = Router();

router.get('/',[validateJWT,], ViewCompanyType);

router.post('/', [validateJWT,
    check('name', 'El Nombre del Tipo de Compañia es obligatorio').not().isEmpty(),
], CreateCompanyType);

router.put('/', [validateJWT,], UpdateCompanyType);

router.delete('/:id', [validateJWT,], DeleteCompanyType);







module.exports = router;
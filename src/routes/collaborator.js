/*
    path: '/api/v1/pf' Login generado para los Usuario de la Aplicacion
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { viewColla, ViewCollaXcc, ViewCollaXccBusinessUsers, ViewUserXccUsers,
    createColla, updateColla, deleteColla, updatePassColla, viewAllUsers } = require('../controllers/collaborator');
const { validateColla, validateCollaNoExist, validateJWT, validateProfile,  } = require('../middleware/globalValidations');

const router = Router();


router.get('/', [
    validateJWT,validateProfile,
], viewColla);

router.get('/usr', [
    validateJWT,validateProfile,
], viewAllUsers);


router.post('/', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateCollaNoExist,validateJWT,validateProfile,
    check('business', 'El Negocio es obligatorio').not().isEmpty(), 
    check('collaborator', 'El Usuario es obligatorio').isMongoId(),   
    check('profile', 'El Perfil es obligatorio').isMongoId(),    
], createColla);

router.post('/cc', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateCollaNoExist,validateJWT,
    check('collaborator', 'El Usuario es obligatorio').not().isEmpty(), 
], ViewCollaXcc);

router.post('/collaxcc', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateCollaNoExist,validateJWT,
    check('collaborator', 'El Usuario es obligatorio').not().isEmpty(), 
], ViewCollaXccBusinessUsers);

router.post('/userxcc', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateCollaNoExist,validateJWT,
    check('collaborator', 'El Usuario es obligatorio').not().isEmpty(), 
], ViewUserXccUsers);

router.put('/', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateJWT,validateCollaNoExist,validateProfile,
    check('name', 'El Nombre del Perfil es obligatorio').not().isEmpty(),    
], updateColla);
  
router.put('/changepass', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateJWT,validateCollaNoExist,
    check('name', 'El Nombre del Perfil es obligatorio').not().isEmpty(),    
], updatePassColla);

router.delete('/', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateJWT,validateCollaNoExist,validateProfile,
    check('DocumentID', 'El Documento es obligatorio').not().isEmpty(),    
], deleteColla);
  

module.exports = router;





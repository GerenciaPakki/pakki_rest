/*
    path: '/api/v1/pf' Login generado para los Usuario de la Aplicacion
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields, validateJWT, validateProfile } = require('../middleware/globalValidations');
const { viewProfile, createProfile, updateProfile, deleteProfile, viewOneProfile, viewBusinessUserForDocu } = require('../controllers/profile');


const router = Router();

router.get('/',[validateJWT,], viewProfile);

router.post('/vco', [
    validateJWT,
    check('userCC', 'El Numero de Documento del Perfil es obligatorio').not().isEmpty(),
    ], viewBusinessUserForDocu
);

router.post('/', [ 
    validateJWT,validateProfile,
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('name', 'El Nombre del Perfil es obligatorio').not().isEmpty(),    
], createProfile);

router.post('/vpro', [ validateJWT ], viewOneProfile);

router.put('/', [ 
    validateJWT,validateProfile,
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('profile', 'El Nombre del Perfil es obligatorio').not().isEmpty(),    
    check('role', 'El Rol del Perfil es obligatorio').not().isEmpty(),    
    check('observation', 'La observacion del Perfil es obligatorio').not().isEmpty(),    
], updateProfile);

router.put('/up', [ 
    validateJWT,validateProfile,
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('profile', 'El Nombre del Perfil es obligatorio').not().isEmpty(),    
    check('role', 'El Rol del Perfil es obligatorio').not().isEmpty(),    
    check('observation', 'La observacion del Perfil es obligatorio').not().isEmpty(),    
], updateProfile);

router.delete('/', [ 
    validateJWT,validateProfile,
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('name', 'El Nombre del Perfil es obligatorio').not().isEmpty(),    
], deleteProfile);
  

module.exports = router;

/*
    path: '/api/login' Login generado para los Usuario de la Aplicacion
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { login, createUser, updateUser, validateTokenUser, viewUser, viewOneUser, viewAllUser, restorePassword, deleteUser, activeUserForDocumentID } = require('../controllers/auth');
const { isEmail,validateFields, validatepassword, acceptTerms, validateJWT, validateRoll, validateProfile } = require('../middleware/globalValidations');

const router = Router();


// router.get('/',[validateJWT,validateProfile,],viewUser);
router.get('/vu',[validateJWT,validateProfile,],viewUser);
router.get('/allusr',[validateJWT],viewAllUser);
router.get('/allvu',[validateJWT,validateProfile,],viewAllUser);

router.post('/', [
    isEmail,
    check('email', 'El email es obligatorio').isEmail(),
    check('pass', 'La Contraseña es Obligatoria').not().isEmpty(),
    validateFields    
], login);

router.put('/upass', [validateJWT],restorePassword);
router.put('/uponeuser', [validateJWT],viewOneUser);

    // Registro de nuevo Usuario al portal Pakki-rest
router.post('/r', [
    isEmail,validateJWT,validateProfile,
    check('name', 'El Nombre es obligatorio').not().isEmpty(),
    check('lastName', 'El Apellido es obligatorio').not().isEmpty(),
    check('documentType', 'El Tipo de Documento es obligatorio').not().isEmpty(),
    check('docu', 'El Documento de Identidad es obligatorio').not().isEmpty(),
    check('mobil', 'El Numero de Celular es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),  
    validateFields   
], createUser);

router.put('/r', [
    validateJWT,validateProfile,
    check('name', 'El Nombre es obligatorio').not().isEmpty(),
    check('lastName', 'El Apellido es obligatorio').not().isEmpty(),  
    validateFields   
], updateUser);

router.post('/token', [validateJWT],validateTokenUser);

router.post('/active', [
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateJWT,
    check('DocumentID', 'El Documento es obligatorio').not().isEmpty(),
], activeUserForDocumentID);

router.post('/delusrs', [
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateJWT,
    check('DocumentID', 'El Documento es obligatorio').not().isEmpty(),
], deleteUser );






module.exports = router;
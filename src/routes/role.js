/*
    path: '/api/v1/rl' Login generado para los Usuario de la Aplicacion
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middleware/globalValidations');
const { viewRoll, createRoll, updateRoll, deleteRoll, viewAllRol } = require('../controllers/role');



const router = Router();

router.get('/', viewAllRol);

router.post('/vrona', viewRoll);
router.post('/', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('name', 'El Nombre del Rol es obligatorio').not().isEmpty(),    
    check('destination', 'El Destino de la URL del Rol es obligatorio').not().isEmpty(),    
],
    createRoll);

router.put('/', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('idRole', 'El ID del Rol es obligatorio').not().isEmpty(),  
],
  updateRoll);
router.delete('/:id', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('name', 'El Nombre del Rol es obligatorio').not().isEmpty(),    
],
    deleteRoll);
  

module.exports = router;


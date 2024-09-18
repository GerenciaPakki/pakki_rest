/*
    path: '/api/v1/bs' Login generado para los Usuario de la Aplicacion
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { viewAllBus, createBus, updateBusiness,viewOneBus, deleteBus, updateBusColla, updateBusbrach, updateBusCommercial, viewBusPakki, viewBusPartner, viewOneBusForNit, viewOneBusBranchForNit,viewBranchOfficeBusiness, getViewOneBusiness } = require('../controllers/business');
const { validateColla, validateUser, validateCollaAndBusiness, validateFields, validateJWT, validateBusiness, validateProfile, validateBusBrach } = require('../middleware/globalValidations');



const router = Router();

router.get('/',[validateJWT,validateProfile,], viewAllBus);
router.get('/busone',[validateJWT,validateProfile,], viewOneBus);
router.post('/busonenit', [validateJWT,], viewOneBusForNit);
router.post('/branchnit',[validateJWT,],viewOneBusBranchForNit);
router.post('/bussearch', [validateJWT, ], getViewOneBusiness);

router.post('/', [ 
        // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
        validateJWT,validateProfile,
        check('irs_nit', 'NIT o IRS es Obligatorio').not().isEmpty(),
        check('companytype', 'El tipo de Compañia es Obligatorio').not().isEmpty(),
        check('businessname', 'LA Razón Social es Obligatorio').not().isEmpty(),
        check('mainaddress', 'La direccion principal es Obligatorio').not().isEmpty(),
        check('phoneNumber', 'El numero telefonico es Obligatorio').not().isEmpty(),
        check('phoneDescription', 'La descripcion del Numero es Obligatorio').not().isEmpty(),
        check('cellphoneNumber', 'El numero Celular es Obligatorio').not().isEmpty(),
        check('cellphoneDescription', 'La descripcion del Numero celular es Obligatorio').not().isEmpty(),
        check('email', 'El email es Obligatorio').isEmail(),
        check('city', 'La ciudad es Obligatorio').not().isEmpty(),
        check('citycode', 'El codigo postal es Obligatorio').not().isEmpty(),
        check('country', 'El pais es Obligatorio').not().isEmpty(),
        check('countrycode', 'el Codigo del pais es Obligatorio').not().isEmpty(),
        check('manager', 'El owner es Obligatorio').isMongoId(),
], createBus);

router.post('/crebo', [ 
        // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
        validateJWT,//validateProfile,
        check('irs_nit', 'NIT o IRS es Obligatorio').not().isEmpty(),
        check('tradename', 'El nombre comercial es Obligatorio').not().isEmpty(),
        check('business.businessname', 'LA Razón Social es Obligatorio').not().isEmpty(),
        check('business.mainaddress', 'La direccion principal es Obligatorio').not().isEmpty(),
        check('business.phone.number', 'El numero telefonico es Obligatorio').not().isEmpty(),
        check('business.phone.description', 'La descripcion del Numero es Obligatorio').not().isEmpty(),
        check('business.cellphone.number', 'El numero Celular es Obligatorio').not().isEmpty(),
        check('business.cellphone.description', 'La descripcion del Numero celular es Obligatorio').not().isEmpty(),
        check('business.email', 'El email es Obligatorio').isEmail(),
        check('negotiation.discount', 'El descuento es Obligatorio').not().isEmpty(),
        check('business.city', 'La ciudad es Obligatorio').not().isEmpty(),
        check('business.citycode', 'El codigo postal es Obligatorio').not().isEmpty(),
        check('business.country', 'El pais es Obligatorio').not().isEmpty(),
        check('business.countrycode', 'el Codigo del pais es Obligatorio').not().isEmpty(),
        check('business.state', 'el Estado de la ciudad es Obligatorio').not().isEmpty(),
    ],
    updateBusbrach);

// TODO: Buscamos todos los business para mostrar en el menu de ingreso de Pakki
router.post('/allbuspk', [ 
        validateJWT,
        check('nit', 'El Business es Obligatorio').not().isEmpty(),
        check('collaborators', 'El Collaborators es Obligatorio').not().isEmpty(),
], viewBusPakki);

// TODO: Buscamos todos los business para mostrar en el menu de ingreso de Pakki
router.post('/brnofbus', [ 
        validateJWT,
        check('nit', 'El Business es Obligatorio').not().isEmpty(),
        check('branchOffice', 'La Sucursal es Obligatorio').not().isEmpty(),
], viewBranchOfficeBusiness);
    
// TODO: Mostarmos el business del Owner si en el conteo es mayor de 1 
router.post('/allbusali', [ 
        validateJWT,
        check('nit', 'El Business es Obligatorio').not().isEmpty(),
        check('collaborators', 'El Collaborators es Obligatorio').not().isEmpty(),
], viewBusPartner);

    // TODO: con este PUT actualizaremos para agregar el Colaborador a la Compañia
router.put('/brcl', [
    // TODO: se debe general el MW para valida que El perfil sea el correcto para realizar esta operacion
    validateJWT, validateUser,validateCollaAndBusiness,
    check('irs_nit', 'El Nit es obligatorio').isMongoId(),
    check('collaborators', 'El Colaborador es obligatorio').isMongoId(),
], updateBusColla);

 // TODO: con este PUT actualizaremos los datos del Business agregando al colaborador
router.put('/brcm', [
    validateJWT,validateProfile,
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('irs_nit', 'El Nit es obligatorio').isMongoId(),
    check('assignedCommercial', 'El Comercial es obligatorio').isMongoId(),
], updateBusCommercial);

// TODO: con este PUT actualizaremos los datos del Business agregando las Sucursales
router.put('/br/:id', [
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    validateJWT, validateBusiness, validateBusBrach, //validateProfile,
    check('tradename', 'El nombre comercial es Obligatorio').not().isEmpty(),
    check('businessname', 'LA Razón Social es Obligatorio').not().isEmpty(),
    check('mainaddress', 'La direccion principal es Obligatorio').not().isEmpty(),
    check('phonenumber', 'El numero telefonico es Obligatorio').not().isEmpty(),
    check('phonedescription', 'La descripcion del Numero es Obligatorio').not().isEmpty(),
    check('cellphonenumber', 'El numero Celular es Obligatorio').not().isEmpty(),
    check('cellphonedescription', 'La descripcion del Numero celular es Obligatorio').not().isEmpty(),
    check('email', 'El email es Obligatorio').isEmail(),
    check('city', 'La ciudad es Obligatorio').not().isEmpty(),
    check('citycode', 'El codigo postal es Obligatorio').not().isEmpty(),
    check('country', 'El pais es Obligatorio').not().isEmpty(),
    check('countrycode', 'el Codigo del pais es Obligatorio').not().isEmpty(),
    validateFields,
], updateBusbrach);



router.put('/:id', [ 
        // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
        validateJWT,//validateProfile,
        check('irs_nit', 'NIT o IRS es Obligatorio').not().isEmpty(),
        check('tradename', 'El nombre comercial es Obligatorio').not().isEmpty(),
        check('companytype', 'El tipo de Compañia es Obligatorio').not().isEmpty(),
        check('businessname', 'LA Razón Social es Obligatorio').not().isEmpty(),
        check('mainaddress', 'La direccion principal es Obligatorio').not().isEmpty(),
        check('phoneNumber', 'El numero telefonico es Obligatorio').not().isEmpty(),
        check('phoneDescription', 'La descripcion del Numero es Obligatorio').not().isEmpty(),
        check('cellphoneNumber', 'El numero Celular es Obligatorio').not().isEmpty(),
        check('cellphoneDescription', 'La descripcion del Numero celular es Obligatorio').not().isEmpty(),
        check('email', 'El email es Obligatorio').isEmail(),
        check('city', 'La ciudad es Obligatorio').not().isEmpty(),
        check('citycode', 'El codigo postal es Obligatorio').not().isEmpty(),
        check('country', 'El pais es Obligatorio').not().isEmpty(),
        check('countrycode', 'el Codigo del pais es Obligatorio').not().isEmpty(),
        check('manager', 'El owner es Obligatorio').isMongoId(),
        check('negotiationDiscount', 'El descuento es Obligatorio').not().isEmpty(),
], updateBusiness);

   


router.delete('/:id', [ 
    // TODO: se debe general el MW para valida el JWT y que El perfil sea el correcto para realizar esta operacion
    check('name', 'El Nombre del Rol es obligatorio').not().isEmpty(),    
], deleteBus);

module.exports = router;
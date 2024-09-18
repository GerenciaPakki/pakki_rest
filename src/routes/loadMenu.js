/*
    path: '/api/v1/mn' Cargue de Menu
*/

const { Router } = require('express');
const { loadMenu, viewMenuProfile, DeleteMenuProfile, AggregateMenuProfile, 
    ViewMenuForProfile, UpdateMenuForProfilePath, 
    getViewOneMenu,
    AggregateOneMenuProfile} = require('../controllers/loadMenu');
const { validateJWT, validateProfile } = require('../middleware/globalValidations');

const router = Router();

router.get('/', [
    validateJWT, validateProfile,
], ViewMenuForProfile);

router.post('/viewonemn', [
    validateJWT, validateProfile,
], getViewOneMenu);

router.post('/addonemn', [
    validateJWT, validateProfile,
], AggregateOneMenuProfile);

router.post('/', [
    validateJWT, validateProfile,
],loadMenu);

// VIEW DE MENUPROFILE POR TIPO DE PERFILE EJ. CEI, OWNER, PAKKI
router.post('/vmp', [
    validateJWT, validateProfile,
],viewMenuProfile);


router.put('/vmp', [
    validateJWT, validateProfile,
], viewMenuProfile);

router.put('/ctpm', [
    validateJWT, validateProfile,
], AggregateMenuProfile);

router.put('/edipath', [
    validateJWT, validateProfile,
], UpdateMenuForProfilePath);


router.delete('/vmp', [
    validateJWT, validateProfile,
], DeleteMenuProfile);



module.exports = router;
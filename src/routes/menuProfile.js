/*
    path: '/api/v1/mp' Cargue de Menu y Submenus de la aplicacion
*/

const { Router } = require('express');
const { check } = require('express-validator');

// const { viewMenu, createMenu, updateMenu, deleteMenu } = require('../controllers/menuProfile');
const { validateJWT, validateProfile } = require('../middleware/globalValidations');
const { viewMenu, createMenu, updateMenu, deleteMenu } = require('../controllers/menuProfile');

const router = Router();

router.get('/', [
    validateJWT,validateProfile
], viewMenu);

router.post('/', [
    validateJWT, validateProfile,
    check('title', 'El Titulo del Menu es obligatorio').not().isEmpty(),
    check('icon', 'El icono del Menu es obligatorio').not().isEmpty(),
    check('profile', 'El perfil del Menu es obligatorio').not().isEmpty(),
    check('submenu.title', 'El subtitulo del Menu es obligatorio').not().isEmpty(),
    check('submenu.url', 'La URL del Menu es obligatorio').not().isEmpty(),
], createMenu);

router.put('/', [
    validateJWT, validateProfile,
    check('title', 'El Titulo del Menu es obligatorio').not().isEmpty(),
    check('icon', 'El icono del Menu es obligatorio').not().isEmpty(),
    check('profile', 'El perfil del Menu es obligatorio').not().isEmpty(),
    check('submenu.title', 'El subtitulo del Menu es obligatorio').not().isEmpty(),
    check('submenu.url', 'La URL del Menu es obligatorio').not().isEmpty(),
], updateMenu);

router.delete('/', [
    validateJWT,validateProfile
], deleteMenu);




module.exports = router;
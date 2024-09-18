/*
    path: '/api/login' Login generado para los Usuario de la Aplicacion
*/

const { Router } = require('express');

const { validateJWT, validateProfile, validateFileName } = require('../middleware/globalValidations');
const { createFileData, createHolidays, createWeekends, createCountrys,
    createPostalCode, ViewOneCityDaneCodeValide, ViewOnePostalCode, ViewOneCountry, ViewOneCity, ViewOneZipCodeDaneCode, ViewOneCityDaneCode, ViewAllHolidays, ViewDateHolidays, 
    createOnePostalCode} = require('../controllers/loadData');
const upload = require('../helpers/loadData');
const { check } = require('express-validator');

const router = Router();

router.post('/', [
    validateJWT,
    // upload.single('file')
], createFileData);

router.post('/wnhd', [validateJWT] ,ViewAllHolidays );
router.post('/onewk', [validateJWT] ,ViewDateHolidays );

// router.post('/hd', upload.single('file'), 
//     createHolidays
// );
// router.post('/wk', upload.single('file'), 
//     createWeekends
// );
// router.post('/ct', upload.single('file'), 
//     createCountrys
// );
// router.post('/pc', upload.single('file'), 
//     createPostalCode
// )

// Creamos un solo postal Code
router.post('/pcone', [
    validateJWT,
    check('CountryCode', 'El CountryCode es obligatorio').not().isEmpty(),
    check('PostalCodeCity', 'El PostalCodeCity es obligatorio').not().isEmpty(),
    check('CityName', 'El CityName es obligatorio').not().isEmpty(),
], createOnePostalCode);

// Visualiza los datos de un Codigo Postal segun los tres primeros caracteres.
router.post('/ptal',
    [validateJWT], 
    ViewOnePostalCode
);

// Visualiza los datos de un Pais segun los tres primeros caracteres.
router.post('/couone',
    [validateJWT], 
    ViewOneCountry
);

// Visualiza los datos de una ciudad segun los tres primeros caracteres.
router.post('/ctone',
    [validateJWT], 
    ViewOneCity
);

// Visualiza los datos de una Dane Code segun el codigo postal
router.post('/dconezco',
    [
        validateJWT,
        check('ZipCode', 'El ZipCode es obligatorio').not().isEmpty(),
    ], ViewOneZipCodeDaneCode
);

// Visualiza los datos de una Dane Code segun la Ciudad
router.post('/dconecty',
    [
        validateJWT,
        check('CityName', 'El CityName es obligatorio').not().isEmpty(),
    ], ViewOneCityDaneCode
);




module.exports = router;
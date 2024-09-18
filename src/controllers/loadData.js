const { response } = require('express');
const fs = require('fs');
const xlsx = require('xlsx');
const daneCode = require('../models/daneCode');
const weekend = require('../models/weekend');
const Holidays = require('../models/Holidays');
const country = require('../models/country');
const postalCode = require('../models/postalCode');
const trm = require('../models/trm');


// TODO: SE DEBE BUSCAR UNA LIBRERIA QUE NO TENGA PROBLEMAS DE SEGURIDAD XLSX ESTA COMPROMETIDA Y NO SE PUEDE USAR

const createFileData = async (req, res = response) => {
    
    const uid = req.uid
    try {
        const workbook = xlsx.readFile(req.file.path); // Lee el archivo Excel
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Accede a la primera hoja del archivo

        const data = xlsx.utils.sheet_to_json(worksheet); // Convierte la hoja en un array de objetos

        const formattedData = data.map(item => ({
            CountryCode: item.CountryCode,
            CountryName_ES: item.CountryName_ES,
            CountryName_EN: item.CountryName_EN,
            StateCode: item.StateCode,
            CityCode: item.CityCode,
            CityName: item.CityName,
            ZipCode: item.ZipCode,
            DANECode: item.DANECode
        }));

        // Inserta los datos en la base de datos utilizando 'daneCode.insertMany'
        const DaneCodes = await daneCode.insertMany(formattedData);

        res.status(200).json({ message: 'Datos cargados exitosamente' });
    } catch (error) {
        applogger.error(`Error en LODACL-4O1 > createFileData: Error al Cargar los datos de DaneCode uid: ${uid}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O1: ', error
        });
    }
};


const createWeekends = async (req, res = response) => {

    const uid = req.uid
    try {
        // console.log('Ruta del Controlador: ', process.cwd());
        // const workbook = xlsx.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // const data = xlsx.utils.sheet_to_json(worksheet);
    
    
        const formattedData = data.map(item => ({
            date: item.Date,
            day: item.day,
            Weekday: item.Weekday,
        }));
    
        
        const WeekendsCodes = weekend.insertMany(formattedData, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Error al cargar los datos' });
            } else {
                // console.log(`${result.insertedCount} documentos insertados`);
                res.status(200).json({ message: 'Datos cargados exitosamente' });
            }
            // console.log(WeekendsCodes);
        });
        
    } catch (error) {
        applogger.error(`Error en LODACL-4O2 > createWeekends: Error al Cargar los datos de Fin de Semana uid: ${uid}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O2: ', error
        });
    }

};

const createHolidays = async (req, res = response) => {

    const uid = req.uid
    try {
        // console.log('Ruta del Controlador: ', process.cwd());
        // const workbook = xlsx.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // const data = xlsx.utils.sheet_to_json(worksheet);
    
    
        const formattedData = data.map(item => ({
            date: item.Date,
            day: item.Day,
            dayCategory: item.dayCategory,
            Holidays: item.Holidays,
        }));
        
        const HolidaysCodes = Holidays.insertMany(formattedData, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Error al cargar los datos' });
            } else {
                // console.log(`${result.insertedCount} documentos insertados`);
                res.status(200).json({ message: 'Datos cargados exitosamente' });
            }
            // console.log(HolidaysCodes);
        });
        
    } catch (error) {
        applogger.error(`Error en LODACL-4O3 > createHolidays: Error al Cargar los datos de dias festivos uid: ${uid}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O3: ', error
        });
    }

};

const createCountrys = async (req, res = response) => {
    
    const uid = req.uid
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Archivo no proporcionado' });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const lines = fileContent.split('\n');
        
        const formattedData = lines.map(line => {
            const [countryCode, countryName, PostalCode] = line.split('\t');
            return { CountryCode: countryCode, CountryName: countryName, PostalCode: PostalCode };
        });

        // Insertar los datos en la colección "countrys" utilizando el modelo Country
        const insertResult = await country.insertMany(formattedData);

        res.status(200).json({ message: 'Datos cargados exitosamente', insertedCount: insertResult.length });
    } catch (error) {
        applogger.error(`Error en LODACL-4O4 > createCountrys: Error al Cargar los Countrys uid: ${uid}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O4: ', error
        });
    }
};

const createPostalCode = async (req, res = response) => {
    
    const uid = req.uid
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Archivo no proporcionado' });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const lines = fileContent.split('\n');

        const formattedData = lines.map(line => {
            const [
                countryCode, postalCodeCity, cityName, stateName,
                stateCode, stateGuidance, stateNumber, cam1,
                cam2, lat, log, cam3
            ] = line.split('\t');

            return {
                CountryCode: countryCode,
                PostalCodeCity: postalCodeCity,
                CityName: cityName,
                StateName: stateName,
                StateCode: stateCode,
                StateGuidance: stateGuidance,
                StateNumber: stateNumber,
                Cam1: cam1,
                Cam2: cam2,
                Lat: lat,
                Log: log,
                Cam3: cam3
            };
        });

        // Insertar los datos en la colección "postalCodes" utilizando el modelo PostalCode
        const insertResult = await postalCode.insertMany(formattedData);

        res.status(200).json({ message: 'Datos cargados exitosamente', insertedCount: insertResult.length });
    } catch (error) {
        applogger.error(`Error en LODACL-4O5 > createPostalCode: Error al Cargar los Postal Code_ uid: ${uid}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O5: ', error
        });
    }
};

const ViewOnePostalCode = async (req, res = response) => { 
    const uid = req.uid
    try {
        const { CountryCode, postalcode } = req.body;
        
        var regexPattern = "^" + postalcode + ".{0,}$";

        // Verificar si postalcode es un número y tiene al menos 4 caracteres
        if (postalcode.toString().length < 4) {
            return res.json([]); // Retorna un arreglo vacío
        }

        const postalCodeDB = await postalCode.find(
            {
                CountryCode: CountryCode,
                PostalCodeCity: { $regex: regexPattern }
            },
        )

        res.status(200).json(
            {
                ok: true,
                postalCodeDB
            }
        );

    } catch (error) {
        applogger.error(`Error en LODACL-4O6 > ViewOnePostalCode: Error al Visualizar un Postal Code_ uid: ${uid}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O6: ', error
        });
    }
}

const ViewOneCountry = async (req, res = response) => { 
    const uid = req.uid
    const { CountryName } = req.body;
    try {
        
        // La i Administe que el valor sea Mayus o Minus
        var regexPattern = new RegExp("^" + CountryName, "i");

        // Verificar si postalcode es un número y tiene al menos 4 caracteres
        if (CountryName.toString().length < 3) {
            return res.json([]); // Retorna un arreglo vacío
        }

        const countryDB = await country.find(
            {
                CountryName: { $regex: regexPattern }
            },
            {
                CountryName: 1,
                CountryCode: 1,
                _id: 1
            }
        )

        res.status(200).json(
            {
                ok: true,
                countryDB
            }
        );

    } catch (error) {
        applogger.error(`Error en LODACL-4O7 > ViewOneCountry: Error al Visualizar un Pais uid: ${uid}, CountryName: ${CountryName}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O7: ', error
        });
    }
}

const ViewOneCity = async (req, res = response) => { 
    const uid = req.uid
    const { CountryCode, city } = req.body;
    try {
        
        var regexPattern = "^" + city + "i";

        // Verificar si postalcode es un número y tiene al menos 4 caracteres
        if (city.toString().length < 3) {
            return res.json([]); // Retorna un arreglo vacío
        }

        const CityDB = await postalCode.find(
            {
                CountryCode: CountryCode,
                PostalCodeCity: { $regex: regexPattern }
            },
        )

        res.status(200).json(
            {
                ok: true,
                CityDB
            }
        );

    } catch (error) {
        applogger.error(`Error en LODACL-4O8 > ViewOneCity: Error al Visualizar un Ciudad uid: ${uid}, CountryName: ${CountryName}, city: ${city}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O8: ', error
        });
    }
}

const createOnePostalCode = async (req, res = response) => {
    const uid = req.uid
    const { CountryCode, PostalCodeCity, CityName } = req.body
    try {
        

        const insertOnePostalCode = new postalCode({
            CountryCode,
            PostalCodeCity,
            CityName,
            ...req.body 
        })

        // Insertar los datos en la colección "postalCodes" utilizando el modelo PostalCode
        const dataPostalCode = await insertOnePostalCode.save()

        res.status(200).json({
            ok: true,
            msg: `Se creao Correctamente el codigo postal: ${PostalCodeCity} de ${CityName}`
        });
    } catch (error) {
        applogger.error(`Error en LODACL-4O9 > createOnePostalCode: Error al Crear un Codigo Postal uid: ${uid}, CountryName: ${CountryName}, city: ${city}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-4O9: ', error
        });
    }
};

const ViewOneCityDaneCode = async (req, res = response) => { 
    const uid = req.uid
    const { CityName } = req.body;
    try {

        // console.log('CityName: ', CityName)
        
        const regexPattern = new RegExp(CityName, 'i');

        // Verificar si postalcode es un número y tiene al menos 4 caracteres
        if (CityName.toString().length < 3) {
            return res.json([]); // Retorna un arreglo vacío
        }

        const DaneCodeCityDB = await daneCode.find(
            {
                CityName: { $regex: regexPattern }
            },
        )

        // console.log('regexPattern: ', regexPattern)

        res.status(200).json(
            {
                ok: true,
                DaneCodeCityDB
            }
        );

    } catch (error) {
        applogger.error(`Error en LODACL-410 > ViewOneCityDaneCode: Error al Visualizar una Ciudad uid: ${uid}, CityName: ${CityName}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-410: ', error
        });
    }
}

const ViewOneZipCodeDaneCode = async (req, res = response) => { 
    const uid = req.uid
    const { ZipCode } = req.body;
    try {
        
        var regexPattern = new RegExp("^" + ZipCode, "i");

        // Verificar si postalcode es un número y tiene al menos 4 caracteres
        if (ZipCode.toString().length < 3) {
            return res.json([]); // Retorna un arreglo vacío
        }

        const DaneCodeZipDB = await daneCode.find(
            {
                ZipCode: { $regex: regexPattern }
            },
        )

        res.status(200).json(
            {
                ok: true,
                DaneCodeZipDB
            }
        );

    } catch (error) {
        applogger.error(`Error en LODACL-411 > ViewOneZipCodeDaneCode: Error al Visualizar un Codigo Postal del Dane uid: ${uid}, ZipCode: ${ZipCode}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-411: ', error
        });
    }
}

const ViewTRMxDateRange = async (req, res = response) => {

    const uid = req.uid
    const { dateIni, dateEnd } = req.body;
    try {

        // console.log(dateIni, dateEnd)

        const TrmDB = await trm.find({
            date: {
                $gte: dateIni,
                $lte: dateEnd
            }
        });

        res.status(200).json(
            {
                ok: true,
                TrmDB
            }
        );

    } catch (error) {
        applogger.error(`Error en LODACL-413 > ViewTRMxDateRange: Error al Visualizar la TRM por Rango de Fecha uid: ${uid}, dateIni: ${dateIni}, dateEnd: ${dateEnd}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-413: ', error
        });
    }

}

const ViewAllHolidays = async (req, res = response) => {

    const uid = req.uid

    try {
        const AllHolidaysDB = await Holidays.find().sort({ date: 1 });
    
        res.status(200).json(
            {
                ok: true,
                AllHolidaysDB
            }
        )
        
    } catch (error) {
        applogger.error(`Error en LODACL-414 > ViewAllHolidays: Error al Visualizar Todos los Dias Festivos uid: ${uid}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-414: ', error
        });
    }

};

const ViewDateHolidays = async (req, res = response) => {

    const uid = req.uid
    const { date } = req.body;
    try {
        const AllHolidaysDB = await Holidays.find({
            date: date
        });
    
        // console.log('AllHolidaysDB: ',)
    
        res.status(200).json(
            {
                ok: true,
                AllHolidaysDB
            }
        )

        
    } catch (error) {
        applogger.error(`Error en LODACL-415 > ViewDateHolidays: Error al Visualizar los Dias Festivos uid: ${uid}, date: ${date} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LODACL-415: ', error
        });
    }

};


module.exports = {
    createFileData,
    createWeekends,
    createHolidays,
    createCountrys,
    createPostalCode,
    ViewOneCountry,
    ViewOneCity,
    ViewOnePostalCode,
    createOnePostalCode,
    ViewOneCityDaneCode,
    ViewOneZipCodeDaneCode,
    ViewTRMxDateRange,
    ViewAllHolidays,
    ViewDateHolidays,
};
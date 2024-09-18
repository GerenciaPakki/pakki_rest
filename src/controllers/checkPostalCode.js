const country = require("../models/country");
const postalCode = require("../models/postalCode");
const { applogger } = require("../utils/logger");

const viewPostalCo = async (req, res = response) => {

    const { postalCode } = req.body
    try {
    
        res.json({
            ok: true,
            msg: req.body
        });
        
    } catch (error) {
        applogger.error(`Error en CHPOCOCL-401 > viewPostalCo: Error al Visualizar el Postal Code PostalCode: ${postalCode}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'CKPTL-1.0:', error
        });
    }
}

const viewCountry = async (req, res = response) => {
    
    const searchCountry = req.body.countryName
    try {
        
        // Validar que al menos se ingresen tres caracteres
        if (searchCountry.length < 3) {
            return res.json([]); // Retorna un arreglo vacío si no hay suficientes caracteres
        }
    
        // Eliminar caracteres no numéricos
        const SearchCountry = searchCountry.replace(/\D/g,'');
        
        const query = { CountryName: { $regex: `^${SearchCountry}`, $options: 'i' } };
        try {
            const countries = await country.find(query, {
                CountryName: 1, CountryCode: 1,
                PostalCode: 1, _id: 0,
            }).exec();
    
            // Limpia los valores de PostalCode y elimina propiedades de Mongoose
            const cleanedCountries = countries.map(country => ({
                CountryCode: country.CountryCode,
                CountryName: country.CountryName,
                PostalCode: country.PostalCode.trim()
            }));
    
            res.json(cleanedCountries);
        } catch (err) {
            applogger.error(`Error en CHPOCOCL-402 > viewCountry: Error al Visualizar el country: ${searchCountry},`)
            res.status(418).json({
                ok: false,
                error: 'CHPOCOCL-402: ', err
            });
        }
        
    } catch (error) {
        applogger.error(`Error en CHPOCOCL-402 > viewCountry: Error al Visualizar el country: ${searchCountry}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'CHPOCOCL-402:', error
        });
    }

};

const viewAllCountry = async (req, res = response) => {
    
    try {

        const countries = await country.find({}, {
            CountryName: 1, CountryCode: 1,
            PostalCode: 1, _id: 1,
        }).sort({ CountryCode: 1 })

        res.status(200).json(
            {
                ok: true,
                msg: countries        
            }
        )

    } catch (error) {
        applogger.error(`Error en CHPOCOCL-403 > viewAllCountry: Error al Visualizar todos lo country: ${searchCountry}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'CHPOCOCL-403:', error
        });
    }

};

const viewCityName = async (req, res = response) => {

    const searchCountryCode = req.body.countryCode
    const searchCityName = req.body.cityName
    try {
    
        // Validar que al menos se ingresen tres caracteres
        if (searchCityName.length < 3) {
            return res.json([]); // Retorna un arreglo vacío si no hay suficientes caracteres
        }
    
        const query = {
            CountryCode: searchCountryCode,
            $or: [
                { CityName: { $regex: `^${searchCityName}`, $options: 'i' } },
                // { StateName: { $regex: `^${searchCityName}`, $options: 'i' } }
            ]
        };
    
        try {
            const PostalCodes = await postalCode.find(query, {
                CountryCode: 1, PostalCodeCity: 1, CityName: 1, StateName: 1, StateCode: 1, Cam1: 1, _id: 0
            }).limit(100).exec();
    
            res.json(PostalCodes);
        } catch (err) {
            applogger.error(`Error en CHPOCOCL-404 > viewCityName: Error when searching for cities  City: ${searchCityName}, searchCountryCode: ${searchCountryCode}, error: ${err}`)
            res.status(418).json({
                ok: false,
                msg: 'CHPOCOCL-404: Error when searching for cities or states'
            });
        }        
    } catch (error) {
        applogger.error(`Error en CHPOCOCL-404 > viewCityName: Error when searching for cities or City: ${searchCityName}, searchCountryCode: ${searchCountryCode}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'CHPOCOCL-404:', error
        });
    }

};


const viewPostalCode = async (req, res = response) => {

    const searchPostalCode = req.body.PostalCodeCity
    const searchCountryCode = req.body.CountryCode

    try {
        // Validar que al menos se ingresen tres caracteres
        if (searchPostalCode.length < 3) {
            return res.json([]); // Retorna un arreglo vacío si no hay suficientes caracteres
        }
    
        const query = {
            CountryCode: searchCountryCode,
            PostalCodeCity: { $regex: `^${searchPostalCode}`, $options: 'i' }
        };
    
        try {
            const PostalCodes = await postalCode.find(query, {
                CountryCode: 1, PostalCodeCity: 1, CityName: 1, StateName: 1, StateCode: 1,
                _id: 0
            }).limit(50).exec();
    
            res.json(PostalCodes);
        } catch (err) {
            applogger.error(`Error en CHPOCOCL-405 > viewPostalCode: when searching PostalCode: ${searchPostalCode}, searchCountryCode: ${searchCountryCode}`)
            res.status(418).json({
                ok: false,
                msg: 'CHPOCOCL-405: Error when searching for PostalCode'
            });
        }        
    } catch (error) {
        applogger.error(`Error en CHPOCOCL-405 > viewPostalCode: when searching PostalCode: ${searchPostalCode}, searchCountryCode: ${searchCountryCode}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'CHPOCOCL-405:', error
        });
    }

};

const viewClonePostalCode = async (req, res = response) => {

    const searchPostalCode = req.body.PostalCodeCity
    const searchCountryCode = req.body.CountryCode

    try {
        // Validar que al menos se ingresen tres caracteres
        if (searchPostalCode.length < 3) {
            return res.json([]); // Retorna un arreglo vacío si no hay suficientes caracteres
        }
    
        const query = {
            CountryCode: searchCountryCode,
            PostalCodeCity: { $regex: `^${searchPostalCode}`, $options: 'i' }
        };
    
        try {
            const PostalCodes = await postalCode.findOne(query,{_id:0})
    
            res.json(PostalCodes);
        } catch (err) {
            applogger.error(`Error en CHPOCOCL-405 > viewPostalCode: when searching PostalCode: ${searchPostalCode}, searchCountryCode: ${searchCountryCode}`)
            res.status(418).json({
                ok: false,
                msg: 'CHPOCOCL-405: Error when searching for PostalCode'
            });
        }        
    } catch (error) {
        applogger.error(`Error en CHPOCOCL-405 > viewPostalCode: when searching PostalCode: ${searchPostalCode}, searchCountryCode: ${searchCountryCode}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'CHPOCOCL-405:', error
        });
    }

};

const getClonePostalCode = async (req, res = response) => {

    const CloneCodigoPostal = req.body
    try {

        const cloneCode = new postalCode(CloneCodigoPostal)

        const cloneCodeDB = await cloneCode.save()

        res.status(200).json({
            ok: true,
            msg: `Se creo Clono el codigo postal: ${cloneCodeDB.PostalCodeCity}, de la Ciudad: ${cloneCodeDB.CityName}`
        });

    } catch (error) {
        applogger.error(`Error en CHPOCOCL-405 > getClonePostalCode: Error al ubicar el CloneCodigoPostal: ${CloneCodigoPostal}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'CHPOCOCL-405: Error al ubicar el PostalCode',
            error
        });
    }
}

const getCreatePostalCode = async (req, res = response) => {

    const CreateCodigoPostal = req.body
    try {
        const CreateCode = new postalCode(CreateCodigoPostal)
    
        const CreateCodeDB = await CreateCode.save()
    
        console.log('CreateCodeDB: ', CreateCodeDB)
    
        res.status(200).json({
            ok: true,
            msg: `Se creo correctamente el codigo postal: ${CreateCodeDB.PostalCodeCity}, de la Ciudad: ${CreateCodeDB.CityName}`
        });

    } catch (error) {
        applogger.error(`Error en CHPOCOCL-405 > getCreatePostalCode: Error al ubicar el CreateCodigoPostal: ${CreateCodigoPostal}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'CHPOCOCL-405: Error al ubicar el PostalCode',
            error
        });
    }
}


module.exports = {
    viewCountry,
    viewAllCountry,
    viewPostalCode,
    viewCityName,
    getClonePostalCode,
    viewClonePostalCode,
    getCreatePostalCode,    
}
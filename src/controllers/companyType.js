const { response } = require('express');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');
const companyType = require('../models/companyType');
const { applogger } = require('../utils/logger');


const ViewCompanyType = async (req, res = response) => { 
    
    const uid = req.uid
    try {

        const viewCompanyTypeDB = await companyType.find(
            {},
            {           
                name: 1,  
                _id: 1    
            }
        );

        res.status(200).json({
            ok: true,
            msg: viewCompanyTypeDB
        });
        
    } catch (error) {
        applogger.error(`Error en COMTYCL-4O1 > ViewCompanyType: Error_ al Visualizar todos los Tipos de Compañias USERID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COMTYCL-4O1: ', error
        });
    }
}
const CreateCompanyType = async (req, res = response) => { 
    const uid = req.uid
    const { name } = req.body;
    try {
        const CompanyTypeDB = new companyType(req.body);

        const existeCompanyType = await companyType.find({ name: name });


        if (!existeCompanyType) {
            // El CompanyType ya esta Registrada
            return res.status(418).json({
                ok: false,
                msg: 'COMTYCL-4O2'
            });
        }
        await CompanyTypeDB.save();

        res.status(200).json({
            ok: true,
            msg: 'Tipo de Compañia fue ingresado correctamente'
        });

    } catch (error) {
        applogger.error(`Error en COMTYCL-4O2 > CreateCompanyType: Error_ al Crear un Tipo de Compañia USERID: ${uid}, tipo de COmpañia ${name} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COMTYCL-4O2: ', error
        });
    }
}
const UpdateCompanyType = async (req, res = response) => { 
    try {
        res.json({
            ok: true,
            msg: req.body
        });
    } catch (error) {
        applogger.error(`Error en COMTYCL-4O3 > UpdateCompanyType: Error_ al Crear un Tipo de Compañia USERID: ${uid}, tipo de COmpañia ${name} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COMTYCL-4O3: ', error
        });
    }
}
const DeleteCompanyType = async (req, res = response) => { 
    try {
        res.json({
            ok: true,
            msg: req.body
        });
    } catch (error) {
        res.status(418).json({
            ok: false,
            msg: 'CLLCT-4: ', error
        });
    }
}


module.exports = {
    ViewCompanyType,
    CreateCompanyType,
    UpdateCompanyType,
    DeleteCompanyType,
};
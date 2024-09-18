const bcrypt = require('bcryptjs');
const { response } = require('express');
const { Surcharge } = require('../helpers/companyDiscount');
const companyDiscount = require('../models/companyDiscount');
const {
    insertarDatosMasivosDiscount,
    insertarOneDiscount,
    updateOneDiscount
} = require('../helpers/insertarDatosMasivos');
const { param } = require('express-validator');
const { applogger } = require('../utils/logger');


const viewCompanyDiscount = async (req, res = response) => { 

    const uid = req.uid
    try {
        res.json({
            ok: true,
            msg: 'Entramos a Consultar Company Discount',
            data: req.body
        });        
    } catch (error) {
        applogger.error(`Error en DISCOCL-4O1 > viewCompanyDiscount: Error al visualizar Company Discount uid: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'DISCOCL-1.0'
        });
    }
};

const viewAllCompanyDiscount = async (req, res = response) => { 

    const uid = req.uid
    try {

        const getAllCDDB = await companyDiscount.find(
            {},
            {
                Provider: 1,
                ServiceName: 1,
                Domestic: 1,
                ServiceType: 1,
                _id: 1
            }
        )
        res.status(200).json({
            ok: true,
            msg: getAllCDDB
        });        
    } catch (error) {
        applogger.error(`Error en DISCOCL-4O1 > viewCompanyDiscount: Error al visualizar Company Discount uid: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'DISCOCL-1.0'
        });
    }
};

const viewCompanyDiscountForID = async (req, res = response) => { 

    const uid = req.uid
    const CDiD = req.body.companyDiscountID
    try {

        const getAllCDDB = await companyDiscount.find(
            {
                _id : CDiD
            },
            {
                Provider: 1,
                ServiceName: 1,
                Domestic: 1,
                ServiceType: 1,
                Data:1,
                _id: 1
            }
        )
        res.status(200).json({
            ok: true,
            msg: getAllCDDB
        });        
    } catch (error) {
        applogger.error(`Error en DISCOCL-4O1 > viewCompanyDiscount: Error al visualizar Company Discount uid: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'DISCOCL-1.0'
        });
    }
};

const createCompanyDiscount = async (req, res = response) => { 

    const uid = req.uid;
    try {
        const {Provider,ServiceName,Domestic,ServiceType} = req.body;
            
        const discountDB = await companyDiscount.find(
            { Provider: Provider, ServiceName: ServiceName, Domestic: Domestic, ServiceType: ServiceType });
        
        if (discountDB.length === 0) {
            // console.log('Se Creara el Proveedor y el Servicio');
            const CompanyDiscount = await Surcharge(req.body, uid);
            if (CompanyDiscount.ok === false) {
                res.status(418).json({
                    ok: false,
                    data: CompanyDiscount.msg
                });                
            } else {
                res.status(200).json({
                    ok: true,
                    data: CompanyDiscount.msg
                });
            }
        } else {
            // console.log('Este Proveedor y Tipo Servicio ya Existe');
            res.status(418).json({
                ok: false,
                msg: 'Este Proveedor y Tipo Servicio ya Existe',
                code: 'DISCOCL-1.1'
            });
        } 
        
    } catch (error) {
        applogger.error(`Error en DISCOCL-4O2 > viewCompanyDiscount: Error al visualizar Company Discount uid: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'DISCOCL-4O2: ', error
        });
    }
};

const updateManyCompanyDiscount = async (req, res = response) => { 

    const id = req.params.id;
    try {
        
        const DiscountData = req.body;
        const dis = await insertarDatosMasivosDiscount(id,DiscountData)
    
        res.status(200).json({
            ok: true,
            data: dis.msg,
            id: id
        });
        
    } catch (error) {
        applogger.error(`Error en DISCOCL-4O3 > updateManyCompanyDiscount: Error al Cargar de manera masiva Company Discount uid: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'DISCOCL-4O3: ', error
        });
    }
};

const updateOneCompanyDiscount = async (req, res = response) => { 

    const id = req.params.id;
    try {
        const DiscountData = req.body;
        const dis = await updateOneDiscount(id, DiscountData)
        
        if (dis.msg === true) {
            res.status(200).json({
                ok: true,
                data: dis.msg,
            });            
        } else {
            res.status(418).json({
                ok: false,
                data: dis.msg,
            });
        }    
        
    } catch (error) {
        applogger.error(`Error en DISCOCL-4O4 > updateOneCompanyDiscount: Error al Actualizar Company Discount id: ${id} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'DISCOCL-4O4: ', error
        });
    }
};

const ViewOneCompanyDiscountWeight = async (req, res = response) => { 

    const { Provider, Weight } = req.body;
    try {
        
        const option = {Provider:Provider, "Data.Weight": Weight }
        const discountDB = await companyDiscount.find(
            option,
        )
    
        res.json({
            ok: true,
            discountDB
        });
        
    } catch (error) {
        applogger.error(`Error en DISCOCL-4O5 > ViewOneCompanyDiscountWeight: Error al Actualizar CompanyDiscountWeight Provider: ${Provider}, Weight: ${Weight}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'DISCOCL-4O5: ', error
        });
    }
};

const deleteCompanyDiscount = async (req, res = response) => { 

    try {
        res.json({
            ok: true,
            msg: 'Entramos a Eliminar Company Discount',
            data: req.body
        });
        
    } catch (error) {
        applogger.error(`Error en DISCOCL-4O6 > deleteCompanyDiscount: Error al Eliminar Company Discount Provider:  error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'DISCO-1.3: ',error
        });
    }
};

module.exports = {
    viewCompanyDiscount,
    createCompanyDiscount,
    updateManyCompanyDiscount,
    deleteCompanyDiscount,
    updateOneCompanyDiscount,
    ViewOneCompanyDiscountWeight,
    viewAllCompanyDiscount,
    viewCompanyDiscountForID,
};
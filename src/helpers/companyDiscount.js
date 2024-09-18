const { response } = require('express');
// const companyDiscount = require('../models/companyDiscount');
const companyDiscount = require('../models/companyDiscount');


async function Surcharge(data, id) {

    const uid = id;
    try {    
        const discount = new companyDiscount({
            Provider: data.Provider,
            ServiceName: data.ServiceName,
            ServiceCode: data.ServiceCode,
            Domestic: data.Domestic,
            ServiceType: data.ServiceType,
            Data: [{
                Country: data.Country,
                Weight: data.Weight,
                Fee: data.Fee,
                RateIncrease: data.RateIncrease,
                PakkiIncrease: data.PakkiIncrease,
                PakkiDiscount: data.PakkiDiscount
            }],
            creatorUser: uid
        });
        const creaDiscount = await discount.save();
    
        return {
            ok: true,
            msg: creaDiscount
        };
        
    } catch (error) {
        applogger.error(`Error en COMPDISHLP-4O1 > Surcharge: Error al Surcharge uid: ${uid} error: ${error}`);
        return {
            ok: false,
            msg: 'COMPDISHLP-4O1: ', error
        }
    }
}

module.exports = {
    Surcharge,
};
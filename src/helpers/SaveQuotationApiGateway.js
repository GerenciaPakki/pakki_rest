const axios = require('axios');
const { applogger } = require('../utils/logger');
const { responseQuota, quotaJsonDataBase } = require('../structures/json/quota')
const quotations = require('../models/quotations');
const { Surcharge } = require('./companySurcharges');
const { APIGATEWAY_COTIZAR } = require('../utils/config');



// Creating a date time object
global.jsonResUPS = [];

async function quotation(provider, bus, uid, dat) {     
    // const url = 'http://localhost:3000/deprisa/cotizar';
    const url = APIGATEWAY_COTIZAR
    let Providers = [];
    
    try {            
        return axios.post(url, dat, {}).then( async response => {
            const responseApiGateway = response.data.body;
            
            const SurchargePakki = await Surcharge(provider,responseApiGateway,dat.Shipments.Shipment);

            const saveCDRQuota = new quotations(quotaJsonDataBase(responseApiGateway, bus, uid, dat, provider));
                
            saveCDRQuota.save();

            Providers.push(responseQuota(SurchargePakki.Provider,responseApiGateway,dat));

            return Providers;

        }).catch(error => {                
            applogger.error(`Error ${provider} -> ${error}`);            
            return Providers.push(`Error ${provider} -> ${error.message}`);
        });
        
    } catch (error) {            
        applogger.error(`Error consumiendo servicio ${provider}: ${error}`)
        return Providers.push(error.response);
    };
};



module.exports = {
    quotation
};

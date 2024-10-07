const axios = require('axios');
const { applogger } = require('../utils/logger');
const { responseQuota, quotaJsonDataBase } = require('../structures/json/quota')
const quotations = require('../models/quotations');
const { Surcharge } = require('./companySurcharges');
const { APIGATEWAY_COTIZAR } = require('../utils/config');
const { error } = require('winston');



// Creating a date time object
global.jsonResUPS = [];

async function quotation(provider, bus, uid, dat) {     
    // const url = 'http://localhost:3000/deprisa/cotizar';
    const url = APIGATEWAY_COTIZAR
    let Providers = [];
    // applogger.error(`url ${provider}: ${url}`)
    try {            
        return axios.post(url, dat, {}).then( async response => {            
            const responseApiGateway = response.data.body;
                        
            // applogger.info(`Response.data -> ', ${responseApiGateway}`)
            // applogger.info(`Response.data -> ${JSON.stringify(responseApiGateway, null, 2)}`);
            // console.log('Response.data.body -> ', responseApiGateway)

            const SurchargePakki = await Surcharge(provider,responseApiGateway,dat.Shipments.Shipment);
        
            // console.log('dat.Shipments.Shipment -> ', dat.Shipments.Shipment)

            const saveCDRQuota = new quotations(quotaJsonDataBase(responseApiGateway, bus, uid, dat, provider));
                
            saveCDRQuota.save();
            // console.log('SurchargePakki.Provider ->', SurchargePakki.Provider)
            // console.log('responseApiGateway -> ', responseApiGateway)
            // console.log('dat -> ', dat)
            Providers.push(responseQuota(SurchargePakki.Provider,responseApiGateway,dat));
            // console.log('Providers -> ', Providers)
            return Providers;

        }).catch(error => {                
            applogger.error(`Error ${provider} -> ${error}`);            
            return Providers.push(`Error111 ${provider} -> ${error.message}`);
        });
        
    } catch (error) {            
        applogger.error(`Error consumiendo servicio ${provider}: ${error}`)
        return Providers.push(error.response);
    };
};



module.exports = {
    quotation
};

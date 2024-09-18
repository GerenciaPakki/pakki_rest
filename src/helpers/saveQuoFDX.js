const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');
const quotations = require('../models/quotations');

const { quotaJsonFDXDataBase, resProFDX, QuotaXML_FDX } = require('../structures/xml/quotaFDX');
const { SurchargePakkiFDX, SurchargePakkiDomesticFDX } = require('./companySurcharges');
const { DaneCodeCity } = require('./DaneCodeCity');

const { FDX_QUOTATION_URL } = require('../utils/config');

async function quotaXMLFDX(shipper, recipient, company, shipment, dat) {
    
    const servicesFDX_CO_INT = [
        { "service1": "INTERNATIONAL_PRIORITY" },
        { "service2": "INTERNATIONAL_ECONOMY" },
    ];
    const servicesFDX_CO_NAT = [
        { "service4": "PRIORITY_OVERNIGHT" },
        { "service5": "STANDARD_OVERNIGHT" },
    ];
    const servicesFDX_US = [
        { "service3": "FIRST_OVERNIGHT" },
        { "service4": "PRIORITY_OVERNIGHT" },
        { "service5": "STANDARD_OVERNIGHT" },
        { "service6": "FEDEX_2_DAY" },
        { "service7": "FEDEX_2_DAY_AM" },
        { "service8": "EXPRESS_SAVER" },
    ];
    const servicesFDX_US_NAT = [
        { "service3": "FIRST_OVERNIGHT" },
        { "service4": "PRIORITY_OVERNIGHT" },
        { "service5": "STANDARD_OVERNIGHT" },
        { "service6": "FEDEX_2_DAY" },
        { "service7": "FEDEX_2_DAY_AM" },
    ];
    
    // VALIDAMOS SEGUN EL PESO Y EL PESO VOLUMETRICO PARA DETERMINAR EL TIPO DE EMPAQUE
    let pkgType = '';
    const { weight, length, width, height } = shipment;
    const volumetricWeight = ((length * width * height) / 5000);

    /* 
    PARA TENER ENCUENTA:
    EN LOS DIFERENTES SERVICIOS LUEGO DE 9 KG NO ACEPTA SINO TIPO YOUR_PACKAGING
    */

    
    global.QuotationsArray = [];
    global.ProvidersFDX = [];
    global.jsonResFDX = [];

    // const url = 'https://ws.fedex.com:443/web-services';
    const url = FDX_QUOTATION_URL
    

    if (shipper.countryCode === "CO" && recipient.countryCode === "CO") { 
        if (weight === 0.5 && volumetricWeight <= 0.5 && shipment.documentShipment) {
        pkgType = "FEDEX_ENVELOPE";
        } else if ((weight >= 0.5 && weight <= 2) || (volumetricWeight >= 0.5 && volumetricWeight <= 2)) {
        pkgType = "YOUR_PACKAGING";
        } else if ((weight >= 2.5 && weight <= 3.5) || (volumetricWeight >= 2.5 && volumetricWeight <= 3.5)) {
        pkgType = "YOUR_PACKAGING";
        } else if ((weight >= 4 && weight <= 9) || (volumetricWeight >= 4 && volumetricWeight <= 9)) {
        pkgType = "YOUR_PACKAGING";
        } else if ((weight >= 9.5) || (volumetricWeight >= 9.5 )) {
        pkgType = "YOUR_PACKAGING";
        } else {
        pkgType = "YOUR_PACKAGING";
        }

        dat.Shipments.packagingType = pkgType;

        // TODO: VALIDAR LAS CIUDADES PARA AGREGARLE EL DANECode        

        
        const daneCode = await DaneCodeCity(dat.Origin.CityName, dat.Destination.CityName)
        
        dat.Origin.DANECode = daneCode.origin;
        dat.Destination.DANECode = daneCode.destination;
        
        QuotationsArray = [];

        for (let i = 0; i < servicesFDX_CO_NAT.length; i++) { 
            const service = servicesFDX_CO_NAT[i];
            const serviceType = Object.values(service)[0];
            dat.Shipments.ServiceType = serviceType;
            const quot = mustache.render(QuotaXML_FDX , dat);
            // Enviamos al Array Cada paso para luego mover la info fuera del FOR
            QuotationsArray.push(quot);

        }

        // console.log(QuotationsArray[0]);
        const respon = await Promise.all(
            QuotationsArray.map(quotation =>
                axios.post(url, quotation, {})
            )
        );
        for (const response of respon) {
            jsonResFDX = [];
            const xmlResFDX = response.data;
            // console.log(xmlResFDX);
            xml2js.parseString(xmlResFDX, (error, result) => {
                if (error) {
                    console.error(error);
                } else {
                    jsonResFDX.push(result);
                }
            });

            
            // console.log(jsonResFDX[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0])
            
            const resp = jsonResFDX[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0];
            if (resp.RateReply[0].HighestSeverity[0] === 'FAILURE' || resp.RateReply[0].HighestSeverity[0] === 'ERROR' ) {
                return {
                    OK: false,
                    error: 'Error FEDEX: SaveQuotationFDX01',
                    msg: resp.RateReply[0].Notifications[0]
                };
            }
            // console.info(resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0]);

            const ServiceType = resp.RateReply[0].RateReplyDetails[0].ServiceType[0];
            const ProvicerDiscount = resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].EffectiveNetDiscount[0];
            const exchangeRate = 1;
            // const Service = 1; PARA COTIZACIONES NO VA EL TIPO DE SERVICIO POR QUE DEBE CONSULTAR LOS DOS DE FDX
            const Domestic = dat.Shipments.documentShipment;
            const Weight = dat.Shipments.Shipment.Weight;
            const shippingValue = resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].ShipmentRateDetail[0].TotalNetChargeWithDutiesAndTaxes[0];

            const SurchargePakki = await SurchargePakkiDomesticFDX(ServiceType, ProvicerDiscount, exchangeRate, shippingValue,Domestic,Weight);
            // console.info(resp.RateReply[0].RateReplyDetails[0].ServiceDescription[0]);
            const proFDX = new quotations(
                quotaJsonFDXDataBase(resp, company, dat,SurchargePakki)
            );
            
            proFDX.save();
            ProvidersFDX.push( await resProFDX(resp,SurchargePakki));
        }
        
        return ProvidersFDX;

    } else if (shipper.countryCode === "CO" && recipient.countryCode !== "CO") {
        if (weight === 0.5 && volumetricWeight <= 0.5 && shipment.documentShipment) {
        pkgType = "FEDEX_ENVELOPE";
        } else if ((weight >= 0.5 && weight <= 2) || (volumetricWeight >= 0.5 && volumetricWeight <= 2)) {
        pkgType = "FEDEX_PAK";
        } else if ((weight >= 2.5 && weight <= 3.5) || (volumetricWeight >= 2.5 && volumetricWeight <= 3.5)) {
        pkgType = "FEDEX_BOX";
        } else if ((weight >= 4 && weight <= 9) || (volumetricWeight >= 4 && volumetricWeight <= 9)) {
        pkgType = "FEDEX_TUBE";
        } else if ((weight >= 9.5) || (volumetricWeight >= 9.5 )) {
        pkgType = "YOUR_PACKAGING";
        } else {
        pkgType = "YOUR_PACKAGING";
        }

        dat.Shipments.packagingType = pkgType;
        QuotationsArray = [];

        // Para estos Paises modificamos la variable para este proveedor.
        if (dat.Destination.CountryCode === "GB" || dat.Destination.CountryCode === "CN" || dat.Destination.CountryCode === "AR") {
            dat.Destination.StateCode = ""
        }   
        
        for (let i = 0; i < servicesFDX_CO_INT.length; i++) { 
            const service = servicesFDX_CO_INT[i];
            const serviceType = Object.values(service)[0];
            dat.Shipments.ServiceType = serviceType;
            const quot = mustache.render(QuotaXML_FDX, dat);
            // Enviamos al Array Cada paso para luego mover la info fuera del FOR
            QuotationsArray.push(quot);
            // console.log(`QuotationsArray:${i} `,QuotationsArray[i])
        } 

        const respon = await Promise.all(
            QuotationsArray.map(quotation =>
                axios.post(url, quotation, {})
            )
        );
        
        // console.log(respon);
        for (const response of respon) {
            jsonResFDX = [];
            const xmlResFDX = response.data;
            // TODO: AQUI SE ENVIA A LA API DE FDX
            xml2js.parseString(xmlResFDX, (error, result) => {
                if (error) {
                    console.error(error);
                } else {
                    jsonResFDX.push(result);
                }
            });

            // console.log(jsonResFDX[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]);
            
            const resp = jsonResFDX[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0];

            // console.log(resp.RateReply[0].Notifications[0].Message[0]);
            
            // console.log(resp.hasOwnProperty('DeliveryTimestamp'))                
            // if (resp.RateReply[0].RateReplyDetails[0].DeliveryTimestamp === undefined) {
            if (resp.RateReply[0].HighestSeverity[0] === 'ERROR' || resp.RateReply[0].RateReplyDetails[0].DeliveryTimestamp === undefined) {
                // console.log('NO Tenemos Fecha de Recoleccion') 
                const resError = {
                    OK: false,
                    error: 'Error FDX_CO Generar la consulta al Proveedor SaveQuoFDX01: ' + (resp.RateReply[0].Notifications[0].Message[0] || resp.RateReply[0].RateReplyDetails[0].DeliveryTimestamp)
                };
                return resError;
            }
            
            const ServiceType = resp.RateReply[0].RateReplyDetails[0].ServiceType[0];
            const ProvicerDiscount = resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].EffectiveNetDiscount[0];
            const exchangeRate = resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].ShipmentRateDetail[0].CurrencyExchangeRate[0];
            const Domestic = dat.Shipments.documentShipment;
            const Weight = dat.Shipments.Shipment.Weight;
            const shippingValue = resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].ShipmentRateDetail[0].TotalNetChargeWithDutiesAndTaxes[0];

            const SurchargePakki = await SurchargePakkiFDX(ServiceType, ProvicerDiscount, exchangeRate, shippingValue,Domestic,Weight);
            
            const proFDX = new quotations(
                quotaJsonFDXDataBase(resp, company, dat, SurchargePakki)
            );
            
            proFDX.save();
            ProvidersFDX.push(await resProFDX(resp, SurchargePakki));
            // return jsonResFDX;       
        }
        
        // console.log('ProvidersFDX: ', ProvidersFDX)
        return ProvidersFDX;       

    } else if (shipper.countryCode === "US" && recipient.countryCode === "CO") {

        res.status(200).json({
            ok: true,
            msg: 'Actualmente No tenemos Convenio de Importacion con FDX'
        });

    } else if (shipper.countryCode === "US" && recipient.countryCode === "US") {
             
        res.status(200).json({
            ok: true,
            msg: 'Aqui vamos con Envios Nacionales en US'
        });

    } else if (shipper.countryCode === "US" ) {
        
        res.status(200).json({
            ok: true,
            msg: 'Aqui vamos con Envios Internacionales en US'
        });

    }  
}



module.exports = {
    quotaXMLFDX,
};




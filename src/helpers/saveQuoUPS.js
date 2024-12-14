const { response } = require('express');

const axios = require('axios');
const mustache = require('mustache');
const { DateTime } = require('luxon');
const { xmlQuotaUPS_Beta,resXmlProUPS, quotaXmlUPSDataBase, xmlQuotaUPS_Import } = require('../structures/xml/quotaUPS');
const xml2js = require('xml2js');
const { applogger } = require('../utils/logger');

const quotations = require('../models/quotations');
const { xmlShipDocUPS } = require('../structures/xml/shipUPS');
const { SurchargePakkiUPS, SurchargePakkiQuotationUPS } = require('./companySurcharges');
const { handleError } = require('../structures/xml/quotaDHL');
const { UPS_QUOTATION_URL } = require('../utils/config');

// Creating a date time object
const date = DateTime.local().toISODate();
const dateQuota = DateTime.fromFormat(date, 'yyyyMMdd').toISODate(); // Output: '2023-02-24'
const horaLuxon = DateTime.fromFormat(date, 'HHmm'); //Salida: 14:30:00.000-05:00

let QuotationsArray = [];
// global.ProvidersUPS = [];
global.jsonResUPS = [];

const QuotaFDX = [
        { "service1": "QuotaFDX_IP" },
        { "service2": "QuotaFDX_IE" },
        { "service3": "QuotaFDX_FO" },
        { "service4": "QuotaFDX_PO" },
        { "service5": "QuotaFDX_SO" },
        { "service6": "QuotaFDX_FTOD" },
        { "service7": "QuotaFDX_FTODAM" },
        { "service8": "QuotaFDX_ES" },
    ];

async function quotaUPS(shipper, recipient, bus, uid, shipment, dat, res) {     
    const id = uid;
    const bs = bus;
    // const url = 'https://onlinetools.ups.com/ups.app/xml/Rate';
    const url = UPS_QUOTATION_URL
    let ProvidersUPS = [];

    const servicesUPS_US = [
        {"service1": "UPS Worldwide Saver"},
    ];

    if (shipper.countryCode === "CO" && recipient.countryCode !== "CO") {

        console.log('Entramos a UPS Exportaciones')
        console.log('shipper.countryCode: ', shipper.countryCode)
        console.log('recipient.countryCode: ', recipient.countryCode)
        
        //TODO: SE DEBE PROCESAR LOS XML DE UPS COLOMBIA
        // let ProvidersUPS = [];
        let jsonResUPS = [];
        let CostoProveedor = {}
        const QuotaUPS_XML = mustache.render(xmlQuotaUPS_Beta, dat);
        // console.log('QuotaUPS_XML: ', QuotaUPS_XML)
        try {
            return axios.post(url, QuotaUPS_XML, {}).then( async response => {
                const xmlResUPS = response.data;
                xml2js.parseString(xmlResUPS, (error, result) => {
                    if (error) {
                        loggers.error(`Error respuesta servicio CDR: ${error}`)
                        console.error(error);
                    } else {
                        jsonResUPS.push(result);                    
                    }
                });
                    
                if(jsonResUPS[0].RatingServiceSelectionResponse.RatedShipment == null){
                    let mensaje = jsonResUPS[0].RatingServiceSelectionResponse.Response[0].Error[0].ErrorDescription[0];
                    
                    applogger.info(`Info UPS_CO_NAT: ${mensaje}`);            
                    return ProvidersUPS.push(`Info UPS_CO_NAT: ${mensaje}`);
                }                

                const resp = jsonResUPS[0].RatingServiceSelectionResponse.RatedShipment[0];
                // console.log('Este campo contiene:', resp.NegotiatedRates[0].NetSummaryCharges[0].GrandTotal[0]);
                
                if (resp?.NegotiatedRates?. [0]?.NetSummaryCharges?. [0]?.GrandTotal?. [0]) {
                    // El campo existe y puedes acceder a él aquí
                    CostoProveedor = resp.NegotiatedRates[0].NetSummaryCharges[0].GrandTotal[0]

                } else {
                    // El campo no existe
                    CostoProveedor = resp.TransportationCharges[0]
                    console.log("El campo no existe.");
                }

                
                // console.log(resp.NegotiatedRates[0].NetSummaryCharges[0].GrandTotal[0]);
                const ServiceType = resp.Service[0].Code[0];
                const ProvicerDiscount = resp.TotalCharges[0];
                const Domestic = dat.Shipments.documentShipment
                const Weight = dat.Shipments.Shipment.Weight
                const shippingValue = CostoProveedor
                
                const SurchargePakki = await SurchargePakkiQuotationUPS(ServiceType,shippingValue,ProvicerDiscount,Domestic,Weight);
                
                const QuotationUPSDato = quotaXmlUPSDataBase(resp, bus, uid, dat,SurchargePakki);
                
                const saveUPSQuota = new quotations(QuotationUPSDato);

                saveUPSQuota.save();

                ProvidersUPS.push(await resXmlProUPS(resp,SurchargePakki));
                
                return ProvidersUPS;
                // return { ok: true, data: ProvidersUPS };
                
            }).catch(error => {
                console.log(error);
                // handleError(error, QuotaFDX, bus, uid);
                //return ProvidersFDX.push('Es Error UPS_CO_NAT');
                applogger.error(`Error UPS_CO_NAT ${error}`);            
                return ProvidersUPS.push(`Error UPS_CO_NAT ${error.message}`);
                // return { ok: false, data: ProvidersUPS.push(`Error UPS_CO_NAT ${error.message}`) };
            });
            
        } catch (error) {
            // console.log('Error de FDX US_NAT: ', error.response);
            // console.log('Error de UPS CO Destalle: ', error.response.data);
            // capturamos para enviar al front el error
            // Capturamos para enviar el error de Quotation a Mongo
            // handleError(error, QuotaFDX, bus, uid);
            loggers.error(`Error consumiendo servicio CDR: ${error}`)
            return ProvidersUPS.push(error.response);
            // return { ok: false, data: ProvidersUPS.push(error.response) };
        };

    } else if (shipper.countryCode !== "CO" && recipient.countryCode === "CO" ) {
        console.log('Entramos a UPS Importaciones')
        console.log('shipper.countryCode: ', shipper.countryCode)
        console.log('recipient.countryCode: ', recipient.countryCode)
        let CambioALbs = ''
        //TODO: SE DEBE PROCESAR LOS XML DE UPS COLOMBIA
        // let ProvidersUPS = [];
        let jsonResUPS = [];


        if (shipper.countryCode === "US") {            
            CambioALbs = dat.Shipments.Shipment.Weight * 2    
            dat.Shipments.Shipment.Weight = CambioALbs
        } else {
            CambioALbs = dat.Shipments.Shipment.Weight
        }


        const QuotaUPS_XML = mustache.render(xmlQuotaUPS_Import, dat);
        try {
            return axios.post(url, QuotaUPS_XML, {}).then( async response => {
                const xmlResUPS = response.data;
                xml2js.parseString(xmlResUPS, (error, result) => {
                    if (error) {
                        console.error(error);
                    } else {
                        jsonResUPS.push(result);                    
                    }
                });
    
                const resp = jsonResUPS[0].RatingServiceSelectionResponse.RatedShipment[0];
                
                // console.log(resp.NegotiatedRates[0].NetSummaryCharges[0].GrandTotal[0]);
                const ServiceType = resp.Service[0].Code[0];
                const ProvicerDiscount = resp.TotalCharges[0];
                const Domestic = dat.Shipments.documentShipment
                const Weight = dat.Shipments.Shipment.Weight
                const shippingValue = resp.NegotiatedRates[0].NetSummaryCharges[0].GrandTotal[0];
                
                const SurchargePakki = await SurchargePakkiQuotationUPS(ServiceType,shippingValue,ProvicerDiscount,Domestic,Weight);
                
                const QuotationUPSDato = quotaXmlUPSDataBase(resp, bus, uid, dat,SurchargePakki);
                
                const saveUPSQuota = new quotations(QuotationUPSDato);
                
                saveUPSQuota.save();

                
                ProvidersUPS.push(await resXmlProUPS(resp,SurchargePakki));
                
                
                return ProvidersUPS;
                
            }).catch(error => {
                console.log(error);
                return ProvidersFDX.push('Es Error UPS_CO_NAT');
            });
            
        } catch (error) {
            return ProvidersFDX.push(error.response);
        };

    } else {
        return {
            ok: true,
            msg: 'UPS -> (-1). Actualmente No contamos con cobertura para la ruta seleccionada'
        };
        // return ProvidersUPS.push('Actualmente No tenemos Convenio de Importacion con UPS');
        // return { ok: true, data: 'Actualmente No tenemos Convenio de Importacion con UPS' };
        // res.status(200).json({
        //     ok: true,
        //     msg: 'Actualmente No tenemos Convenio de Importacion con UPS'
        // });
    }
    // else if (shipper.countryCode === "US" && recipient.countryCode === "US") {
        
    //     // const url = 'https://onlinetools.ups.com/ship/v1/rating/Rate'; ENLACE USA

    //     headers = {
    //         'Username': 'pakkius',
    //         'content-type': 'application/json',
    //         'AccessLicenseNumber': 'ADC942222AC37A60',
    //         'transId': upsusId,
    //         'TransactionSrc': 'XOLT',
    //         'Password': 'JKm1lo6142!01',
    //     };

    //     for (let i = 0; i < servicesUPS_US.length; i++) { 
    //         const service = servicesUPS_US[i];
    //         const serviceType = Object.values(service)[0];
    //         const quot = getQuotaUPS(shipper, recipient, shipment, serviceType);
    //         // Enviamos al Array Cada paso para luego mover la info fuera del FOR
    //         QuotationsArray.push(quot);
    //     }

    //     // console.log(QuotationsArray[0]);
    //     // return QuotationsArray[0];

    //     try {
    //         const respon = await Promise.all(
    //             QuotationsArray.map(quotation =>
    //                 axios.post(url, quotation, { headers: headers })
    //             )
    //         );
            
    //         for (const response of respon) {
    //         const resp = response.data.RateResponse.RatedShipment;
    //         // hacer algo con cada respuesta
    //         // console.log('Tenemos un dato',resp.TotalCharges.MonetaryValue);
    //         const proUPS = new quotations(
    //             quotaJsonUPSDataBase(resp, bus, uid, dat)
    //         );
    //             //  console.log(proUPS);
    //         await proUPS.save();
    //         ProvidersUPS.push(resProUPS(resp));
    //         }
    //         return ProvidersUPS;

            
    //     } catch (error) {
    //         // console.log('Es Error 2: ', error.response.data.response);  
    //         // console.log('Error de UPS US_NAT: ', error.response.data);
    //         // console.log('Error de UPS US Destalle: ', error.response.data.response);
    //         // capturamos para enviar al front el error
    //         Providers.push('Es Error UPS_US_NAT');
    //         // Capturamos para enviar el error de Quotation a Mongo
    //         // handleError(error, QuotaFDX, bus, uid);
    //     }
        
    // } else if (shipper.countryCode === "US" ) {
        
    //     res.status(200).json({
    //         ok: true,
    //         msg: 'Aqui vamos con UPS Envios Internacional desde US'
    //     });

    // } 
    // else if (shipper.countryCode === "US" && recipient.countryCode === "CO") {
        
    //     res.status(200).json({
    //         ok: true,
    //         msg: 'Actualmente No tenemos Convenio de Importacion con UPS'
    //     });

    // }        
    
};

function getQuotaUPS(shipper, recipient, shipment,serviceType) {
    return {
        "RateRequest": {
            "Request": {
                "SubVersion": "1703",
                "TransactionReference": {
                    "CustomerContext": " "
                }
            },
            "Shipment": {
                "ShipmentRatingOptions": {
                    "UserLevelDiscountIndicator": "TRUE"
                },
                "Shipper": {
                    "Name": "Cristian Rodriguez",
                    "ShipperNumber": "7359XW",
                    "Address": {
                        "AddressLine": "Diag. 73 Sur # 78 i - 41",
                        "AddressLine2": "",
                        "AddressLine3": "",
                        "City": "BOGOTA",
                        "StateProvinceCode": "DC",
                        "PostalCode": "110741",
                        "CountryCode": "CO"
                    }
                },
                "ShipTo": {
                    "Name": "",
                    "Address": {
                        "AddressLine": "",
                        "AddressLine2": "",
                        "AddressLine3": "",
                        "City": recipient.city,
                        "StateProvinceCode": recipient.stateOrProvinceCod,
                        "PostalCode": recipient.postalCode,
                        "CountryCode": recipient.countryCode
                    }
                },
                "ShipFrom": {
                    "Name": "",
                    "Address": {
                        "AddressLine": "",
                        "AddressLine2": "",
                        "AddressLine3": "",
                        "City": shipper.city,
                        "StateProvinceCode": shipper.stateOrProvinceCod,
                        "PostalCode": shipper.postalCode,
                        "CountryCode": shipper.countryCode
                    }
                },
                "Service": {
                    "Code": "02",
                    "Description": "2nd Day Air"
                },
                "ShipmentTotalWeight": {
                    "UnitOfMeasurement": {
                        "Code": shipment.weightUnit,
                        "Description": "Kilos"
                    },
                    "Weight": shipment.weight
                },
                "Package": {
                    "PackagingType": {
                        "Code": "01",
                        "Description": "UPS Letter"
                    },
                    "Dimensions": {
                        "UnitOfMeasurement": {
                            "Code": "IN"
                        },
                        "Length": "1",
                        "Width": "1",
                        "Height": "1"
                    },
                    "PackageWeight": {
                        "UnitOfMeasurement": {
                            "Code": "LBS"
                        },
                        "Weight": "1"
                    },
                    "residentialIndicator": "02"
                }
            }
        }
    };
}


module.exports = {
    quotaUPS,
};

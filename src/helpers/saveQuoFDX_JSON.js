const TokensAuth = require('../models/tokensAuth');
const quotations = require('../models/quotations');
const axios = require('axios');
const Mustache = require('mustache');

const jsonxml = require('jsonxml');
const uuid = require('uuid');
const { DateTime } = require('luxon');
const { QuotaFDX_IE, QuotaFDX_IP, resProFDX, quotaJsonFDXDataBase } = require('../structures/xml/quotaFDX');
const { SurchargePakkiFDX, SurchargePakkiDomesticFDX } = require('./companySurcharges');
const { FDX_ACCOUNT_CO, API_FDX_QTS } = require('../utils/config');
const { applogger } = require('../utils/logger');

// Creating a date time object
const date = DateTime.local().toISODate();
// Genera un UUID v4 (basado en números aleatorios)
const id = uuid.v4();
// Agrega el prefijo "fdxco" al UUID
const fdxcoId = `fdxco-${id}`;
const fdxusId = `fdxus-${id}`;
// global.QuotationsArray = [];
// global.ProvidersFDX = [];

async function quotaFDX(shipper, recipient, company, shipment, dat) {
    const fdxcoId = `fdxco-${id}`;
    const fdxusId = `fdxus-${id}`;
    
    const accountNumber = FDX_ACCOUNT_CO //"740561073" //Reggaly Produccion: "203128530"; //Reggaly SANCBOX "740561073"
    
    const url = API_FDX_QTS

    const servicesFDX_CO_INT = [
        { "service1": "FEDEX_INTERNATIONAL_PRIORITY" },
        { "service2": "INTERNATIONAL_ECONOMY" },
        // { "service3": "FEDEX_INTERNATIONAL_PRIORITY_EXPRESS" },
    ];
    const servicesFDX_CO_NAT = [
        { "service5": "STANDARD_OVERNIGHT" },
        // { "service4": "FEDEX_EXPRESS_SAVER" },
        // { "service4": "PRIORITY_OVERNIGHT" },
    ];
    
    // VALIDAMOS SEGUN EL PESO Y EL PESO VOLUMETRICO PARA DETERMINAR EL TIPO DE EMPAQUE
    let pkgType = '';
    const { Weight, Length, Width, Height } = dat.Shipments.Shipment;
    const volumetricWeight = ((Length * Weight * Height) / 5000);


  if (Weight === 0.5 && volumetricWeight <= 0.5 && shipment.documentShipment) {
      pkgType = "FEDEX_ENVELOPE";
  } else if ((Weight >= 0.5 && Weight <= 2) || (volumetricWeight >= 0.5 && volumetricWeight <= 2)) {
      pkgType = "FEDEX_PAK";
  } else if ((Weight >= 2.5 && Weight <= 3.5) || (volumetricWeight >= 2.5 && volumetricWeight <= 3.5)) {
      pkgType = "FEDEX_BOX";
  } else if ((Weight >= 4 && Weight <= 9) || (volumetricWeight >= 4 && volumetricWeight <= 9)) {
      pkgType = "FEDEX_TUBE";
  } else if ((Weight >= 9.5) || (volumetricWeight >= 9.5)) {
      pkgType = "YOUR_PACKAGING";
  } else {
      pkgType = "YOUR_PACKAGING";
  }
    shipment.packagingType = pkgType;
    QuotationsArray = [];
    // console.log(getQuotaFDX);
    // Para estos Paises modificamos la variable para este proveedor.
    if (dat.Destination.CountryCode === "GB" || dat.Destination.CountryCode === "CN" || dat.Destination.CountryCode === "AR") {
        dat.Destination.StateCode = ""
    }

    if (dat.Shipments.Shipment === true) {
        shipment.description = 'Documentos'
    } else {
        shipment.description = 'Paquete'
    }

    if (shipper.countryCode === "CO" && recipient.countryCode === "CO") { 

        if (Weight === 0.5 && volumetricWeight <= 0.5 && shipment.documentShipment) {
            pkgType = "FEDEX_ENVELOPE";
        } else if ((Weight >= 0.5 && Weight <= 2) || (volumetricWeight >= 0.5 && volumetricWeight <= 2)) {
            pkgType = "YOUR_PACKAGING";
        } else if ((Weight >= 2.5 && Weight <= 3.5) || (volumetricWeight >= 2.5 && volumetricWeight <= 3.5)) {
            pkgType = "YOUR_PACKAGING";
        } else if ((Weight >= 4 && Weight <= 9) || (volumetricWeight >= 4 && volumetricWeight <= 9)) {
            pkgType = "YOUR_PACKAGING";
        } else if ((Weight >= 9.5) || (volumetricWeight >= 9.5)) {
            pkgType = "YOUR_PACKAGING";
        } else {
            pkgType = "YOUR_PACKAGING";
        }
        shipment.packagingType = pkgType;
               
        let QuotationsArray = [];

        const TknFdxCO = await TokensAuth.findOne({
                "provider.envPrefix": "FDX_CO"
            }, {
                "provider.access_token": 1,
                "provider.timestamp": 1,
                _id: 0
            })
            .sort({
                "provider.timestamp": -1
            }).limit(1);

        // console.log('TknFdxCO: ', TknFdxCO)

        headers = {
            'content-type': 'application/json',
            'x-customer-transaction-id': fdxcoId,
            'x-locale': 'es_CO',
            'Authorization': `bearer ${TknFdxCO.provider.access_token}`,
        };

        for (let i = 0; i < servicesFDX_CO_NAT.length; i++) {
            const service = servicesFDX_CO_NAT[i];
            const serviceType = Object.values(service)[0];
            const quot = getQuotaFDX(accountNumber, shipper, recipient, shipment, serviceType);
            QuotationsArray.push(quot);
        }

        try {
            let ProvidersFDX = [];
            let concultaFDX = {
                headers: headers,
                data: QuotationsArray
            }
            let exchangeRate = ''
            // console.log('concultaFDX: ', concultaFDX)
            const respon = await axios.post(url, concultaFDX)
            // console.log('Respuesta de FDX: ', respon)
            
            const promises = respon.data.msg.map(async (response) => {
                // console.log('Respuesta de FDX: ', response)
                if (response.status !== 200) {
                    return {
                        ok: false,
                        msg: 'Error Retorno FDX: ' + response.data
                    };
                } else {
                    const resp = response.data.output.rateReplyDetails[0];
                    // console.log('resp.serviceType: ', resp.serviceType)

                    const ServiceType = resp.serviceType;
                    const serviceName = resp.serviceType;
                    const packagingType = resp.packagingType;
                    const ProvicerDiscount = "74";
                    if (resp.serviceType === "STANDARD_OVERNIGHT" || resp.serviceType === "FEDEX_EXPRESS_SAVER") {
                         exchangeRate = ''
                    } else {
                        exchangeRate = resp.ratedShipmentDetails[0].shipmentRateDetail.currencyExchangeRate.rate;                        
                    }
                    
                    const Domestic = dat.Shipments.documentShipment;
                    const Weight = dat.Shipments.Shipment.Weight;
                    const shippingValue = resp.ratedShipmentDetails[0].totalNetCharge;
                    const arrivalDate = resp.operationalDetail.deliveryDate;

                    const SurchargePakki = await SurchargePakkiFDX(ServiceType, ProvicerDiscount, exchangeRate, shippingValue, Domestic, Weight);

                    const proFDX = new quotations(
                        quotaJsonFDXDataBase(arrivalDate, company, dat, SurchargePakki)
                    );

                    const FdxDB = await proFDX.save();
                    const resProFDXDB = await resProFDX(ServiceType, serviceName, packagingType, arrivalDate, SurchargePakki);
                    ProvidersFDX.push(resProFDXDB);
                    
                }
            });

            await Promise.all(promises);

            // console.log('ProvidersFDX: ', ProvidersFDX)

            return ProvidersFDX;

        } catch (error) {
            applogger.error(`Error consumiendo servicio FDX: ${error}`)
            console.log('Error de FDX CO Destalle: ', error);
            return {
                ok: false,
                msg: `FDX -> Error consumiendo servicio FDX: ${error}`
            };
        }
    } else if ((shipper.countryCode === "CO" && recipient.countryCode !== "CO") || (shipper.countryCode !== "CO" && recipient.countryCode === "CO" ) ) {
        
        
        let QuotationsArray = [];
        
        const TknFdxCO = await TokensAuth.findOne({ "provider.envPrefix": "FDX_CO" },
            { "provider.access_token": 1,"provider.timestamp": 1,_id:0 })
            .sort({ "provider.timestamp": -1 }).limit(1);
    
        // console.log('TknFdxCO: ', TknFdxCO)
        
        headers = {
            'content-type': 'application/json',
            'x-customer-transaction-id': fdxcoId,
            'x-locale': 'es_CO',
            'Authorization': `bearer ${TknFdxCO.provider.access_token}`,
        };

        for (let i = 0; i < servicesFDX_CO_INT.length; i++) { 
            const service = servicesFDX_CO_INT[i];
            const serviceType = Object.values(service)[0];
            const quot = getQuotaFDX(accountNumber, shipper, recipient, shipment, serviceType);
            QuotationsArray.push(quot);
        }

        try {
            let ProvidersFDX = [];  
            let concultaFDX = {
                headers: headers,
                data: QuotationsArray
            }
            // console.log('concultaFDX: ', concultaFDX)
            const respon = await axios.post(url, concultaFDX)
            
            const promises = respon.data.msg.map(async (response) => {
                if (response.status !== 200) {
                    if(response.data.errors != null)
                    {
                        applogger.error(`Error Retorno FDX: ${response.data.errors[0].code}; Mensaje: ${response.data.errors[0].message}`);
                    }
                    else{
                        applogger.error(`Error Retorno FDX: ${response.data.error}; Mensaje: ${response.data.error_description}`);
                    }
                    return {
                        ok: false,
                        msg: 'Error Retorno FDX: ' + response.data
                    };
                } else {
                    const resp = response.data.output.rateReplyDetails[0];
                    // console.log('resp.serviceType: ', resp.serviceType)
                    const ServiceType = resp.serviceType;
                    const serviceName = resp.serviceType;
                    const packagingType = resp.packagingType;
                    const ProvicerDiscount = "74";
                    const exchangeRate = resp.ratedShipmentDetails[0].shipmentRateDetail.currencyExchangeRate.rate;
                    const Domestic = dat.Shipments.documentShipment;
                    const Weight = dat.Shipments.Shipment.Weight;
                    const shippingValue = resp.ratedShipmentDetails[0].totalNetCharge;
                    const arrivalDate = resp.operationalDetail.deliveryDate;

                    const SurchargePakki = await SurchargePakkiFDX(ServiceType, ProvicerDiscount, exchangeRate, shippingValue, Domestic, Weight);

                    const proFDX = new quotations(
                        quotaJsonFDXDataBase(arrivalDate, company, dat, SurchargePakki)
                    );

                    const FdxDB = await proFDX.save();
                    const resProFDXDB = await resProFDX(ServiceType, serviceName, packagingType, arrivalDate, SurchargePakki);
                    ProvidersFDX.push(resProFDXDB);
                }
            });

            await Promise.all(promises);
            
            return ProvidersFDX;    
            
        } catch (error) {
            applogger.error(`Error consumo servicio FDX: ${error}`)
            console.log('Error de FDX CO Destalle: ', error);
            return {
                ok: false,
                msg: `FDX -> Error consumiendo servicio FDX: ${error}`
            };
        }

    } else if (shipper.countryCode === "US" && recipient.countryCode === "US" ) {
             
        // const TknFdxUS = await TokensAuth.findOne({ "provider.envPrefix": "FDX_US" },
        //     { "provider.access_token": 1,"provider.timestamp": 1,_id:0 })
        //     .sort({ "provider.timestamp": -1 }).limit(1);
        
        // headers = {
        //     'content-type': 'application/json',
        //     'x-customer-transaction-id': fdxusId,
        //     'x-locale': 'es_US',
        //     'Authorization': `Bearer ${TknFdxUS.provider.access_token}`,
        // };
        // // console.log(servicesFDX_US_NAT.length);
        // // recorremos 2 de los servicios para optimizar el codigo,
        // // Si se requiere mas servicio aumentar segun el array de Servicios 
        // for (let i = 0; i < servicesFDX_US_NAT.length; i++) { 
        //     const service = servicesFDX_US_NAT[i];
        //     const serviceType = Object.values(service)[0];
        //     const quot = getQuotaFDX(accountNumber, shipper, recipient, shipment, serviceType);
        //     // Enviamos al Array Cada paso para luego mover la info fuera del FOR
        //     QuotationsArray.push(quot);
        // }
        // try {
        //     let ProvidersFDX= [];
        //     const respon = await Promise.all(
        //         QuotationsArray.map(quotation =>
        //             axios.post(url, quotation, { headers: headers })
        //         )
        //     );

        //     for (const response of respon) {
        //         const resp = response.data.output.rateReplyDetails;
        //         // console.log(resp[0].commit.dateDetail.dayFormat);
        //     const proFDX_IP = new quotations(
        //         quotaJsonFDXDataBase(resp, company, dat, SurchargePakki)
        //     );
        //     await proFDX_IP.save();
                
        //     ProvidersFDX.push(resProFDX(resp));
        //     }
        //     return ProvidersFDX;
        // } catch (error) {
        //     // console.log('Error de FDX US_NAT: ', error.response);
        //     // console.log('Error de FDX US Destalle: ', error.response.data);
        //     await handleError(error, QuotaFDX, bus, uid);
        //     const fallaFDX = await ProvidersFDX.push('Es Error FDX_US_NAT');
        //     return fallaFDX[0];
        // }
        
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

function getQuotaFDX(accountNumber, shipper, recipient, shipment, serviceType) {
    return {
        "accountNumber": {
            "value": accountNumber
        },
        "rateRequestControlParameters": {
            "returnTransitTimes": true,
            "servicesNeededOnRateFailure": true,
            "rateSortOrder": "SERVICENAMETRADITIONAL"
        },
        "requestedShipment": {
            "shipper": {
                "address": {
                    "city": shipper.city,
                    "stateOrProvinceCode": shipper.stateOrProvinceCode,
                    "postalCode": shipper.postalCode,
                    "countryCode": shipper.countryCode
                }
            },
            "recipient": {
                "address": {
                    "city": recipient.city,
                    "stateOrProvinceCode": recipient.stateOrProvinceCode,
                    "postalCode": recipient.postalCode,
                    "countryCode": recipient.countryCode
                }
            },
            "shipDateStamp": date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
            "pickupType": "DROPOFF_AT_FEDEX_LOCATION",
            "serviceType": serviceType,
            "preferredCurrency": shipment.insuranceCurrency,
            "rateRequestType": [
                "LIST",
                "ACCOUNT"
            ],
            "customsClearanceDetail": {
                "dutiesPayment": {
                    "paymentType": "SENDER",
                    "payor": {
                        "responsibleParty": null
                    }
                },
                "commodities": [{
                    "description": shipment.description,
                    "quantity": 1,
                    "quantityUnits": "PCS",
                    "weight": {
                        "units": shipment.weightUnit,
                        "value": shipment.weight
                    },
                    "customsValue": {
                        "amount": 100,
                        "currency": shipment.insuranceCurrency
                    }
                }]
            },
            "requestedPackageLineItems": [{
                "declaredValue": {
                    "amount": 100,
                    "currency": shipment.insuranceCurrency
                },
                "weight": {
                    "units": shipment.weightUnit,
                    "value": shipment.weight
                },
                "dimensions": {
                    "length": shipment.length,
                    "width": shipment.width,
                    "height": shipment.height,
                    "units": "CM"
                },
                "variableHandlingChargeDetail": {
                    "rateType": "ACCOUNT",
                    "percentValue": 50
                }
            }],
            "packagingType": shipment.packagingType,
            "totalPackageCount": 1,
            "carrierCodes": [
                "FDXE"
            ]
        }
    };
}
function getQuotaDomesticFDX(accountNumber, shipper, recipient, shipment, serviceType) {
    return {
            "accountNumber": {
                "value": accountNumber
            },
            "requestedShipment": {
                "shipper": {
                    "address": {
                        "city": shipper.city,
                        "stateOrProvinceCode": shipper.stateOrProvinceCode,
                        "postalCode": shipper.postalCode,
                        "countryCode": shipper.countryCode
                    }
                },
                "recipient": {
                    "address": {
                        "city": recipient.city,
                        "stateOrProvinceCode": recipient.stateOrProvinceCode,
                        "postalCode": recipient.postalCode,
                        "countryCode": recipient.countryCode
                    }
                },
                "shipDateStamp": date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
                "pickupType": "DROPOFF_AT_FEDEX_LOCATION",
                "serviceType": serviceType,
                "preferredCurrency": shipment.insuranceCurrency,
                "rateRequestType": [
                    "LIST",
                    "ACCOUNT"
                ],
                "requestedPackageLineItems": [{
                    "weight": {
                        "units": shipment.weightUnit,
                        "value": shipment.weight
                    },
                    "dimensions": {
                        "length": shipment.length,
                        "width": shipment.width,
                        "height": shipment.height,
                        "units": "CM"
                    },
                    "variableHandlingChargeDetail": {
                        "rateType": "ACCOUNT",
                        "percentValue": 60
                    }
                }]
        }
    };
}


function handleError(error, location, bus, uid) {
  let typeError = '';
  let msgError = {};
  if (error instanceof ReferenceError) {
    typeError = 'ReferenceError';
    msgError = error.message;
  } else if (error instanceof TypeError) {
    typeError = 'TypeError';
    msgError = error.message;
  } else {
    typeError = 'General';
    msgError = error.response.data;
  }

  function typeErrorMsg(bus, provides, typeError, er, location) {
    return new Promise((resolve, reject) => {
      const MSG_ERROR = {
        business: {
          business: bus,
          collaborator: uid
        },
        "err.provides": provides,
        "err.typeError": typeError,
        "err.er": er,
        "location": location
      };
      quotations.create(MSG_ERROR, function (err, res) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
        //   console.log(res);
          resolve(res);
        }
      });
    });
  }

  const MSG_ERROR = typeErrorMsg(bus, 'Es Error FDX_CO', typeError, msgError, location);

  return {
    typeError: typeError,
    msgError: msgError,
    FDX_ERROR: MSG_ERROR,
  };
}

module.exports = {
    quotaFDX,
};



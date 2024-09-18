const { response } = require('express');
const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');
const { applogger } = require('../utils/logger');

const quotations = require('../models/quotations');
const Danecodes = require('../models/daneCode');

const { DateTime } = require('luxon');

const uuid = require('uuid');
const { QuotaXmlCDR, quotaJsonCDRDataBase, resProCDR } = require('../structures/xml/quotaCDR');
const { SurchargePakkiDomesticCDR } = require('./companySurcharges');
const { DaneCodeCity } = require('./DaneCodeCity');
const { CDR_QUOTATION_URL } = require('../utils/config');
const { loggers } = require('winston');

global.QuotationsArray = [];
global.ProvidersCDR = [];
global.jsonResCDR = [];

async function quotaCDR(shipper, recipient, bus, uid, shipment, dat) {
    
    //TODO: AQUI VA LOS XML DE LOS PROVEEDORES EN COLOMBIA
    // const url = 'https://ws.coordinadora.com/ags/1.5/server.php';
    const url = CDR_QUOTATION_URL

  if (shipper.countryCode === "CO" && recipient.countryCode === "CO") {
      
    const daneCode = await DaneCodeCity(dat.Origin.CityName, dat.Destination.CityName)
    dat.Origin.DANECode = daneCode.origin;
    dat.Destination.DANECode = daneCode.destination;

//TODO: debemos realizar busqueda de los nombre de las Ciudades para agregar el DaneCode
      
    const QuotaCDR_XML = mustache.render(QuotaXmlCDR, dat);

    axios.interceptors.response.use(response => response, error => {
      return Promise.reject(error);
    });

    const headers = [];
    ProvidersCDR = [];
    jsonResCDR = [];

    try {
      return axios.post(url, QuotaCDR_XML, { headers: headers })
        .then(async response => {
          const xmlResCDR = response.data;
          // console.log('xmlResCDR: ',xmlResCDR)
          xml2js.parseString(xmlResCDR, (error, result) => {
            if (error) {
                applogger.error(`Error respuesta servicio CRD: ${error}`)
                console.error(error);
            } else {
                jsonResCDR.push(result);
            }
          });
          
          const rep = jsonResCDR[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:Cotizador_cotizarResponse'][0];
          
          const resp = rep.Cotizador_cotizarResult[0];

          const shippingValue = resp.flete_total[0];
          const Weight = dat.Shipments.Shipment.Weight;

          const SurchargePakki = await SurchargePakkiDomesticCDR(shippingValue,Weight);


          const saveCDRQuota = new quotations(
            quotaJsonCDRDataBase(resp, bus, uid, dat,SurchargePakki)
          );
          
          saveCDRQuota.save();

          ProvidersCDR.push(resProCDR(resp,dat));

          return ProvidersCDR;

      }).catch(error => {
        applogger.error(`CDR -> Error al consultar la cotizacion: ${error}`)
        // console.log(`CDR -> Error al consultar la cotizacion: ${error}`);
        // handleError(error, QuotaFDX, bus, uid);
        // return ProvidersCDR.push('Es Error CDR_CO_NAT');
        return {
          ok: true,
          msg: `CDR -> Error al consultar la cotizacion: ${error}`
        };
          
      });        
    } catch (error) {
          // console.log('Error de FDX US_NAT: ', error.response);
          // console.log('Error de UPS CO Destalle: ', error.response.data);
        // capturamos para enviar al front el error
        // Capturamos para enviar el error de Quotation a Mongo
        // handleError(error, bus, uid);
        applogger.error(`CDR -> Error al consultar la cotizacion: ${error}`)
        // return ProvidersCDR.push('Es Error CDR_CO_NAT');
        return {
          ok: true,
          msg: `CDR -> Error al consultar la cotizacion: ${error}`
        };
    }
  } 
}

// function quotaJsonCDRDataBase(resp, bus, uid, dat) {
//     return {
//         business: {
//             business: bus,
//             collaborator: uid
//         },
//         origin: {
//             cityName: dat.Origin.CityName,
//             postalCode: dat.Origin.PostalCode,
//             countryCode: dat.Origin.CountryCode,
//         },
//         destination: {
//             cityName: dat.Destination.CityName,
//             postalCode: dat.Destination.PostalCode,
//             countryCode: dat.Destination.CountryCode,
//         },
//         shipment: {
//             weightUnit: dat.Shipments.Shipment.WeightUnit,
//             weigh: dat.Shipments.Shipment.Weight,
//             length: dat.Shipments.Shipment.Length,
//             width: dat.Shipments.Shipment.Width,
//             height: dat.Shipments.Shipment.Height,
//         },
//         provider: {
//             partner: "CDR",
//             service: 'Servicio Nacional Coordinadora',
//             arrivalDate: calcularFecha(resp.dias_entrega[0]),
//             arrivalTime: '23:59:00',
//             shippingCurrency: 'COP',
//             shippingValue: resp.flete_total[0],
//         }
//     };
// }
// function resProCDR(resp,dat) {
//     return {
//         provider: "CDR",
//         serviceType: resp.producto[0],
//         serviceName: 'Servicio Nacional Coordinadora',
//         packagingType: dat.Shipments.packagingTypeDHL,
//         deliveryDate:  calcularFecha(resp.dias_entrega[0]),
//         totalNetFedExCharge: resp.flete_total[0]
//     };
// }
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
          console.log(res);
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
    quotaCDR,
};

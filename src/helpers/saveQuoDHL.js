const { response } = require('express');
const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');
const { QuotaXmlDHL, handleError, quotaJsonUPSDataBase, resProDHL, QuotaXmlDHL_Import } = require('../structures/xml/quotaDHL');
const quotations = require('../models/quotations');
const { SurchargePakkiDHL } = require('./companySurcharges');
const { DHL_QUOTATION_URL } = require('../utils/config');
const { applogger } = require('../utils/logger');

global.QuotationsArray = [];
// global.ProvidersDHL = [];
// global.jsonResDHL = [];



async function quotaDHL(shipper, recipient, bus, uid, shipment, dat) {
    
    //TODO: AQUI VA LOS XML DE LOS PROVEEDORES EN COLOMBIA
    // const url = 'https://xmlpi-ea.dhl.com/XMLShippingServlet'; //PRODUCCION
  // const url = 'https://xmlpitest-ea.dhl.com/XMLShippingServlet'; // SANDBOX
  const url = DHL_QUOTATION_URL

    if (shipper.countryCode === "CO" && recipient.countryCode !== "CO") {
      let ProvidersDHL= [];
      let jsonResDHL = [];
      const Domestic = dat.Shipments.documentShipment

      if (Domestic) {
        dat.Shipments.IsDutiable = "N";
        dat.Shipments.packagingTypeDHL = "D";
      } else {
        dat.Shipments.IsDutiable = "Y";
        dat.Shipments.packagingTypeDHL = "P";
      }
      
      // console.log(dat)

      const QuotaDHL_XML = mustache.render(QuotaXmlDHL, dat);
      try {
        return axios.post(url, QuotaDHL_XML, {}).then(async response => {
          const xmlResDHL = response.data
          xml2js.parseString(xmlResDHL, (error, result) => {        
              if (error) {
                  loggers.error(`Error respuesta servicio DHL: ${error}`)
                  console.error(error);
              } else {
                  jsonResDHL.push(result);
              }
          });

          const resp = jsonResDHL[0]['res:DCTResponse'].GetQuoteResponse[0];
          if (resp.Note) {
            // La respuesta contiene un elemento "Note", lo que indica un error
            const errorCode = resp.Note[0].Condition[0].ConditionCode[0];
            const errorMessage = resp.Note[0].Condition[0].ConditionData[0];
            
            return (`Error en la respuesta DHL MSG:${errorMessage} COD: ${errorCode}`);
          } else {
    
              const ServiceType = resp.BkgDetails[0].QtdShp[0].ProductShortName[0]
              
              const Weight = dat.Shipments.Shipment.Weight
              const shippingValue = resp.BkgDetails[0].QtdShp[0].ShippingCharge[0];
    
            const SurchargePakki = await SurchargePakkiDHL(ServiceType,shippingValue,Domestic,Weight);
            
            const saveDHLQuota = new quotations(
                quotaJsonUPSDataBase(resp, bus, uid, dat, SurchargePakki )
              );
    
            saveDHLQuota.save();
            ProvidersDHL.push(resProDHL(resp,dat,SurchargePakki));
            return ProvidersDHL;
          }           
                
        }).catch(error => {
            loggers.error(`Error consumiendo servicio DHL: ${error}`)
            console.log(error);
            return ProvidersDHL.push('Es Error DHL_INTER Fecha menor a la Actual ' + error);
        }); 
          
      } catch (error) {
          loggers.error(`Error consumiendo servicio DHL: ${error}`)
          handleError(error, QuotaFDX, bus, uid);
          return ProvidersDHL.push('Es Error DHL_CO_INT');
      }
    } else if (shipper.countryCode === "US" && recipient.countryCode === "US") {
        return {
            msg: 'Aqui vamos con DHL Envios Nacionales desde US'
        };
        
    } else if (shipper.countryCode !== "CO" && recipient.countryCode === "CO") {
      let ProvidersDHL = [];
      let jsonResDHL = [];
      const Domestic = dat.Shipments.documentShipment

      if (Domestic) {
        dat.Shipments.IsDutiable = "N";
        dat.Shipments.packagingTypeDHL = "D";
      } else {
        dat.Shipments.IsDutiable = "Y";
        dat.Shipments.packagingTypeDHL = "P";
      }

      const QuotaDHL_XML = mustache.render(QuotaXmlDHL_Import, dat);
      try {
        return axios.post(url, QuotaDHL_XML, {})
          .then(async response => {
            const xmlResDHL = response.data

            xml2js.parseString(xmlResDHL, (error, result) => {

              if (error) {
                console.error(error);
              } else {
                jsonResDHL.push(result);
              }
            });

            const resp = jsonResDHL[0]['res:DCTResponse'].GetQuoteResponse[0];
            // console.log('resp: ', resp)
            if (resp.Note) {
              // La respuesta contiene un elemento "Note", lo que indica un error
              const errorCode = resp.Note[0].Condition[0].ConditionCode[0];
              const errorMessage = resp.Note[0].Condition[0].ConditionData[0];

              // Puedes manejar el error según tus necesidades, por ejemplo, lanzar una excepción
              return (`Error en la respuesta DHL MSG:${errorMessage} COD: ${errorCode}`);
            } else {
              // console.log(resp.BkgDetails[0].QtdShp[0]);

              const ServiceType = resp.BkgDetails[0].QtdShp[0].ProductShortName[0]

              const Weight = dat.Shipments.Shipment.Weight
              // const ProvicerDiscount = resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].EffectiveNetDiscount[0];
              // const exchangeRate = resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].ShipmentRateDetail[0].CurrencyExchangeRate[0];
              const shippingValue = resp.BkgDetails[0].QtdShp[0].ShippingCharge[0];

              const SurchargePakki = await SurchargePakkiDHL(ServiceType, shippingValue, Domestic, Weight);

              const saveDHLQuota = new quotations(
                quotaJsonUPSDataBase(resp, bus, uid, dat, SurchargePakki)
              );

              saveDHLQuota.save();
              ProvidersDHL.push(resProDHL(resp, dat, SurchargePakki));
              return ProvidersDHL;
            }

          }).catch(error => {
            console.log(error);
            // handleError(error, QuotaFDX, bus, uid);
            return ProvidersDHL.push('Es Error DHL_INTER Fecha menor a la Actual ' + error);
          });

      } catch (error) {
        // console.log('Error de FDX US_NAT: ', error.response);
        // console.log('Error de UPS CO Destalle: ', error.response.data);
        // capturamos para enviar al front el error
        // Capturamos para enviar el error de Quotation a Mongo
        handleError(error, QuotaFDX, bus, uid);
        return ProvidersDHL.push('Es Error DHL_CO_INT');
      } 
    } else{
      return {
        ok: true,
        msg: 'DHL -> (-1). Actualmente No contamos con cobertura para la ruta seleccionada'
      };
    }
}

module.exports = {
    quotaDHL,
};

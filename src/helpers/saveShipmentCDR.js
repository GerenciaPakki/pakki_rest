const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');
const { DateTime } = require('luxon');



const shipments = require('../models/shipments');
const { ShipXml_1_CDR, ShipXml_2_CDR, ShipXml_3_CDR } = require('../structures/xsl/shipCDR');
const { CDR_GUIA_URL, CDR_ACCEPT_URL } = require('../utils/config');

// Creating a date time object
const date = DateTime.local().toISODate();
// const url = 'https://guias.coordinadora.com/ws/guias/1.6/server.php';  // PRODUCCION
// const url = 'https://sandbox.coordinadora.com/agw/ws/guias/1.6/server.php'; // SANDBOX
const url = CDR_GUIA_URL
const url2 = CDR_ACCEPT_URL

global.jsonCDR = [];


async function REQ_1_ShipmentCDR(dat) { 
  let jsonResCDR = [];
  const ShipCDR_XML = mustache.render(ShipXml_1_CDR, dat);
  // console.log('ShipCDR_XML: ',ShipCDR_XML)
  
  return axios.post(url, ShipCDR_XML, {})
  .then(response => {
    const xmlResCDR = response.data;
    // console.log('xmlResCDR:',xmlResCDR);
        xml2js.parseString(xmlResCDR, (error, result) => {
          if (error) {
              console.error(error);
          } else {
              jsonResCDR.push(result);  
          }
        });

        const resp = jsonResCDR[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:Guias_generarGuiaResponse'][0].return[0];

        return dataLabel = {
          ShipmentCode: resp.codigo_remision[0]._
        };

      }).catch(error => {
        return {
            error: 'Error CDR_CO Generar Guia: SaveShipmentCDR01',
            msg: error.response
        };
      });

}

async function REQ_2_ShipmentCDR(req2CDR) { 
  let jsonResCDR = [];
  const Ship3CDR_XML = mustache.render(ShipXml_2_CDR, req2CDR);
  // console.log('Ship3CDR_XML: ',Ship3CDR_XML)

  return axios.post(url, Ship3CDR_XML, {})
  .then(response => {
    const xmlResCDR = response.data;
    // console.log(xmlResCDR);
    xml2js.parseString(xmlResCDR, (error, result) => {
      if (error) {
          console.error(error);
      } else {
          jsonResCDR.push(result);                    
      }
    });

    const resp = jsonResCDR[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:Guias_imprimirRotulosResponse'][0].return[0];

    const dataLabel = {
      rotulos: resp.rotulos[0]._
    };
    
    return dataLabel;

  }).catch(error => {
    return {
        error: 'Error CDR_CO Pickup: SaveShipmentUPS03',
        msg: error
    };
  });
}

async function REQ_3_ShipmentCDR(dat) { 
  let jsonResCDR = [];
  let jsonCDR = [];
  const Ship3CDR_XML = mustache.render(ShipXml_3_CDR, dat);
  // console.log('Ship3CDR_XML: ', Ship3CDR_XML)  
  
  return axios.post(url2, Ship3CDR_XML, {})
  .then(response => {
    const xmlResCDR = response.data;
    // console.log('xmlResCDR:',xmlResCDR)
    xml2js.parseString(xmlResCDR, (error, result) => {
      if (error) {
          console.error(error);
      } else {
          jsonResCDR.push(result);                    
      }
    });

    const resp = jsonResCDR[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:Recogidas_programarResponse']
    // console.log(resp[0].Recogidas_programarResult[0].mensaje[0])
    const dataLabel = {
      rotulos: resp[0].Recogidas_programarResult[0].mensaje[0]
    };
    
    return dataLabel;

  }).catch(error => {
    const errorData = error.response.data
    // Utilizamos una expresión regular para extraer el número después de "id:"
    const idMatch = errorData.match(/id: (\d+)/);
    if (idMatch) {
      const idValue = idMatch[1];
      const dataLabel = {
        rotulos: 'Ya cuenta con una recogida registrada con el ID: ' + idValue 
      };
      return dataLabel
    } 
  })
}




module.exports = {
  REQ_1_ShipmentCDR,
  REQ_2_ShipmentCDR,
  REQ_3_ShipmentCDR,
};
const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');
const builder = require('xmlbuilder');
const parser = require('xml2js').parseString;
const { DateTime } = require('luxon');

const { DHL_URL } = require('../utils/config');

const builde = new xml2js.Builder();

const { ShipXmlDHL, ShipmentDBDHL, ShipPickupXmlDHL, ShipXmlPKGDHL, ShipXmlDHL_IMPORT } = require('../structures/xml/shipDHL');

// const url = 'https://onlinetools.DHL.com/DHL.app/xml/ShipAccept'; //PRODUCCION
// const url = 'https://xmlpitest-ea.dhl.com/XMLShippingServlet'; // SANDBOX
  const url = DHL_URL


async function REQ_1_ShipmentDHL( dat ) {     
    let jsonResDHL = [];
    let ShipDHL_XML = '';
  let xmlResDHL = '';
  let resp = '';
  
  ShipDHL_XML = mustache.render(ShipXmlDHL, dat)

    return axios.post(url, ShipDHL_XML, {})
      .then(response => {
        xmlResDHL = response.data
        xml2js.parseString(xmlResDHL, (error, result) => {
          if (error) {
              console.error(error);
          } else {
              jsonResDHL.push(result);                    
          }
        });
        // const resp = jsonResDHL[0]['res:ErrorResponse'].Response[0].Status[0];
        resp = jsonResDHL[0]['res:ShipmentResponse']        
        return resp;

      }).catch(error => {
        // console.log('Error de DHL CO_INT: ', error.response);
        // console.log('Error de DHL CO Destalle: ', error);        
        return {
            error: 'Error DHL_CO Generar Guia: SaveShipmentDHL01',
            msg: error.response
        };          
        
      });

}
async function REQ_1_ShipmentDHL_IMPORT( dat ) {     
    let jsonResDHL = [];
    let ShipDHL_XML = '';
  let xmlResDHL = '';
  let resp = '';
  
  ShipDHL_XML = mustache.render(ShipXmlDHL_IMPORT, dat)

    return axios.post(url, ShipDHL_XML, {})
      .then(response => {
        xmlResDHL = response.data
        xml2js.parseString(xmlResDHL, (error, result) => {
          if (error) {
              console.error(error);
          } else {
              jsonResDHL.push(result);                    
          }
        });
        // const resp = jsonResDHL[0]['res:ErrorResponse'].Response[0].Status[0];
        resp = jsonResDHL[0]['res:ShipmentResponse']        
        return resp;

      }).catch(error => {
        // console.log('Error de DHL CO_INT: ', error.response);
        // console.log('Error de DHL CO Destalle: ', error);        
        return {
            error: 'Error DHL_CO Generar Guia: SaveShipmentDHL01',
            msg: error.response
        };          
        
      });

}

async function REQ_2_ShipmentDHL(dat) { 
  let jsonResDHL = [];
  let Ship2DHL_XML = '';
  let xmlResDHL = '';
  let resp = '';
  let dataLabel = {};
    
  Ship2DHL_XML = mustache.render(ShipPickupXmlDHL, dat)
    return axios.post(url, Ship2DHL_XML, {})
      .then(response => {
        xmlResDHL = response.data
        xml2js.parseString(xmlResDHL, (error, result) => {
          // jsonResDHL.push(result)
          if (error) {
            console.error(error);
          } else {
            jsonResDHL.push(result);
          }
        });
        
        resp = jsonResDHL[0]['res:BookPUResponse']

        dataLabel = {
          ConfirmationNumber: resp.ConfirmationNumber[0],
          ReadyByTime: resp.ReadyByTime[0],
          NextPickupDate: resp.NextPickupDate[0],
          OriginSvcArea: resp.OriginSvcArea[0]
        };

        // console.log(dataLabel)

        return dataLabel;

      }).catch(error => {
        // console.log('Error de DHL CO_INT: ', error.response);
          // console.log('Error de DHL CO Destalle: ', error);
        return {
            error: 'Error DHL_CO Pickup: SaveShipmentDHL02',
            msg: error
        };
      });

}

async function REQ_1_ShipmentPKGDHL( dat ) {     
  let jsonResDHL = [];
  let RestDHL = '';
  let ShipDHL_XML = '';
  let xmlUp = '';
  let DHL_PkgToJson = '';
  let xmlShipmentDHL = '';
  let xmlResDHL = '';

  const Invoice = dat.Shipments.Shipment.Invoice;
  

  // Creamos el elemento raíz
  const root = builder.create('ExportDeclaration');

  root.ele('ExportReason', Invoice.ReasonDescription).up();
  root.ele('ExportReasonCode', Invoice.ReasonCode).up();
  root.ele('InvoiceNumber', Invoice.InvoiceNumber).up();
  root.ele('InvoiceDate', Invoice.DateTimeDHL).up();
  root.ele('ReceiverReference', Invoice.ReasonDescription).up();
  Invoice.Items.Item.forEach(item => {
    const ExportLineItem = root.ele('ExportLineItem');
    ExportLineItem
      .ele('LineNumber', item.LineId + 1).up()
      .ele('Quantity', item.Pieces).up()
      .ele('QuantityUnit', 'PCS').up()
      .ele('Description', item.ItemDescription).up()
      .ele('Value', item.ValuePerUnit).up()
      .ele('Weight')
      .ele('Weight', item.WeightPerUnit).up()
      .ele('WeightUnit', 'K').up()
      .up()
      .ele('GrossWeight')
      .ele('Weight', item.WeightPerUnit).up()
      .ele('WeightUnit', 'K').up()
      .up()
      .ele('ManufactureCountryCode', 'CO').up();
  });
  root.ele('PlaceOfIncoterm', 'CO').up();
  root.ele('DocumentFunction', 'BOTH').up();
  root.ele('InvoiceTotalNetWeight', dat.Shipments.Shipment.Weight).up();
  root.end();

  

  // Convertimos el objeto XML a cadena y lo mostramos en la consola
  parser(root.toString(), (err, result) => {
      if (err) {
          console.error(err);
      } else {
          // Convertimos el objeto XML a cadena y lo mostramos en la consola
          DHL_PkgToJson = result.ExportDeclaration;
      }
  });

  // console.log('DHL_PkgToJson: ', DHL_PkgToJson)

  // Nuevo valor para la etiqueta ShipmentServiceOptions
  const newShipmentServiceOptions = [ DHL_PkgToJson ];

  ShipDHL_XML = mustache.render(ShipXmlPKGDHL, dat); 

  // console.log('ShipDHL_XML: ', ShipDHL_XML)
  
  xml2js.parseString(ShipDHL_XML, (err, result) => {
    if (err) {
      console.error(err);
    } else {      
      result['req:ShipmentRequest'].ExportDeclaration = newShipmentServiceOptions;
      xmlShipmentDHL = result;
    }
  });
  // Convertir el objeto JavaScript de nuevo a XML
  xmlUp = builde.buildObject(xmlShipmentDHL);
  // console.log('xmlUp: ', xmlUp)
  return axios.post(url, xmlUp, {})
    .then(response => {
      xmlResDHL = response.data
      xml2js.parseString(xmlResDHL, (error, result) => {
        if (error) {
            console.error(error);
        } else {
            jsonResDHL.push(result);                    
        }
      });
      RestDHL = jsonResDHL[0]['res:ShipmentResponse'];
            
      return RestDHL;  

    }).catch(error => {
      // console.log('Error de DHL CO_INT: ', error.response);
      // console.log('Error de DHL CO Destalle: ', error);        
      return {
          error: 'Error DHL_CO Generar Guia: SaveShipmentDHL01',
          msg: error
      };
    });
  
}


module.exports = {
  REQ_1_ShipmentDHL,
  REQ_2_ShipmentDHL,
  REQ_1_ShipmentPKGDHL,
  REQ_1_ShipmentDHL_IMPORT,
};
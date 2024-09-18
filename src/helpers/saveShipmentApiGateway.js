const axios = require('axios');
// const mustache = require('mustache');
// const xml2js = require('xml2js');
const { DateTime } = require('luxon');
// const shipments = require('../models/shipments');
// const { ShipXml_1_CDR, ShipXml_2_CDR, ShipXml_3_CDR } = require('../structures/xsl/shipCDR');
// const { CDR_GUIA_URL, CDR_ACCEPT_URL } = require('../utils/config');

const { applogger } = require('../utils/logger');
const { responseQuota, quotaJsonDataBase } = require('../structures/json/quota')
const quotations = require('../models/quotations');
const { Surcharge } = require('./companySurcharges');
const { APIGATEWAY_EMITIR, APIGATEWAY_ETIQUETA, APIGATEWAY_RECOGIDA } = require('../utils/config');


// Creating a date time object
const date = DateTime.local().toISODate();
// const url = 'https://guias.coordinadora.com/ws/guias/1.6/server.php';  // PRODUCCION
// const url = 'https://sandbox.coordinadora.com/agw/ws/guias/1.6/server.php'; // SANDBOX
// const url = CDR_GUIA_URL
// const url2 = CDR_ACCEPT_URL

// global.jsonCDR = [];



// async function shipment(provider, dat) {
//   const url = APIGATEWAY_EMITIR;
//   try {
//       const response = await axios.post(url, dat);
//       return response.data;  // Aquí retornas los datos de la respuesta directamente
//   } catch (error) {
//       manejarError(provider, error);
//       throw new Error(`Error ${provider} -> ${error.message}`);
//   }
// }

// async function label(provider, dat) {
//   const url = APIGATEWAY_ETIQUETA;
//   try {
//       const response = await axios.post(url, dat);
//       return response.data;  // Aquí retornas los datos de la respuesta directamente
//   } catch (error) {
//       manejarError(provider, error);
//       throw new Error(`Error ${provider} -> ${error.message}`);
//   }
// }

function manejarError(provider, error) {
  if (error.response) {
      applogger.error(`Error ${provider} -> Código: ${error.response.status}, Mensaje: ${error.response.data}`);
  } else if (error.request) {
      applogger.error(`Error ${provider} -> No se recibió respuesta: ${error.request}`);
  } else {
      applogger.error(`Error ${provider} -> ${error.message}`);
  }
}

async function shipment(provider, dat) {
  return new Promise((resolve) => {
    setTimeout(() => {                
        const url = APIGATEWAY_EMITIR;
        try {
          const response = axios.post(url, dat);
          resolve(response);          
        } catch (error) {
          manejarError(provider, error);         
        }
    }, 1000);
  });
}

async function recogida(provider, dat) {
  return new Promise((resolve) => {
    setTimeout(() => {                
        const url = APIGATEWAY_RECOGIDA;
        try {
          const response = axios.post(url, dat);
          resolve(response);          
        } catch (error) {
          manejarError(provider, error);         
        }
    }, 1000);
  });
}


  async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function label(provider, dat) {
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {          
            const url = APIGATEWAY_ETIQUETA;
            try {
                const response = await axios.post(url, dat); // Esperar la respuesta de axios.post
                resolve(response.data); // Resolver la promesa con la data de la respuesta
            } catch (error) {
                manejarError(provider, error);
                reject(error); // Rechazar la promesa en caso de error
            }
        }, 1000); // 1 segundo de espera
    });
}

  async function label2(provider, dat) {
    return new Promise(async (resolve) => {
      setTimeout(async () => {          
          const url = APIGATEWAY_ETIQUETA;
          try {
            const response = axios.post(url, dat);
            resolve(response);            
          } catch (error) {
            manejarError(provider, error);
            // if (error.response) {             
            //   applogger.error(`Error ${provider} -> Código: ${error.response.status}, Mensaje: ${error.response.data}`);
            // } else if (error.request) {              
            //   applogger.error(`Error ${provider} -> No se recibió respuesta: ${error.request}`);
            // } else {              
            //   applogger.error(`Error ${provider} -> ${error.message}`);
            // }            
            // throw new Error(`Error ${provider} -> ${error.message}`);
          }

      }, 1000); // 2 segundos de espera
    });
    // const url = APIGATEWAY_ETIQUETA;
    // try {

    //   // const axiosConfig = {
    //   //   timeout: 50000,  // 5 segundos de timeout
    //   // };

    //   // const response = await axios.post(url, dat, axiosConfig);
    //   const response = await axios.post(url, dat);
    //   return response.data.code;
    // } catch (error) {
    //   if (error.response) {
    //     // El servidor respondió con un código de estado fuera del rango 2xx
    //     applogger.error(`Error ${provider} -> Código: ${error.response.status}, Mensaje: ${error.response.data}`);
    //   } else if (error.request) {
    //     // La solicitud se hizo pero no se recibió respuesta
    //     applogger.error(`Error ${provider} -> No se recibió respuesta: ${error.request}`);
    //   } else {
    //     // Algo más salió mal
    //     applogger.error(`Error ${provider} -> ${error.message}`);
    //   }
    //   // Devuelve un mensaje de error en lugar de usar `Providers`
    //   throw new Error(`Error ${provider} -> ${error.message}`);
    // }
  }

// async function shipment(provider, dat) {     
//   const url = APIGATEWAY_EMITIR;
//   let Providers = [];
  
// //   try {            
//       return axios.post(url, dat, {}).then( async response => {
//           // const responseApiGateway = response.data.body;          
//           return JSON.stringify({ "codigo": response.data.code })       
//       }).catch(error => {                
//           applogger.error(`Error ${provider} -> ${error}`);            
//           return Providers.push(`Error ${provider} -> ${error.message}`);
//       });
      
// //   } catch (error) {            
// //       applogger.error(`Error consumiendo servicio ${provider}: ${error}`)
// //       return Providers.push(error.response);
// //   };
// };

// async function shipment1(provider, dat) {
//     const url = APIGATEWAY_EMITIR;
//     let Providers = [];
  
//     try {
//       const response = await axios.post(url, dat);
//       return response.data.code;
//     } catch (error) {
//       if (error.response) {
//         // Server responded with a status other than 2xx
//         applogger.error(`Error ${provider} -> ${error.response.status}: ${error.response.data}`);
//         Providers.push(`Error ${provider} -> ${error.response.data}`);
//       } else if (error.request) {
//         // Request was made but no response received
//         applogger.error(`Error ${provider} -> No response received: ${error.request}`);
//         Providers.push(`Error ${provider} -> No response received`);
//       } else {
//         // Something else went wrong
//         applogger.error(`Error ${provider} -> ${error.message}`);
//         Providers.push(`Error ${provider} -> ${error.message}`);
//       }
//       return Providers;
//     }
//   }

// async function label(provider, dat) {
//     const url = APIGATEWAY_ETIQUETA;
//     let Providers = [];
  
//     try {
//       const response = await axios.post(url, dat);
//       return response.data.code;
//     } catch (error) {
//       if (error.response) {
//         // Server responded with a status other than 2xx
//         applogger.error(`Error ${provider} -> ${error.response.status}: ${error.response.data}`);
//         Providers.push(`Error ${provider} -> ${error.response.data}`);
//       } else if (error.request) {
//         // Request was made but no response received
//         applogger.error(`Error ${provider} -> No response received: ${error.request}`);
//         Providers.push(`Error ${provider} -> No response received`);
//       } else {
//         // Something else went wrong
//         applogger.error(`Error ${provider} -> ${error.message}`);
//         Providers.push(`Error ${provider} -> ${error.message}`);
//       }
//       return Providers;
//     }
//   }

// async function label(provider, bus, uid, dat) {     
//   const url = APIGATEWAY_ETIQUETA;
//   let Providers = [];
  
//   try {            
//       return axios.post(url, dat, {}).then( async response => {            
//           return response.data.code        
//       }).catch(error => {                
//           applogger.error(`Error ${provider} -> ${error}`);            
//           return Providers.push(`Error ${provider} -> ${error.message}`);
//       });
      
//   } catch (error) {            
//       applogger.error(`Error consumiendo servicio ${provider}: ${error}`)
//       return Providers.push(error.response);
//   };
// };



// async function REQ_2_ShipmentCDR(req2CDR) { 
//   let jsonResCDR = [];
//   const Ship3CDR_XML = mustache.render(ShipXml_2_CDR, req2CDR);
//   // console.log('Ship3CDR_XML: ',Ship3CDR_XML)

//   return axios.post(url, Ship3CDR_XML, {})
//   .then(response => {
//     const xmlResCDR = response.data;
//     // console.log(xmlResCDR);
//     xml2js.parseString(xmlResCDR, (error, result) => {
//       if (error) {
//           console.error(error);
//       } else {
//           jsonResCDR.push(result);                    
//       }
//     });

//     const resp = jsonResCDR[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:Guias_imprimirRotulosResponse'][0].return[0];

//     const dataLabel = {
//       rotulos: resp.rotulos[0]._
//     };
    
//     return dataLabel;

//   }).catch(error => {
//     return {
//         error: 'Error CDR_CO Pickup: SaveShipmentUPS03',
//         msg: error
//     };
//   });
// }

// async function REQ_3_ShipmentCDR(dat) { 
//   let jsonResCDR = [];
//   let jsonCDR = [];
//   const Ship3CDR_XML = mustache.render(ShipXml_3_CDR, dat);
//   // console.log('Ship3CDR_XML: ', Ship3CDR_XML)  
  
//   return axios.post(url2, Ship3CDR_XML, {})
//   .then(response => {
//     const xmlResCDR = response.data;
//     // console.log('xmlResCDR:',xmlResCDR)
//     xml2js.parseString(xmlResCDR, (error, result) => {
//       if (error) {
//           console.error(error);
//       } else {
//           jsonResCDR.push(result);                    
//       }
//     });

//     const resp = jsonResCDR[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:Recogidas_programarResponse']
//     // console.log(resp[0].Recogidas_programarResult[0].mensaje[0])
//     const dataLabel = {
//       rotulos: resp[0].Recogidas_programarResult[0].mensaje[0]
//     };
    
//     return dataLabel;

//   }).catch(error => {
//     const errorData = error.response.data
//     // Utilizamos una expresión regular para extraer el número después de "id:"
//     const idMatch = errorData.match(/id: (\d+)/);
//     if (idMatch) {
//       const idValue = idMatch[1];
//       const dataLabel = {
//         rotulos: 'Ya cuenta con una recogida registrada con el ID: ' + idValue 
//       };
//       return dataLabel
//     } 
//   })
// }




module.exports = {
  // EmitirGuia,
  shipment,
  label,
  recogida,
//   shipment1,
  // REQ_2_ShipmentCDR,
  // REQ_3_ShipmentCDR,
};
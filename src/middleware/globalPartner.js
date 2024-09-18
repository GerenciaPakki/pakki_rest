const axios = require('axios');
const cron = require('node-cron');
const dotenv = require('dotenv');
const tokensAuth = require('../models/tokensAuth');

const { DateTime } = require('luxon');
const querystring = require('querystring');
const { MarcaDeTiempoCol } = require('../helpers/pakkiDateTime');
const { FDX_URL_TOKEN } = require('../utils/config');
dotenv.config();

// cron.schedule('* 0,45 7-22 * * 1-5', () => {
// cron.schedule('10 * 7-22 * * 1-5', () => {
// cron.schedule('55 2 */2 * * *', async() => {
//   await AuthFdxCo();
//   await AuthFdxUs();
//   // await AuthUpsCo();
//   console.log("ya pasamos FDX ...");  
// });
// cron.schedule('55 21 */2 * * *', async() => {
//   await AuthUpsUs();
//   // await AuthUpsCo();
//   console.log("ya pasamos UPS ...");  
// });

// cron.schedule('*/15 * * * * *', async () => {
//   let dat = await MarcaDeTiempoCol()
//   console.log('Manejo de Fecha: ', dat);
//   console.log("Ya pasamos Cron en GlobalPartner.");
//   const tknfdxCO = await AuthFdxCo();
//   console.log("tknfdxCO: ", tknfdxCO);
// });

const AuthService = async (url, envPrefix, data) => {
  console.log('url, envPrefix, data: ', url, envPrefix, data);
  //  await tokensAuth.drop();
  let dat = await MarcaDeTiempoCol()
  try {
    const headers = {
      'content-type': 'application/x-www-form-urlencoded'
    };
    const response = await axios.post(url, querystring.stringify(data), {
      headers: headers
    });
    console.log('response: ', response)
    if (response && response.data) {
      if (envPrefix === "FDX_CO") {
        const tokenDataCo = await new tokensAuth({
          "provider.envPrefix": envPrefix,
          "provider.access_token": response.data.access_token,
          "provider.token_type": response.data.token_type,
          "provider.expires_in": response.data.expires_in,
          "provider.scope": response.data.scope,
          "provider.timestamp": dat,

        });
        console.log('tokenDataCo: ', tokenDataCo);
        await tokenDataCo.save();
      } else {
        console.error(`No se recibieron Credenciales de respuesta desde ${envPrefix}`);
      }

    } else {
      console.error(`No se recibieron Credenciales de respuesta desde ${envPrefix}`);
    }

  } catch (error) {
    console.error(error);
    console.error(`Error al procesar el Token de: ${envPrefix}`);
  }
};

const AuthFdxCo = () => AuthService(
  FDX_URL_TOKEN,
  'FDX_CO', {
    grant_type: 'client_credentials',
    client_id: FDX_CLIENT_ID_CO,
    client_secret: FDX_CLIENT_SECRET_CO
  }
);


const AuthServiceUPS = async (url, envPrefix, data) => {  
  try {
    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
      'x-merchant-id': 'Client merchant ID',
      'Authorization': 'Basic eTlKb0daeGlEdXJaWUROWlFHbTF4SVFtMmFjeTlmMWQ3NGlEaWo3QUo1bVRnbURhOkVxQVZzT2ZuTlRNYVdEOGszdzBpRTFBT2xNSk1iR25HWlBJeWpHUDhPbzVzUkRhQ1pvTGc1eU9ONVlQcTQwREk='
    };
    const response = await axios.post(url, querystring.stringify(data), { headers: headers });      
    // console.log(response);    
    if (response && response.data) {
      if (envPrefix === "UPS_US") {
        const tokenDataUPS = await new tokensAuth({
        provider: {
          envPrefix: envPrefix,
          token_type: response.data.token_type,
          issued_at: response.data.issued_at,
          client_id: response.data.client_id,
          access_token: response.data.access_token,
          scope: response.data.scope,
          expires_in: response.data.expires_in,
          refresh_count: response.data.refresh_count,
          status: response.data.status,            
        }
      });
        // console.log(tokenData);
        await tokenDataUPS.save();  
      } else {
        console.error(`No se recibieron Credenciales de respuesta desde ${envPrefix}`);
      }
    } else {
      console.error(`No se recibieron Credenciales de respuesta desde ${envPrefix}`);
    }
  } catch (error) {
    // console.error(error);
    console.error(`Error al procesar el Token de: ${envPrefix}`);
  }
  // console.log(`ACCESS_TOKEN_${envPrefix}`, process.env[`ACCESS_TOKEN_${envPrefix}`]);
    // console.log(`ACCESS_TOKEN_${envPrefix}`, process.env.ACCESS_TOKEN_FDX_CO);

};

const AuthFdxUs = () => AuthService(
  'https://apis-sandbox.fedex.com/oauth/token',
  'FDX_US',
  {
    grant_type: 'client_credentials',
    client_id: process.env.FDX_CLIENT_ID_US,
    client_secret: process.env.FDX_CLIENT_SECRET_US
  }
);

// UPS COLOMBIA FUNCIONARA POR XML
// const AuthUpsCo = () => AuthServiceUPS(
//   'https://wwwcie.ups.com/security/v1/oauth/token',
//   'UPS_CO',
//   {
//     grant_type: 'client_credentials'
//   }  
// );

const AuthUpsUs = () => AuthServiceUPS(
  'https://wwwcie.ups.com/security/v1/oauth/token',
  'UPS_US',  
  {
    grant_type: 'client_credentials'
  }
);

module.exports = {
    AuthFdxCo,
    AuthFdxUs,
    AuthUpsUs,
};



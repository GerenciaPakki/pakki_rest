const { response } = require('express');
const { saveQuoFDX, miHelper, fdxNAT } = require('../helpers/saveQuoFDX');
const { saveQuoUPS } = require('../helpers/saveQuoUPS');
const { applogger } = require('../utils/logger');


const quotaFormat = async (req, res = response) => {
    const uid = req.uid;
    const bus = req.bus;
    const data = req.body;

    // console.log(data);
    // const quofdx = await saveQuoFDX(uid, bus, data);
    // const quoups = await saveQuoUPS(uid, bus, data);

    fdxNAT(data,uid,bus, function(err, resultado) {
      if (err) {
      applogger.error(`Error en FORJSONCL-4O1 > quotaFormat: Error al Actualizar CompanyDiscountWeight uid: ${uid}, bus: ${bus}, error: ${error}`);
      // Manejamos el error
      res.status(418).json({
            ok: false,
            msg: 'FORJSONCL-4O1: ', error
        });
    }
    // Enviamos la respuesta al cliente
    return res.status(200).json({ok:true, res: resultado});
  });
    
    //TODO: AQUI SE ENVIA AL FRONT LA RESPUESTA CON LOS DATOS DE LAS COTIZACION
    //TODO: EN UN ARREGLO PARA QUE EL FRONT SOLO DEBA LEER UN ARRAY
};






module.exports = {
    quotaFormat,
};
const { DateTime } = require("luxon");
const axios = require('axios');
const shipments = require("../models/shipments");
const { PickupDBFDX } = require("../structures/json/pickupFDX");
const TokensAuth = require("../models/TokensAuth");
const uuid = require('uuid');
const id = uuid.v4();
// Creating a date time object
let date = DateTime.local();
const dat = date.toISO({ includeOffset: true }); // Ejemplo de salida: "2023-02-28T16:23:45-06:00"
const hrColombia = DateTime.fromISO(dat).minus({ hours: 5 }).toISO({ includeOffset: true });
const fdxcoId = `fdxco-${id}`;

async function PickupFDX(shipment, Pickup, Provider) { 

    const pickupResFDX = PickupDBFDX(shipment, Pickup, Provider);
    // return pickupResFDX;

    let QuotationsArray = [];
    const url = 'https://apis-sandbox.fedex.com/pickup/v1/pickups';
        
    const TknFdxCO = await TokensAuth.findOne({ "provider.envPrefix": "FDX_CO" },
        { "provider.access_token": 1,"provider.timestamp": 1,_id:0 })
        .sort({ "provider.timestamp": -1 }).limit(1);
        
    headers = {
        'content-type': 'application/json',
        'x-customer-transaction-id': fdxcoId,
        'x-locale': 'es_US',
        'Authorization': `Bearer ${TknFdxCO.provider.access_token}`,
    };

    return axios.post(url, pickupResFDX, { headers: headers })
    .then(response => {
        const JsonResFDX = response.data;  
        return JsonResFDX;
            
    }).catch(error => {
        console.log('Tenemos el error ... ',error.response.data.errors[0]);
            // handleError(error, QuotaFDX, bus, uid);
            // return ProvidersFDX.push('Es Error UPS_CO_NAT');
    }); 
    console.log('Tenemos Respuesta de Recogida: ',pickupResFDX);

}



module.exports = {
    PickupFDX,
};
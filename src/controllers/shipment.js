const {
    response
} = require('express');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

const {
    DateTime
} = require('luxon');

const {
    afterTwoInTheAfternoon,
    weekendDay,
    holiDay,
    itIsEaster
} = require('../helpers/pakkiDateTime');

const {
    shipmentCDR
} = require('../helpers/ShipmentCDR');
const {
    shipmentDHL
} = require('../helpers/ShipmentDHL');
const {
    shipmentUPS
} = require('../helpers/ShipmentUPS');
const {
    shipmentApiGateway
} = require('../helpers/ShipmentApiGateway');
// const {
//     shipmentFDX
// } = require('../helpers/ShipmentFDX');
const {
    applogger
} = require('../utils/logger');
const { shipmentFDX } = require('../helpers/ShipmentFDX_JSON');

// Creating a date time object
const date = DateTime.local().toISODate();

// Agrega el prefijo "fdxco" al UUID

global.QuotationsArray = [];
global.Providers = [];

const shipment = async (req, res = response) => {

    // Limpiar objetos al comienzo de la función
    let shipper = {};
    let recipient = {};
    let shipment = {};
    let shipmentData = {};
    let Pickup = {};
    let company = {};
    let Provider = {};
    
    const uid = req.uid;
    const bus = req.bus;
    const dat = req.body;
    const dateIni = req.body.Pickup.DateTime
    const fechaHora = DateTime.fromISO(dateIni);
    // Verificar si la hora es mayor a las 14:00
    if (fechaHora.hour >= 14) {
        // Si es mas de las 14:00 pasa al siguiente dia
        const dateHour = await afterTwoInTheAfternoon(dateIni)
        // Si la fecha anterior es fin de semana la pasa al siguiente dia habil
        const dateWeekend = await weekendDay(dateHour)
        // Si la fecha anterior es Festivo lo pasa al siguiente dia habil
        const dateHoliDay = await holiDay(dateWeekend)
        // Valida que la fecha anterior No sea Semana Santa
        const dateIsEaster = await itIsEaster(dateHoliDay)

        dat.Pickup.DateTime = dateIsEaster.DateTime
        dat.Pickup.DateTime1 = dateIsEaster.DateTimeDHL
    } else {
        // Si es mas de las 14:00 pasa al siguiente dia
        const dateHour = await afterTwoInTheAfternoon(dateIni)
        // Si la fecha anterior es fin de semana la pasa al siguiente dia habil
        const dateWeekend = await weekendDay(dateHour)
        // Si la fecha anterior es Festivo lo pasa al siguiente dia habil
        const dateHoliDay = await holiDay(dateWeekend)
        // Valida que la fecha anterior No sea Semana Santa
        const dateIsEaster = await itIsEaster(dateHoliDay)

        dat.Pickup.DateTime = dateIsEaster.DateTime
        dat.Pickup.DateTime1 = dateIsEaster.DateTimeDHL
    }

    shipper = {
        ContactName: dat.Origin.ContactName,
        CompanyName: dat.Origin.CompanyName,
        Address: dat.Origin.Address,
        AddressAdditional: dat.Origin.AddressAdditional,
        AddressAdditional2: dat.Origin.AddressAdditional2,
        ContactPhone: dat.Origin.ContactPhone,
        ContactEmail: dat.Origin.ContactEmail,
        city: dat.Origin.CityName,
        stateOrProvinceCode: dat.Origin.StateCode,
        postalCode: dat.Origin.PostalCode,
        countryCode: dat.Origin.CountryCode,
        DANECode: dat.Origin.DANECode,
        residential: false
    };

    recipient = {
        ContactName: dat.Destination.ContactName,
        CompanyName: dat.Destination.CompanyName,
        Address: dat.Destination.Address,
        AddressAdditional: dat.Destination.AddressAdditional,
        AddressAdditional2: dat.Destination.AddressAdditional2,
        ContactPhone: dat.Destination.ContactPhone,
        ContactEmail: dat.Destination.ContactEmail,
        city: dat.Destination.CityName,
        stateOrProvinceCode: dat.Destination.StateCode,
        postalCode: dat.Destination.PostalCode,
        countryCode: dat.Destination.CountryCode,
        DANECode: dat.Destination.DANECode,
        residential: false
    };

    shipment = {
        documentShipment: dat.Shipments.documentShipment,
        serviceType: dat.Shipments.serviceType,
        packagingType: dat.Shipments.packagingType,
        PackQuantity: dat.Shipments.Shipment.PackQuantity,
        weightUnit: dat.Shipments.Shipment.WeightUnit,
        weight: dat.Shipments.Shipment.Weight,
        dimUnit: dat.Shipments.Shipment.DimUnit,
        length: dat.Shipments.Shipment.Length,
        width: dat.Shipments.Shipment.Width,
        height: dat.Shipments.Shipment.Height,
        insurance: dat.Shipments.Shipment.Insurance,
        insuranceCurrency: dat.Shipments.Shipment.InsuranceCurrency,
        declaredValue: dat.Shipments.Shipment.DeclaredValue,
        content: dat.Shipments.Shipment.Content,
        reference: dat.Shipments.Shipment.Reference,
        description: dat.Shipments.description,
        Comments: dat.Shipments.Comments,
        ReferenceCodePay: dat.Shipments.ReferenceCodePay,
        PaymentMethod: dat.Shipments.PaymentMethod,
        PaymentType: dat.Shipments.PaymentType,
        Payment: dat.Shipments.Payment,
        PaymentConfirmation: dat.Shipments.PaymentConfirmation,
    };

    Pickup = {
        PickupRequired: dat.Pickup.PickupRequired,
        PickupCode: dat.Pickup.PickupCode,
        PickupDate: dat.Pickup.PickupDate,
        ContactName: dat.Pickup.ContactName,
        EmailAddress: dat.Pickup.EmailAddress,
        CompanyName: dat.Pickup.CompanyName,
        Address: dat.Pickup.Address,
        AddressAdditional: dat.Pickup.AddressAdditional,
        AddressAdditional1: dat.Pickup.AddressAdditional1,
        CountryCode: dat.Pickup.CountryCode,
        City: dat.Pickup.City,
        StateOrProvinceCode: dat.Pickup.StateOrProvinceCode,
        PostalCode: dat.Pickup.PostalCode,
        DANECode: dat.Pickup.DANECode,
        ContactPhone: dat.Pickup.ContactPhone,
        DateTime: dat.Pickup.DateTime,
        DateTime1: dat.Pickup.DateTime1,
        TimeStart: dat.Pickup.TimeStart,
        TimeEnd: dat.Pickup.TimeEnd,
        PackQuantity: dat.Shipments.Shipment.PackQuantity,
        weight: dat.Shipments.Shipment.Weight,
        Comments: dat.Pickup.Comments
    };

    company = {
        CompanyID: dat.company.CompanyID,
        branchoffices: dat.company.branchoffices,
        Collaborator: dat.company.Collaborator
    };

    Provider = {
        partners: dat.Provider.partners,
        service: dat.Provider.service,
        arrivalDate: dat.Provider.arrivalDate,
        shippingValue: dat.Provider.shippingValue,
    };

    let resFDX = {}
    let resFDXError = {
        ok: false,
        msg: 'En este momento FEDEX esta presentando Fallas de Conexión'
    }
    let resUPS = {}
    let resUPSError = {
        ok: false,
        msg: 'En este momento UPS esta presentando Fallas de Conexión'
    }
    let resDHL = {}
    let resDHLError = {
        ok: false,
        msg: 'En este momento DHL esta presentando Fallas de Conexión'
    }
    let resCDR = {}
    let resCDRError = {
        ok: false,
        msg: 'En este momento Coordinadora esta presentando Fallas de Conexión'
    }


    const promises = [];
    const providerPromisesMap = new Map(); // Inicializar el mapa de promesas y proveedores
    let responseObj = {};
    let promise = {}

    const data = dat;
    if (Provider.partners === 'FDX') {
        promise = shipmentFDX(shipper, recipient, shipment, Pickup, Provider, company, dat);
        //promise = shipmentFDX(dat);
        promises.push(promise);
        const requestId = uuidv4(); // Generar UUID único para la solicitud
        providerPromisesMap.set(requestId, promise); // Asociar el UUID con la promesa
    } else if (Provider.partners === 'UPS') {
        //promise = shipmentUPS(shipper, recipient, shipment, Pickup, Provider, company, dat);
        promise = shipmentUPS(dat);
        promises.push(promise);
        const requestId = uuidv4(); // Generar UUID único para la solicitud
        providerPromisesMap.set(requestId, promise); // Asociar el UUID con la promesa
    } else if (Provider.partners === 'DHL') {
        const promise = shipmentDHL(dat);
        promises.push(promise);
        const requestId = uuidv4(); // Generar UUID único para la solicitud
        providerPromisesMap.set(requestId, promise); // Asociar el UUID con la promesa
    } else if (Provider.partners === 'CDR') {
        const promise = shipmentCDR(dat);
        promises.push(promise);
        const requestId = uuidv4(); // Generar UUID único para la solicitud
        providerPromisesMap.set(requestId, promise); // Asociar el UUID con la promesa
    } else if (Provider.partners === 'DEPRISA') {
        const promise = shipmentApiGateway(bus, uid, dat);
        promises.push(promise);
        const requestId = uuidv4(); // Generar UUID único para la solicitud
        providerPromisesMap.set(requestId, promise); // Asociar el UUID con la promesa
    }


    try {
        // Ejecutar promesas secuencialmente
        for (const [requestId, promise] of providerPromisesMap) {
            
            const provider = Provider.partners; // Obtener el proveedor actual

            // Ejecutar la promesa y guardar la respuesta
            const result = await promise.catch(e => ({
                ok: false,
                // msg: `Error: ${JSON.stringify(e.response.data.msg)}`
                // msg: `${e.response}`
                msg: `Error: ${e.response.data == undefined ? e : JSON.stringify(e.response.data.msg)}`
            }));

            if(result.ok == false)
            {
                applogger.error(`Error en shipment > Provider.partners: ${Provider.partners}, bus: ${bus}, error: ${result.msg}, data: ${JSON.stringify(data)}`);
                throw new Error(result.msg);
                // const response = { Resulta: result.msg }
                // Object.assign(responseObj, response);
            }
            else
            {
                // Crear el objeto de respuesta para el proveedor actual
                const response = {
                    [provider]: {
                        DB: result.msg.DB || "",
                        payGateway: result.msg.payGateway || {},
                        pickup: result.msg.pickup || {},
                        email: result.msg.email || {},
                        errores: result.msg.msg || [],
                        NumGuia: result.msg.NumGuia || "",
                        guia: result.msg.guia || "",
                        proforma: result.msg.proforma || "",
                        carta: result.msg.carta || ""
                    }
                };

                // Fusionar la respuesta actual con el objeto responseObj
                Object.assign(responseObj, response);
            }
            // // Fusionar la respuesta actual con el objeto responseObj
            // Object.assign(responseObj, response);
        }

        // Enviar respuesta
        res.status(200).json(responseObj);
    } catch (error) {
        // Handle errors
        // applogger.error(`Error en SHIPCL-4O1 > Provider.partners: Error al Enviar el SHIPMENT, Provider.partners: ${Provider.partners}, bus: ${bus}, error: ${error}`);
        applogger.error(`Error en shipment -> Provider.partners: Error al Enviar el SHIPMENT, Provider.partners: ${Provider.partners}, bus: ${bus}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: error.message
        });
    }
};

module.exports = {
    shipment,
};
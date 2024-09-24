const { response } = require('express');
const dotenv = require('dotenv');
const uuid = require('uuid');
const { DateTime } = require('luxon');

const { afterTwoInTheAfternoon, weekendDay, holiDay, itIsEaster } = require('../helpers/pakkiDateTime');

const { quotaUPS } = require('../helpers/saveQuoUPS');
const { quotaDHL } = require('../helpers/saveQuoDHL');
const { quotaCDR } = require('../helpers/saveQuoCDR');
const { quotaXMLFDX } = require('../helpers/saveQuoFDX');
const { applogger } = require('../utils/logger');
const { quotaFDX } = require('../helpers/saveQuoFDX_JSON');
const { quotation } = require('../helpers/SaveQuotationApiGateway')

// Creating a date time object
const date = DateTime.local().toISODate();

// Genera un UUID v4 (basado en números aleatorios)
const id = uuid.v4();

// Agrega el prefijo "fdxco" al UUID

global.QuotationsArray = [];
global.Providers = [];

const quota = async (req, res = response) => {

    const uid = req.uid;
    const bus = req.bus;
    const dat = req.body
    const date = req.body.Shipments.DateTime
    const fechaHora = DateTime.fromISO(date); 

    // console.log('Fecha y Hora: ' + date)
    // console.log('Fecha y Hora: ' + fechaHora)

    try {
        // Verificar si la hora es mayor a las 14:00
        if (fechaHora.hour >= 14) {
    
            // Si es mas de las 14:00 pasa al siguiente dia
            const dateHour = await afterTwoInTheAfternoon(date)
            // Si la fecha anterior es fin de semana la pasa al siguiente dia habil
            const dateWeekend = await weekendDay(dateHour)
            // Si la fecha anterior es Festivo lo pasa al siguiente dia habil
            const dateHoliDay = await holiDay(dateWeekend)
            // Valida que la fecha anterior No sea Semana Santa
            const dateIsEaster = await itIsEaster(dateHoliDay)
    
            dat.Shipments.DateTime = dateIsEaster.DateTime
            dat.Shipments.DateTimeDHL = dateIsEaster.DateTimeDHL
        } else {
            // Si es mas de las 14:00 pasa al siguiente dia
            const dateHour = await afterTwoInTheAfternoon(date)
            // Si la fecha anterior es fin de semana la pasa al siguiente dia habil
            const dateWeekend = await weekendDay(dateHour)
            // Si la fecha anterior es Festivo lo pasa al siguiente dia habil
            const dateHoliDay = await holiDay(dateWeekend)
            // Valida que la fecha anterior No sea Semana Santa
            const dateIsEaster = await itIsEaster(dateHoliDay)
    
            dat.Shipments.DateTime = dateIsEaster.DateTime
            dat.Shipments.DateTimeDHL = dateIsEaster.DateTimeDHL
        }
    
        const shipper = {
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
    
        const recipient = {
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
    
        const shipment = {
            documentShipment: dat.Shipments.documentShipment,
            serviceType: dat.Shipments.serviceType,
            packagingType: dat.Shipments.packagingType,
            DateTime: dat.Shipments.DateTime,
            DateTimeDHL: dat.Shipments.DateTimeDHL,
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
            description: dat.Shipments.Shipment.description,
            Comments: dat.Shipments.Shipment.Comments,
            PaymentType: dat.Shipments.PaymentType,
            packagingType: dat.Shipments.packagingType,
        };
    
        const company = {
            CompanyID: dat.company.CompanyID,
            branchoffices: dat.company.branchoffices,
            Collaborator: dat.company.Collaborator
        };
        applogger.error(`prueba`);
        let resFDX, resDeprisa, resUPS, resDHL, resCDR;
        const promises = [
            quotaUPS(shipper, recipient, bus, uid, shipment, dat),
            quotation('DEPRISA', bus, uid, dat),
            quotaDHL(shipper, recipient, bus, uid, shipment, dat),
            quotaCDR(shipper, recipient, bus, uid, shipment, dat),
            quotaFDX(shipper, recipient, company, shipment, dat),           
        ];

        [resUPS, resDeprisa, resDHL, resCDR, resFDX] = await Promise.all(promises.map(p => p.catch(e => ({
            ok: false,
            msg: `Error: ${e.message}`
        }))));

        // [resUPS, resDeprisa, resDHL, resCDR, resFDX] = await Promise.all(promises.map(p => p.catch(e => ({
        //     ok: false,
        //     msg: `Error: ${e.message}`
        // }))));

        res.status(200).json({
            FDX: resFDX,
            DEPRISA: resDeprisa,
            UPS: resUPS,
            DHL: resDHL,
            CDR: resCDR
        });
        
    } catch (error) {
        applogger.error(`Error en QUOCL-4O1 > quota: Error al Realizar la Quotation, uid: ${uid}, bus: ${bus}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'CLLQT-0: ', error
        });
    }
};

module.exports = {
    quota,
};
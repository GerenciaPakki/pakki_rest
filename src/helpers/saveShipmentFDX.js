const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');
const builder = require('xmlbuilder');
const parser = require('xml2js').parseString;
const builde = new xml2js.Builder();

const { FDX_URL } = require('../utils/config');

const { ShipmentDBFDX, PickupXML_FDX, ShipXML_FDX, ShipXML_FDX_PKG, ShipXSLT_FDX_PKG, ShipXML_FDX_DOC } = require('../structures/xml/shipFDX');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');
const shipments = require('../models/shipments');
const { SurchargePakkiFDX, SurchargePakkiDomesticFDX } = require('./companySurcharges');
const { GenerateID } = require('./pakkiSecutivo');


// const url = 'https://wsbeta.fedex.com/web-services';
// const url = 'https://ws.fedex.com:443/web-services'; //PRODUCCION
const url = FDX_URL
let xmlShipFDX = ''
let xmlResFDX = ''
let resp = ''
let SurchargePakki = ''
let ShipFDX = ''
let payGateway = {}
let PickupFDX = ''
let ResPickupFDX = ''
let ShipPickupUpdate = ''
let root = ''
let xmlUp = ''

async function REQ_1_ShipmenDomesticFDX(dat) {
    fdxcoId = `fdxco-${await GenerateID()}`
    // fdxcoId = `fdxco-${id}`
    // console.log('fdxcoId: ', fdxcoId )
    ShipResFDX = [];
    generalResul = []; // Aqui alimentamos las diferentes respuetas o errores que mostraremos al finalizar el proceso
    
    xmlShipFDX = mustache.render(ShipXML_FDX_DOC, dat)
    return axios.post(url, xmlShipFDX, {})
    .then( async response => { 
        xmlResFDX = response.data
        xml2js.parseString(xmlResFDX, (error, result) => {
            if (error) {
                console.error(error);
            } else {
                ShipResFDX.push(result);
            }
        });
        resp = ShipResFDX[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0].ProcessShipmentReply[0];
        // console.log(resp);
        // console.log(resp.CompletedShipmentDetail[0].ShipmentRating[0].ShipmentRateDetails[0].TotalNetCharge[0]);

        if (resp.HighestSeverity[0] === 'SUCCESS' || resp.HighestSeverity[0] === 'NOTE' ) { 

            const ShipmentCode = resp.CompletedShipmentDetail[0].MasterTrackingId[0].TrackingNumber[0];
            const label = resp.CompletedShipmentDetail[0].CompletedPackageDetails[0].Label[0];
            const package = [{}];
            ShipResFDX = [];
            
            //TODO: Variables que se procesaran con los Incrementos de Pakki
            const ServiceType = resp.CompletedShipmentDetail[0].ServiceDescription[0].ServiceType[0];
            const ProvicerDiscount = resp.CompletedShipmentDetail[0].ShipmentRating[0].EffectiveNetDiscount[0];
            const exchangeRate = resp.CompletedShipmentDetail[0].ShipmentRating[0].ShipmentRateDetails[0].CurrencyExchangeRate[0];
            const shippingValue = resp.CompletedShipmentDetail[0].ShipmentRating[0].ShipmentRateDetails[0].TotalNetCharge[0];
            const Domestic = dat.Shipments.documentShipment
            const Weight = dat.Shipments.Shipment.Weight
            
            //TODO: Helper para realizar la operacion aritmetica 
            SurchargePakki = await SurchargePakkiDomesticFDX(ServiceType,ProvicerDiscount,exchangeRate,shippingValue,Domestic,Weight);
            
                        
            //TODO: CARGAR DATOS A DOCUMENTO DE ShipmentDBFDX
            ShipFDX = new  shipments(
                ShipmentDBFDX(fdxcoId, dat, ShipmentCode,label,package,resp,SurchargePakki)
            );
            await ShipFDX.save();
            ShipResFDX.push(ShipFDX);
            
            payGateway = {
                OK: true,
                fdxcoId:fdxcoId,
                label: label,
                package: package,
                ShipmentID: ShipResFDX[0].ShipmentID,
                ShipmentCode: ShipResFDX[0].shipment.ShipmentCode,
                PaymentType: ShipResFDX[0].billPayment.paymentType,
                shippingValue: ShipResFDX[0].Provider.shippingValue
            };
            return payGateway;

        } else if (resp.HighestSeverity === 'ERROR') {
                const resError = {
                    OK: false,
                    error: 'Error FDX_CO Generar Pickup: SaveShipmentFDX01',
                    Notifications: resp.Notifications[0].Severity[0],
                    Message: resp.Notifications[0].Message[0]
                };
                return resError;            
            } else {
                const resError = {
                    OK: false,
                    error: 'Error FDX_CO Generar Pickup: SaveShipmentFDX02',
                    Notifications: resp.Notifications[0].Severity[0],
                    Message: resp.Notifications[0].Message[0]
                };
                return resError; 
            }        
      });

}
  
async function REQ_1_ShipmentFDX(dat) {
    console.log('Entramos a la funcion de Creacion de Guia de FDX desde CORE ...')
    fdxcoId = `fdxco-${await GenerateID()}`    
    ShipResFDX = [];
    generalResul = []; // Aqui alimentamos las diferentes respuetas o errores que mostraremos al finalizar el proceso
    
    xmlShipFDX = mustache.render(ShipXML_FDX_DOC, dat);
    // console.log('xmlShipFDX: ',xmlShipFDX);
    return axios.post(url, xmlShipFDX, {})
    .then( async response => { 
        xmlResFDX = response.data;
        // console.log('xmlResFDX: ',xmlResFDX);
        xml2js.parseString(xmlResFDX, (error, result) => {
            if (error) {
                console.error(error);
            } else {
                ShipResFDX.push(result);
            }
        });
        resp = ShipResFDX[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0].ProcessShipmentReply[0];
        
        if (resp.HighestSeverity[0] === 'SUCCESS') { 

            const ShipmentCode = resp.CompletedShipmentDetail[0].MasterTrackingId[0].TrackingNumber[0];
            const label = resp.CompletedShipmentDetail[0].CompletedPackageDetails[0].Label[0];
            const package = [{}];
            ShipResFDX = [];
            
            //TODO: Variables que se procesaran con los Incrementos de Pakki
            const ServiceType = resp.CompletedShipmentDetail[0].ServiceDescription[0].ServiceType[0];
            const ProvicerDiscount = resp.CompletedShipmentDetail[0].ShipmentRating[0].EffectiveNetDiscount[0];
            const Domestic = dat.Shipments.documentShipment
            const Weight = dat.Shipments.Shipment.Weight
            const exchangeRate = resp.CompletedShipmentDetail[0].ShipmentRating[0].ShipmentRateDetails[0].CurrencyExchangeRate[0];
            const shippingValue = resp.CompletedShipmentDetail[0].ShipmentRating[0].ShipmentRateDetails[0].TotalNetCharge[0];
            
            //TODO: Helper para realizar la operacion aritmetica 
            SurchargePakki = await SurchargePakkiFDX(ServiceType,ProvicerDiscount,exchangeRate,shippingValue,Domestic,Weight);
            
            //TODO: CARGAR DATOS A DOCUMENTO DE ShipmentDBFDX
            ShipFDX = new  shipments(
                ShipmentDBFDX(fdxcoId, dat, ShipmentCode,label,package,resp,SurchargePakki)
            );
            await ShipFDX.save();
            ShipResFDX.push(ShipFDX);
            
            payGateway = {
                OK: true,
                fdxcoId:fdxcoId,
                label: label,
                package: package,
                ShipmentID: ShipResFDX[0].ShipmentID,
                ShipmentCode: ShipResFDX[0].shipment.ShipmentCode,
                PaymentType: ShipResFDX[0].billPayment.paymentType,
                shippingValue: ShipResFDX[0].Provider.shippingValue
            };
            return payGateway;

        } else if (resp.HighestSeverity === 'ERROR') {
            const resError = {
                OK: false,
                error: 'Error FDX_CO Generar Pickup: SaveShipmentFDX03',
                Notifications: resp.Notifications[0].Severity[0],
                Message: resp.Notifications[0].Message[0]
            };
            return resError;            
        } else {
            // console.log(result);
            const resError = {
                OK: false,
                error: 'Error FDX_CO Generar Pickup: SaveShipmentFDX04',
                Notifications: resp.Notifications[0].Severity[0],
                Message: resp.Notifications[0].Message[0]
            };
            return resError; 
        }        
      });

}

async function REQ_2_ShipmentFDX(dat, ShipmentID) {
    PickupResFDX = [];
    const PickupRequired = dat.Pickup.PickupRequired

    if (PickupRequired === true) {
        PickupFDX = mustache.render(PickupXML_FDX, dat);
        // console.log(PickupFDX);

        return axios.post(url, PickupFDX, {})
            .then(async response => {
                ResPickupFDX = response.data;
                xml2js.parseString(ResPickupFDX, (error, result) => {
                    if (error) {
                        console.error(error);
                    } else {
                        PickupResFDX.push(result);
                    }
                });
                resp = PickupResFDX[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0].CreatePickupReply[0];
            
                // console.log(resp.hasOwnProperty('HighestSeverity'));

                if (resp.hasOwnProperty('PickupConfirmationNumber')) {

                    const PickupCode = resp.PickupConfirmationNumber[0];
        
                    const updatedValuesPickup = {
                        $set: {
                            Pickup: {
                                PickupRequired: PickupRequired,
                                PickupCode: PickupCode,
                                PickupDate: dat.Pickup.DateTime,
                                PickupStartTime: dat.Pickup.TimeStart,
                                PickupEndTime: dat.Pickup.TimeEnd,
                                PickupAutomatic: true,
                                PickupContactName: dat.Pickup.ContactName,
                                PickupPhoneNumber: dat.Pickup.ContactPhone,
                                PickupAddress: dat.Pickup.Address,
                                PickupAddressDetails: dat.Pickup.AddressAdditional,
                                PickupAddressDetails2: dat.Pickup.AddressAdditional1,
                                PickupNotes: dat.Pickup.Comments,
                                dateCreate: marcaDeTiempo,
                            },
                            statusPickup: true
                        }
                    };
                    
                    const options = { upsert: true, returnOriginal: false };
                    ShipPickupUpdate = await shipments.findOneAndUpdate({ ShipmentID: ShipmentID },
                        updatedValuesPickup, options);
                    
                    // console.log(ShipPickupUpdate);
                
                    return ShipPickupUpdate;
            
                } else if (resp.hasOwnProperty('HighestSeverity')) {
                    const resError = {
                        OK: false,
                        error: 'Error FDX_CO Generar Pickup: SaveShipmentFDX05',
                        Notifications: resp.Notifications[0].Severity[0],
                        Message: resp.Notifications[0].Message[0]
                    };
                    return resError;            
                } else {
                    const resError = {
                        OK: false,
                        error: 'Error FDX_CO Generar Pickup: SaveShipmentFDX06',
                        Notifications: resp.Notifications[0].Severity[0],
                        Message: resp.Notifications[0].Message[0]
                    };
                    return resError; 
                }        
        });
    } else {
        const updatedValuesPickup = {
            $set: {
                Pickup: {
                    PickupRequired: false,
                    PickupCode: '0000',
                    PickupDate: '',
                    PickupStartTime: '',
                    PickupEndTime: '',
                    PickupAutomatic: false,
                    PickupContactName: '',
                    PickupPhoneNumber: '',
                    PickupAddress: '',
                    PickupAddressDetails: '',
                    PickupAddressDetails2: '',
                    PickupNotes: '',
                    dateCreate: marcaDeTiempo,
                },
                statusPickup: false
            }
        };
        const options = { upsert: true, returnOriginal: false };
        const ShipPickupUpdate = await shipments.findOneAndUpdate({ ShipmentID: ShipmentID },
            updatedValuesPickup, options)
    
        return ShipPickupUpdate
    }
}

async function REQ_1_ShipmentFDX_PGK(dat) {
    fdxcoId = `fdxco-${await GenerateID()}`
    ShipResFDX = [];
    generalResul = []; // Aqui alimentamos las diferentes respuetas o errores que mostraremos al finalizar el proceso
    
    const Invoice = dat.Shipments.Shipment.Invoice;

    
    // Creamos el elemento raíz
    root = builder.create('CustomsClearanceDetail');
    
    // Añadimos el elemento de pago de impuestos
    root.ele('DutiesPayment').ele('PaymentType', 'RECIPIENT').up();
    root.ele('DocumentContent', 'NON_DOCUMENTS').up();
    // Añadimos el elemento de valor aduanero
    root.ele('CustomsValue')
        .ele('Currency', Invoice.InsuranceCurrency)
        .up().ele('Amount', Invoice.TotalValue).up();
    // Factura Comercial
    root.ele('CommercialInvoice')
            .ele('Comments', 'IMITATION JEWELRY .').up()
            .ele('SpecialInstructions').up()
            .ele('Purpose', 'PERSONAL_EFFECTS').up()
            .ele('CustomerReferences')
                .ele('CustomerReferenceType', 'INVOICE_NUMBER').up()
                .ele('Value').up()
            .up()
        .end();    
    // Recorremos los items y los añadimos al elemento de commodities
    Invoice.Items.Item.forEach(item => {
        const commodities = root.ele('Commodities');
    // const commodities = commodities1.ele('Commodity');
    commodities
        .ele('NumberOfPieces', item.Pieces).up()
        .ele('Description', item.ItemDescription).up()
        .ele('CountryOfManufacture', Invoice.CountryOfManufacture).up()
        .ele('Weight')
            .ele('Units', Invoice.WeightUnits).up()
            .ele('Value', item.WeightPerUnit).up()
        .up()
        .ele('Quantity', item.Pieces).up()
        .ele('QuantityUnits', 'IN').up()
        .ele('UnitPrice')
            .ele('Currency', Invoice.InsuranceCurrency).up()
            .ele('Amount', item.ValuePerUnit).up()
        .up();
    commodities.up();
    });

    let Fdx_PkgToJson = '';
    let xmlShipmentFDX = '';

    // Convertimos el objeto XML a cadena y lo mostramos en la consola
    parser(root.toString(), (err, result) => {
        if (err) {
            console.error(err);
        } else {
           // Convertimos el objeto XML a cadena y lo mostramos en la consola
           Fdx_PkgToJson = result.CustomsClearanceDetail;
        }
    });    
    // Nuevo valor para la etiqueta CustomsClearanceDetail
    const newCustomsClearanceDetail = [ Fdx_PkgToJson ];
    
    
    // console.log(ShipXML_FDX_PKG);
    xmlShipFDX = mustache.render(ShipXML_FDX_PKG, dat);
    
    
    xml2js.parseString(xmlShipFDX, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            // console.log(result)
            // Asignar un array vacío a CustomsClearanceDetail
            result['soapenv:Envelope']['soapenv:Body'][0].ProcessShipmentRequest[0].RequestedShipment[0].CustomsClearanceDetail = newCustomsClearanceDetail;
            xmlShipmentFDX = result;
        }
    });

    // Convertir el objeto JavaScript de nuevo a XML
    xmlUp = builde.buildObject(xmlShipmentFDX)

    return axios.post(url, xmlUp, {})
    .then( async response => { 
        xmlResFDX = response.data;
        xml2js.parseString(xmlResFDX, (error, result) => {
            if (error) {
                console.error(error);
            } else {
                ShipResFDX.push(result);
            }
        });
        resp = ShipResFDX[0]['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0].ProcessShipmentReply[0];
        // console.log(resp.HighestSeverity[0]);
        if (resp.HighestSeverity[0] != 'ERROR') { 

            const ShipmentCode = resp.CompletedShipmentDetail[0].MasterTrackingId[0].TrackingNumber[0];
            const label = resp.CompletedShipmentDetail[0].CompletedPackageDetails[0].Label[0];
            const package = resp.CompletedShipmentDetail[0].ShipmentDocuments[0];
            ShipResFDX = [];

            //TODO: Variables que se procesaran con los Incrementos de Pakki
            const ServiceType = resp.CompletedShipmentDetail[0].ServiceDescription[0].ServiceType[0];
            const ProvicerDiscount = resp.CompletedShipmentDetail[0].ShipmentRating[0].EffectiveNetDiscount[0];
            const Domestic = dat.Shipments.documentShipment
            const Weight = dat.Shipments.Shipment.Weight
            const exchangeRate = resp.CompletedShipmentDetail[0].ShipmentRating[0].ShipmentRateDetails[0].CurrencyExchangeRate[0];
            const shippingValue = resp.CompletedShipmentDetail[0].ShipmentRating[0].ShipmentRateDetails[0].TotalNetCharge[0];
            
            // //TODO: Helper para realizar la operacion aritmetica 
            SurchargePakki = await SurchargePakkiFDX(ServiceType,ProvicerDiscount,exchangeRate,shippingValue,Domestic,Weight);
            

            // console.log(SurchargePakki);
            //TODO: CARGAR DATOS A DOCUMENTO TEMPORAL DE ShipmentDBFDX
            ShipFDX = new  shipments(
                ShipmentDBFDX(fdxcoId, dat, ShipmentCode,label,package,resp,SurchargePakki)
            );
            await ShipFDX.save();
            ShipResFDX.push(ShipFDX);

            // console.log(package);
            
            payGateway = {
                OK: true,
                fdxcoId:fdxcoId,
                label: label,
                package: package,
                ShipmentID: ShipResFDX[0].ShipmentID,
                ShipmentCode: ShipResFDX[0].shipment.ShipmentCode,
                PaymentType: ShipResFDX[0].billPayment.paymentType,
                shippingValue: ShipResFDX[0].Provider.shippingValue
            };
            return payGateway;

        } else if (resp.HighestSeverity === 'ERROR') {
            const resError = {
                OK: false,
                error: 'Error FDX_CO Generar Pickup: SaveShipmentFDX07',
                Notifications: resp.Notifications[0].Severity[0],
                Message: resp.Notifications[0].Message[0]
            };
            return resError;            
        } else {
            const resError = {
                OK: false,
                error: 'Error FDX_CO Generar Pickup: SaveShipmentFDX08',
                Notifications: resp.Notifications[0].Severity[0],
                Message: resp.Notifications[0].Message[0]
            };
            return resError; 
        }        
      });

}


module.exports = {
    REQ_1_ShipmentFDX,
    REQ_2_ShipmentFDX,
    REQ_1_ShipmentFDX_PGK,
    REQ_1_ShipmenDomesticFDX
};
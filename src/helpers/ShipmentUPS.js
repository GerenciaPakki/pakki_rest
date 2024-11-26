const { DateTime } = require('luxon');
const shipments = require('../models/shipments');
const { REQ_1_ShipmentCDR, REQ_2_ShipmentCDR, REQ_3_ShipmentCDR } = require('./saveShipmentCDR');
const { PayShipment } = require('./payGateway');
const { SendMails } = require('./sendMail');
const { SurchargePakkiDomesticCDR } = require('./companySurcharges');
const { ShipmentDBCDR } = require('../structures/xml/shipCDR');
const { converterPDF, guardarDocumentoBase64, savePDFInPath } = require('./convertToPDF');
const { SendMailsCDR, DataSendMails } = require('./emailProvider');
const { pakkiSecutivo, generateUID, GenerateID } = require('./pakkiSecutivo');
const crypto = require('crypto');
const uuid = require('uuid');
const { DaneCodeCity } = require('./DaneCodeCity');
let id = uuid.v4();
const { applogger } = require('../utils/logger');

// Creating a date time object
const date = DateTime.local();
const fchHH = date.toISO({ includeOffset: true });


//TODO: SE DEBE VALIDAR POR QUE NO SE ESTA GENERANDO EL NUMERO ALEATORIO MUY RAPIDO OCACIONANDO QUE ESTE NUMERO SE REPITA EN DIFERENTES ENVIOS


id = "";

global.ShipCDR = [];
global.ProvidersCDR = [];
global.jsonResCDR = [];
global.proceso = {
  DB: "",
  payGateway: "",
  pickup: "",
  email: "",
  errores: []
};

//async function shipmentUPS(shipper, recipient, shipment, Pickup, Provider, company, dat) {  
async function shipmentUPS(dat) {  
  try {
    const cdrcoId = `cdrco-${await GenerateID()}`;

    const fechaOriginal = dat.Pickup.DateTime;
    const fechaSinHora = DateTime.fromISO(fechaOriginal).toISODate();
    
    if (dat.Origin.CountryCode === "CO") {
      ShipResCDR = [];
      proceso = {};
      let PickupCode = ''


      if(dat.Destination.CountryCode === "CO")
      {
        const daneCode = await DaneCodeCity(dat.Origin.CityName, dat.Destination.CityName)
        dat.Origin.DANECode = daneCode.origin;
        dat.Destination.DANECode = daneCode.destination;
      }
      
      const req1CDR = await REQ_1_ShipmentCDR(dat);
      const req2CDR = await REQ_2_ShipmentCDR(req1CDR);
      
      
      const ShipmentCode = req1CDR.ShipmentCode;
      const label = req2CDR.rotulos;
              
      const package = [{}];

      const ShipCDR = new shipments(
        ShipmentDBCDR(cdrcoId, dat, ShipmentCode, package, req2CDR)
      );

      await ShipCDR.save();
      ShipResCDR.push(ShipCDR);
      proceso.NumGuia = ShipmentCode
      dat.Provider.ShipCod = ShipmentCode
      proceso.DB = ShipResCDR[0].ShipmentID;

      //TODO: PASARELA DE PAGO (paymentGateway) A SHIPMENT Y ACTUALIZA billPayment
      const payGateway = {
        ShipmentID: ShipResCDR[0].ShipmentID,
        ShipmentCode: ShipmentCode,
        PaymentType: ShipResCDR[0].billPayment.paymentType,
        ReferenceCodePay: dat.Shipments.ReferenceCodePay,
        PaymentMethod: dat.Shipments.PaymentMethod,
        Payment: dat.Shipments.Payment,
        PaymentConfirmation:  dat.Shipments.PaymentConfirmation,
        shippingValue: ShipResCDR[0].Provider.shippingValue
      };

      const resPayGate = await PayShipment(payGateway);      

      // const resPayGate = await PayShipment(payGateway).then(result => {
      //   return result;
      // });


      const payGateWay = {
        billPayment: resPayGate.billPayment.paymentType,
        paymentCash: resPayGate.statusCompany.paymentCash,
      };
      proceso.payGateway = payGateWay;

      //TODO: SOLICITUD DE RECOLECCION PARA COORDINADORA

      if (dat.Pickup.PickupRequired === true) {
        const req3CDR = await REQ_3_ShipmentCDR(dat);
        // console.log(req3CDR)
        PickupCode = req3CDR;   
        const updatedValuesPickup = {
          $set: {
            Pickup: {
                PickupRequired: true,
                PickupCode: PickupCode,
                PickupDate: dat.Pickup.DateTime,
                PickCDRtartTime: dat.Pickup.TimeStart,
                PickupEndTime: dat.Pickup.TimeEnd,
                PickupAutomatic: true,
                PickupContactName: dat.Pickup.ContactName,
                PickupPhoneNumber: dat.Pickup.ContactPhone,
                PickupAddress: dat.Pickup.Address,
                PickupAddressDetails: dat.Pickup.AddressAdditional,
                PickupAddressDetails2: dat.Pickup.AddressAdditional1,
                PickupNotes: dat.Pickup.Comments,
                dateCreate: fchHH,
            },
            statusPickup: true
          }
        };
        const options = { CDRert: true, returnOriginal: false };
        const ShipPickupUpdate = await shipments.findOneAndUpdate({ ShipmentID: cdrcoId },
          updatedValuesPickup, options);
        proceso.pickup = req3CDR;      
      } else {
        const dataLabel = {
          rotulos: 'No Se Solicito Recoleccion' 
        };
        proceso.pickup = dataLabel
      }

      
      //TODO: ENVIO DE CORREO ELECTRONICO
      
      // const dataMail = await DataSendMails(dat, cdrcoId);
      const tipGuia = 'guia';
      const guia = await converterPDF(label,cdrcoId, tipGuia);
      const rutaPdf = await guardarDocumentoBase64(label, cdrcoId, tipGuia)
      proceso.guia = rutaPdf
      const mailData = {
        coid: cdrcoId,
        ShipmentCode: ShipmentCode,
        PickupCode: PickupCode || "No solicito Recoleccion",
        origin: {
          name: dat.Origin.ContactName,
          business: dat.Origin.CompanyName,
          email: dat.Origin.ContactEmail,
          country: dat.Origin.CountryCode,
          city: dat.Origin.CityName,
          PostalCode: dat.Origin.PostalCode

        },
        destination: {
          name: dat.Destination.ContactName,
          business: dat.Destination.CompanyName,
          email: dat.Destination.ContactEmail,
          country: dat.Destination.CountryCode,
          city: dat.Destination.CityName,
          PostalCode: dat.Destination.PostalCode
        },
        shipment: {
            PackQuantity: dat.Shipments.Shipment.PackQuantity,
            Weight: dat.Shipments.Shipment.Weight,
            DeclaredValue: dat.Shipments.Shipment.DeclaredValue,
            Content: dat.Shipments.Shipment.Content,
            Reference: dat.Shipments.Shipment.Reference        
        },
        provider: {
          partner: dat.Provider.partners,
          service: dat.Provider.serviceName,
          arrivalDate: dat.Provider.deliveryDate,
          shippingValue: dat.Provider.shippingValue,
        },
      }

      let exitoso = false;
      let result = '';
      const SendMailers = SendMails(mailData, guia);
      proceso.email = await SendMailers.then(result => {
        this.exitoso = true;
        // this.result = result;
        proceso.email = result;
        // return result;
      });    


      // try {
      //   const SendMailers =  SendMails(mailData, guia);
      //   proceso.email = await SendMailers.then(result => {
      //     return{
      //       ok: true,
      //       msg: result
      //     };
      //   // return result;
      // });     
      // } catch (emailError) {
      //   return{
      //     ok: false,
      //     msg: proceso
      //   };
      // }
      
      if(this.exitoso){
        return{
          ok: true,
          msg: proceso
        };
      }
      else{
        return{
          ok: false,
          msg: proceso
        };
      }

      

      // return proceso;
      
    } 
  } catch (error) {
    // Handle errors
    applogger.error(`Error en shipmentUPS > creacion de promesa, error: ${error}`);

    return({
      ok: false,
      msg: `Error en shipmentUPS -> ${error}`
    });



    //return proceso;
  }
}


module.exports = {
    shipmentUPS,
};

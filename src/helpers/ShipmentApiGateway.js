const { DateTime } = require('luxon');
const shipments = require('../models/shipments');
const { shipment, label, recogida } = require('./saveShipmentApiGateway');
const { PayShipment } = require('./payGateway');
const { SendMails } = require('./sendMail');
require('./companySurcharges');
const { ShipmentDB } = require('../structures/xml/ship');
const { converterPDF, guardarDocumentoBase64 } = require('./convertToPDF');
require('./emailProvider');
const { GenerateID } = require('./pakkiSecutivo');
const uuid = require('uuid');
const { DaneCodeCity } = require('./DaneCodeCity');
const { applogger } = require('../utils/logger');
let id = uuid.v4();

// Creating a date time object
const date = DateTime.local();
const fchHH = date.toISO({ includeOffset: true });


//TODO: SE DEBE VALIDAR POR QUE NO SE ESTA GENERANDO EL NUMERO ALEATORIO MUY RAPIDO OCACIONANDO QUE ESTE NUMERO SE REPITA EN DIFERENTES ENVIOS


id = "";

// global.ShipCDR = [];
// global.ProvidersCDR = [];
// global.jsonResCDR = [];
global.proceso = {
  DB: "",
  payGateway: "",
  pickup: "",
  email: "",
  errores: []
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function shipmentApiGateway(bus, uid, dat) {

  try {
    const depcoId = `depco-${await GenerateID()}`;

    const fechaOriginal = dat.Pickup.DateTime;
    
    // if (dat.Origin.CountryCode === "CO") {
      // ShipResCDR = [];
      proceso = {}; 
      
      const daneCode = await DaneCodeCity(dat.Origin.CityName, dat.Destination.CityName)
      dat.Origin.DANECode = daneCode.origin;
      dat.Destination.DANECode = daneCode.destination;
                  
      // FUNCIONA - JARD
      const codigoShipment = await shipment('DEPRISA', dat);
      await delay(1000);
      // Aquí usas el código del shipment como dato para la etiqueta
      const codigoEtiqueta = await label('DEPRISA', { "codigo": codigoShipment.data.code });
      
      const package = [{}];
    
      const Ship = new shipments(
        ShipmentDB(depcoId, dat, codigoShipment.data.code, package, codigoEtiqueta)
      );

      Ship.save();
    
      proceso.NumGuia = Ship.shipment.ShipmentCode
      dat.Provider.ShipCod = Ship.shipment.ShipmentCode
      proceso.DB = Ship.ShipmentID;

      //TODO: PASARELA DE PAGO (paymentGateway) A SHIPMENT Y ACTUALIZA billPayment
      const payGateway = {
        ShipmentID: Ship.ShipmentID,
        ShipmentCode: Ship.shipment.ShipmentCode,
        PaymentType: Ship.billPayment.paymentType,
        ReferenceCodePay: dat.Shipments.ReferenceCodePay,
        PaymentMethod: dat.Shipments.PaymentMethod,
        Payment: dat.Shipments.Payment,
        PaymentConfirmation:  dat.Shipments.PaymentConfirmation,
        shippingValue: Ship.Provider.shippingValue
      };
      console.log('Paso : 4', )

      const resPayGate = await PayShipment(payGateway).then(result => {
        return result;
      });

      const payGateWay = {
        billPayment: resPayGate.billPayment.paymentType,
        paymentCash: resPayGate.statusCompany.paymentCash,
      };
      proceso.payGateway = payGateWay;

      if (dat.Pickup.PickupRequired === true) {
        const recogida1 = await recogida('DEPRISA', dat);        
        // console.log(recogida1)
        const PickupCode = recogida1;  
        
        if(PickupCode.data.status == 200)
        {
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
          proceso.pickup = recogida1;   
        }
        else{
          const dataLabel = {
            rotulos: `Error al solicitar la recogida ${PickupCode.data.status} (${PickupCode.data.message})` 
          };
          proceso.pickup = dataLabel  
          PickupCode = `Error al solicitar la recogida (${PickupCode.data.status})`;
        }
      } else {
        const dataLabel = {
          rotulos: 'No Se Solicito Recolección' 
        };
        proceso.pickup = dataLabel
        PickupCode = 'No Se Solicito Recolección';
      }

      //TODO: ENVIO DE CORREO ELECTRONICO      
      // const dataMail = await DataSendMails(dat, cdrcoId);
      const tipGuia = 'guia';
      const guia = await converterPDF(codigoEtiqueta.code,depcoId, tipGuia);
      console.log('Paso Paquete : 7', )
      const rutaPdf = await guardarDocumentoBase64(codigoEtiqueta.code, depcoId, tipGuia)
      console.log('Paso Paquete : 8',rutaPdf )
      proceso.guia = rutaPdf
      const mailData = {
        coid: depcoId,
        ShipmentCode: Ship.shipment.ShipmentCode,
        PickupCode: PickupCode,
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
      const SendMailers = SendMails(mailData, guia);
      proceso.email = await SendMailers.then(result => {
        return result;
      });
     
      return({
        ok: true,
        msg: proceso
      });
  

      // FUNCIONA JARD
            // let codigoShipment1 = '';            
    
            // shipment('DEPRISA', dat)
            //     .then(codigoShipment => {
            //       codigoShipment1 = codigoShipment.data.code;
            //       return label('DEPRISA', { "codigo": codigoShipment1 });
            //     })
            //     .then(codigo => {
            //       const package = [{}];
    
            //       const ShipCDR = new shipments(
            //         ShipmentDB(cdrcoId, dat, codigoShipment1, package, codigo)
            //       );
    
            //       ShipCDR.save();
    
            //       return ShipCDR;
    
            //     }).then(Ship => {
            //       // ShipResCDR.push(ShipCDR);                  
            //       proceso.NumGuia = Ship.shipment.ShipmentCode
            //       dat.Provider.ShipCod = Ship.shipment.ShipmentCode
            //       proceso.DB = Ship.ShipmentID;

            //       return({
            //         ok: true,
            //         msg: proceso
            //       });

            //       // ShipResCDR.push(ShipCDR);                  
            //       // proceso.NumGuia = ShipResCDR[0].shipment.ShipmentCode
            //       // dat.Provider.ShipCod = ShipResCDR[0].shipment.ShipmentCode
            //       // proceso.DB = ShipResCDR[0].ShipmentID;
            //     })          
            //     .catch(error => {
            //         console.error(error);                    
            //     });



      // const codigoEtiqueta = await label('DEPRISA', codigoShipment);

      // console.log(codigoEtiqueta);

      // const package = [{}];

      // const ShipCDR = new shipments(
      //   ShipmentDB(cdrcoId, dat, codigoShipment, package, codigoEtiqueta)
      // );

      // codigoShipment.then(response => {
      //   const codigoEtiqueta = label('DEPRISA', bus, uid, dat)
      // })

      
      // console.log('req1CDR: ', req1CDR);
      // // Generar el Rotulo del envio
      // const req2CDR = await REQ_2_ShipmentCDR(req1CDR);
      // console.log('req2CDR: ', req2CDR.rotulos);
      // // Solicitar Recoleccion del Paquete
      // // 
      
      // //TODO: CARGAR DATOS A ShipmentDBCDR
      
      
      // const ShipmentCode = req1CDR.ShipmentCode;
      // const label = req2CDR.rotulos;
              
      // const package = [{}];

      // const ShipCDR = new shipments(
      //   ShipmentDBCDR(cdrcoId, dat, ShipmentCode, package, req2CDR)
      // );
      // console.log('Paso 1: ', )

      // await ShipCDR.save();
      // console.log('Paso 2: ', )
      // ShipResCDR.push(ShipCDR);
      // // console.log(ShipResCDR);
      // proceso.NumGuia = ShipResCDR[0].shipment.ShipmentCode
      // dat.Provider.ShipCod = ShipResCDR[0].shipment.ShipmentCode
      // proceso.DB = ShipResCDR[0].ShipmentID;
      // console.log('Paso 3: ', ) 

      // //TODO: PASARELA DE PAGO (paymentGateway) A SHIPMENT Y ACTUALIZA billPayment
      // const payGateway = {
      //   ShipmentID: ShipResCDR[0].ShipmentID,
      //   ShipmentCode: ShipResCDR[0].shipment.ShipmentCode,
      //   PaymentType: ShipResCDR[0].billPayment.paymentType,
      //   ReferenceCodePay: dat.Shipments.ReferenceCodePay,
      //   PaymentMethod: dat.Shipments.PaymentMethod,
      //   Payment: dat.Shipments.Payment,
      //   PaymentConfirmation:  dat.Shipments.PaymentConfirmation,
      //   shippingValue: ShipResCDR[0].Provider.shippingValue
      // };
      // console.log('Paso : 4', )

      // const resPayGate = await PayShipment(payGateway).then(result => {
      //   return result;
      // });


      // console.log('Paso : 5', )

      // const payGateWay = {
      //   billPayment: resPayGate.billPayment.paymentType,
      //   paymentCash: resPayGate.statusCompany.paymentCash,
      // };
      // proceso.payGateway = payGateWay;
      // console.log('Paso : 6', )

      // //TODO: SOLICITUD DE RECOLECCION PARA COORDINADORA

      // if (dat.Pickup.PickupRequired === true) {
      //   const req3CDR = await REQ_3_ShipmentCDR(dat);
      //   console.log('Paso Documento : 7', )
      //   // console.log(req3CDR)
      //   const PickupCode = req3CDR;   
      //   const updatedValuesPickup = {
      //     $set: {
      //       Pickup: {
      //           PickupRequired: true,
      //           PickupCode: PickupCode,
      //           PickupDate: dat.Pickup.DateTime,
      //           PickCDRtartTime: dat.Pickup.TimeStart,
      //           PickupEndTime: dat.Pickup.TimeEnd,
      //           PickupAutomatic: true,
      //           PickupContactName: dat.Pickup.ContactName,
      //           PickupPhoneNumber: dat.Pickup.ContactPhone,
      //           PickupAddress: dat.Pickup.Address,
      //           PickupAddressDetails: dat.Pickup.AddressAdditional,
      //           PickupAddressDetails2: dat.Pickup.AddressAdditional1,
      //           PickupNotes: dat.Pickup.Comments,
      //           dateCreate: fchHH,
      //       },
      //       statusPickup: true
      //     }
      //   };
      //   const options = { CDRert: true, returnOriginal: false };
      //     console.log('Paso Documento : 8', )
      //   proceso.pickup = req3CDR;      
      // } else {
      //   const dataLabel = {
      //     rotulos: 'No Se Solicito Recolección' 
      //   };
      //   proceso.pickup = dataLabel
      // }




//JARD OK HASTA AQUI
















      
      // //TODO: ENVIO DE CORREO ELECTRONICO
      
      // // const dataMail = await DataSendMails(dat, cdrcoId);
      // const tipGuia = 'guia';
      // const guia = await converterPDF(label,cdrcoId, tipGuia);
      // console.log('Paso Paquete : 7', )
      // const rutaPdf = await guardarDocumentoBase64(label, cdrcoId, tipGuia)
      // console.log('Paso Paquete : 8',rutaPdf )
      // proceso.guia = rutaPdf
      // const mailData = {
      //   coid: cdrcoId,
      //   ShipmentCode: ShipResCDR[0].shipment.ShipmentCode,
      //   PickupCode: PickupCode || 'No se Solicito Recoleccion',
      //   origin: {
      //     name: dat.Origin.ContactName,
      //     business: dat.Origin.CompanyName,
      //     email: dat.Origin.ContactEmail,
      //     country: dat.Origin.CountryCode,
      //     city: dat.Origin.CityName,
      //     PostalCode: dat.Origin.PostalCode

      //   },
      //   destination: {
      //     name: dat.Destination.ContactName,
      //     business: dat.Destination.CompanyName,
      //     email: dat.Destination.ContactEmail,
      //     country: dat.Destination.CountryCode,
      //     city: dat.Destination.CityName,
      //     PostalCode: dat.Destination.PostalCode
      //   },
      //   shipment: {
      //       PackQuantity: dat.Shipments.Shipment.PackQuantity,
      //       Weight: dat.Shipments.Shipment.Weight,
      //       DeclaredValue: dat.Shipments.Shipment.DeclaredValue,
      //       Content: dat.Shipments.Shipment.Content,
      //       Reference: dat.Shipments.Shipment.Reference        
      //   },
      //   provider: {
      //     partner: dat.Provider.partners,
      //     service: dat.Provider.serviceName,
      //     arrivalDate: dat.Provider.deliveryDate,
      //     shippingValue: dat.Provider.shippingValue,
      //   },
      // }
      // console.log('Paso Paquete : 9', )      

      // const SendMailers = SendMails(mailData, guia);
      // proceso.email = await SendMailers.then(result => {
      //   return result;
      // });
      // console.log('Paso Paquete : 10', proceso)

      // return({
      //   ok: true,
      //   msg: proceso
      // });


      // return proceso;
    // } 
  } catch (error) {
    // Handle errors
    applogger.error(`Error en shipmentDHL > creacion de promesa, error: ${error}`);

    return({
    ok: false,
    msg: `Error en shipmentDHL -> ${error}`
    });
  }
}


module.exports = {
  shipmentApiGateway,
};

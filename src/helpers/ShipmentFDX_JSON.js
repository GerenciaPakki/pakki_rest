const { response } = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');
const { DateTime } = require('luxon');
const uuid = require('uuid');
const { FDX_URL_XML, FDX_ACCOUNT_CO } = require('../utils/config');
const { getShipmentFDX, preShipmentDBFDX } = require('../structures/json/shipmentFDX');
const TokensAuth = require('../models/tokensAuth');
const shipments = require('../models/shipments');
const { PayShipment } = require('./payGateway');
const { PickupDBFDX } = require('../structures/json/pickupFDX');
const { PickupFDX } = require('./pickupFDX');
const { GenerateID } = require('./pakkiSecutivo');
const { SurchargePakkiFDX } = require('./companySurcharges');
const {
  REQ_1_ShipmenDomestic_JSON_FDX,
  REQ_2_ShipmentFDX,
  REQ_Hit_ShipmentFDX,
  REQ_Pickup_ShipmentFDX,
  REQ_1_ShipmentFDX_PGK
} = require('./saveShipmentFDX_JSON');
const { converterPDF, guardarDocumentoBase64, guardarPkgsBase64, CartaResponsabilidadPDF, GetCartaResponsabilidadPDF } = require('./convertToPDF');
const { SendMails, SendMailsPkg } = require('./sendMail');
const { applogger } = require('../utils/logger');


// Creating a date time object
const date = DateTime.local();
const fchHH = date.toISO({ includeOffset: true });

async function generateID() {
  const id = await GenerateID();
  return `fdxco-${id}`;
}

async function shipmentFDX(shipper, recipient, shipment, Pickup, Provider, company, dat) {

  // try {
    // Agrega el prefijo "fdxco" al UUID
    const fdxcoId = await generateID();
      
    const accountNumber = FDX_ACCOUNT_CO //Reggaly Produccion: "203128530"; //Reggaly SANCBOX "740561073"
    let pkgType = '';
    const {
      weight,
      length,
      width,
      height
    } = shipment;

    const volumetricWeight = ((length * width * height) / 5000);

    if (dat.Shipments.description === '' || shipment.description === '') {
      dat.Shipments.description = 'Informacion personal'
      shipment.description = 'personal'
    }

    if (shipper.countryCode === "CO" && recipient.countryCode === "CO") {

      // console.log('Es Tipo documento?: ', volumetricWeight, shipment.documentShipment)
      
      if (weight === 0.5 && volumetricWeight <= 0.5 && shipment.documentShipment) {
        pkgType = "FEDEX_ENVELOPE";
      } else if ((weight >= 0.5 && weight <= 2) || (volumetricWeight >= 0.5 && volumetricWeight <= 2)) {
        pkgType = "YOUR_PACKAGING";
      } else if ((weight >= 2.5 && weight <= 3.5) || (volumetricWeight >= 2.5 && volumetricWeight <= 3.5)) {
        pkgType = "YOUR_PACKAGING";
      } else if ((weight >= 4 && weight <= 9) || (volumetricWeight >= 4 && volumetricWeight <= 9)) {
        pkgType = "YOUR_PACKAGING";
      } else if ((weight >= 9.5) || (volumetricWeight >= 9.5)) {
        pkgType = "YOUR_PACKAGING";
      } else {
        pkgType = "YOUR_PACKAGING";
      }
      // console.log('Es Tipo Paquete: ', pkgType)
      shipment.packagingType = pkgType;
      if (dat.Shipments.documentShipment === true) {
        dat.Shipments.DocumentContent = 'DOCUMENTS';
      } else {
        dat.Shipments.DocumentContent = 'NON_DOCUMENTS';
      }

      

      // Validamos que si el valor Declarado es menor del tope max lo llevamos al Maximo permitido sin cubir el valor del envio
      if (shipments.declaredValue < 100 && shipments.insuranceCurrency === 'USD' && shipments.documentShipment === true) {
        shipment.insurance = 100;
      } else if (shipments.declaredValue < 10000 && shipments.insuranceCurrency === 'COP' && shipments.documentShipment === true) {
        shipment.insurance = 10000;
      }   
      
      let req2FDX = {};
      const proceso = {
        NumGuia: "",
        DB: "",
        payGateway: "",
        pickup: "",
        email: "",
        errores: []
      };
      let req1FDX = '';
      let ShipmentID = ''
      let ShipmentCode = ''
      let SendMailers = ''
      let payGateway = {}
      let PayGateWayCustom = {}
      let pickFDX = '';
      let req2PickupFDX = '';
      let label = '';
      let packageLabel = '';
      let rutaPdfProforma = '';

      // console.log('fdxcoId: ', fdxcoId)

      req1FDX = await REQ_1_ShipmenDomestic_JSON_FDX(accountNumber, shipper, recipient, shipment, dat, fdxcoId);
      console.log('req1FDX: ', req1FDX);
      label = req1FDX[0].label;
      proceso.NumGuia = req1FDX[0].ShipmentCode
      packageLabel = req1FDX[0].packageLabel;



      ShipmentID = fdxcoId;
      ShipmentCode = req1FDX[0].ShipmentCode
      payGateway = {
        ShipmentID: fdxcoId,
        ShipmentCode: req1FDX[0].ShipmentCode,
        PaymentType: req1FDX[0].PaymentType,
        ReferenceCodePay: dat.Shipments.ReferenceCodePay,
        PaymentMethod: dat.Shipments.PaymentMethod,
        Payment: dat.Shipments.Payment,
        PaymentConfirmation: dat.Shipments.PaymentConfirmation,
        shippingValue: req1FDX[0].shippingValue
      };
      proceso.DB = fdxcoId;

      // console.log('payGateway: ', payGateway);
      // console.log('proceso: ', proceso);

      // //TODO: PAGO EXITOSO! (SI SE REQUIERE) GENERAR PICKUP Y ACTUALIZA DATOS DE SHIPMENT PICKUP
      const resPayGate = await PayShipment(payGateway).then(result => {
        return result;
      });

      PayGateWayCustom = {
        billPayment: resPayGate.billPayment.paymentType,
        paymentCash: resPayGate.statusCompany.paymentCash,
      };
      proceso.payGateway = PayGateWayCustom;

      // console.log('PayGateWayCustom: ', PayGateWayCustom);
      // console.log('proceso: ', proceso);

      //TODO: GENERAR PICKUP Y ACTUALIZA DATOS DE SHIPMENT PICKUP
      req2FDX = await REQ_Pickup_ShipmentFDX(dat, ShipmentID, accountNumber, Pickup, shipment, ShipmentCode)
      // console.log('req2FDX: ', req2FDX)

      if (req2FDX.ok === false) {
        req2PickupFDX = {
          error: req2FDX.msg,
          Notifications: req2FDX.msg,
        };
      } else if (req2FDX.ok === true) {
        pickFDX = {
          PickupCode: 'El codigo de Recolección es: ' + req2FDX.msg.Pickup.PickupCode,
          Pickuplocation: 'Localizacion de Recolección es: ' + req2FDX.msg.Pickup.Pickuplocation
        }
      } else if (req2FDX === undefined) {
        pickFDX = {
          PickupCode: 'No se Solicito Recolección al Proveedor'
        }
      }
      proceso.pickup = pickFDX || req2PickupFDX

      // TODO: pasamos los archivos a PDF para adjuntar al Email.

      const tipGuia = 'guia';
      guia = await converterPDF(label, fdxcoId, tipGuia)
      // console.log('Las guia: ', guia);
      rutaPdf = await guardarDocumentoBase64(label, fdxcoId, tipGuia)
      // console.log('Las rutaPdf: ', rutaPdf);
      proceso.guia = rutaPdf

      mailData = {
        coid: fdxcoId,
        ShipmentCode: ShipmentCode,
        PickupCode: proceso.pickup.ConfirmationNumber || 'No se Solicito Recolección',
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
      SendMailers = SendMails(mailData, guia);

      proceso.email = await SendMailers.then(result => {
        return result;
      });

      // if(this.exitoso){
        return{
          ok: true,
          msg: proceso
        };
      // }
      // else{
      //   return{
      //     ok: false,
      //     msg: proceso
      //   };
      // }

      // return proceso

    } else if ((shipper.countryCode === "CO" && recipient.countryCode !== "CO") || (shipper.countryCode !== "CO" && recipient.countryCode === "CO" )) {

      const volumetricWeight = ((length * width * height) / 5000);

      if (weight === 0.5 && volumetricWeight <= 0.5 && shipment.documentShipment) {
        pkgType = "FEDEX_ENVELOPE";
      } else if ((weight >= 0.5 && weight <= 2) && !shipment.documentShipment || (volumetricWeight >= 0.5 && volumetricWeight <= 2) && !shipment.documentShipment) {
        pkgType = "FEDEX_PAK";
      } else if ((weight >= 2.5 && weight <= 3.5) || (volumetricWeight >= 2.5 && volumetricWeight <= 3.5)) {
        pkgType = "FEDEX_BOX";
      } else if ((weight >= 4 && weight <= 9) || (volumetricWeight >= 4 && volumetricWeight <= 9)) {
        pkgType = "FEDEX_TUBE";
      } else if ((weight >= 9.5) || (volumetricWeight >= 9.5)) {
        pkgType = "YOUR_PACKAGING";
      } else {
        pkgType = "YOUR_PACKAGING";
      }
      shipment.packagingType = pkgType;
      if (dat.Shipments.documentShipment === true) {
        dat.Shipments.DocumentContent = 'DOCUMENTS';
      } else {
        dat.Shipments.DocumentContent = 'NON_DOCUMENTS';
      }

      // console.log('Es Tipo documento?: ', dat.Shipments.documentShipment )
      let req2FDX = {};
      const proceso = {
        NumGuia:"",
        DB: "",
        payGateway: "",
        pickup: "",
        email: "",
        errores: []
      };
      let req1FDX = '';
      let ShipmentID = ''
      let ShipmentCode = ''
      let SendMailers = ''
      let payGateway = {}
      let PayGateWayCustom = {}
      let pickFDX = '';
      let req2PickupFDX = '';
      let label = '';
      let packageLabel = '';
      let rutaPdfProforma = '';
      const Invoice = dat.Shipments.Shipment.Invoice;

      // console.log('fdxcoId: ', fdxcoId)
      
      req1FDX = await REQ_1_ShipmenDomestic_JSON_FDX(accountNumber, shipper, recipient, shipment, dat, fdxcoId);
      // console.log('req1FDX: ', req1FDX);
      label = req1FDX[0].label;
      proceso.NumGuia = req1FDX[0].ShipmentCode
      packageLabel = req1FDX[0].packageLabel;
      
    

      ShipmentID = fdxcoId;
      ShipmentCode = req1FDX[0].ShipmentCode
      payGateway = {
        ShipmentID: fdxcoId,
        ShipmentCode: req1FDX[0].ShipmentCode,
        PaymentType: req1FDX[0].PaymentType,
        ReferenceCodePay: dat.Shipments.ReferenceCodePay,
        PaymentMethod: dat.Shipments.PaymentMethod,
        Payment: dat.Shipments.Payment,
        PaymentConfirmation: dat.Shipments.PaymentConfirmation,
        shippingValue: req1FDX[0].shippingValue
      };
      proceso.DB = fdxcoId;
      

      //TODO: PAGO EXITOSO! (SI SE REQUIERE) GENERAR PICKUP Y ACTUALIZA DATOS DE SHIPMENT PICKUP
      const resPayGate = await PayShipment(payGateway).then(result => {
        return result;
      });
      
      PayGateWayCustom = {
        billPayment: resPayGate.billPayment.paymentType,
        paymentCash: resPayGate.statusCompany.paymentCash,
      };
      proceso.payGateway = PayGateWayCustom;
      

      //TODO: GENERAR PICKUP Y ACTUALIZA DATOS DE SHIPMENT PICKUP
      req2FDX = await REQ_Pickup_ShipmentFDX(dat, ShipmentID, accountNumber, Pickup, shipment, ShipmentCode)
          
      if (req2FDX.ok === false) {
        req2PickupFDX = {
          error: req2FDX.msg,
          Notifications: req2FDX.msg,
        };
      } else if (req2FDX.ok === true) {
        pickFDX = {
          PickupCode: 'El codigo de Recolección es: ' + req2FDX.msg.Pickup.PickupCode,
          Pickuplocation: 'Localizacion de Recolección es: ' + req2FDX.msg.Pickup.Pickuplocation
        }
      } else if (req2FDX === undefined) {
        pickFDX = {
          PickupCode: 'No se Solicito Recolección al Proveedor'
        }
      }
      proceso.pickup = pickFDX || req2PickupFDX
      
      // TODO: pasamos los archivos a PDF para adjuntar al Email.

      
      if (dat.Shipments.documentShipment === true) {
        const tipGuia = 'guia';
        guia = await converterPDF(label, fdxcoId, tipGuia)
        rutaPdf = await guardarDocumentoBase64(label, fdxcoId, tipGuia)
        proceso.guia = rutaPdf

        mailData = {
          coid: fdxcoId,
          ShipmentCode: ShipmentCode,
          PickupCode: proceso.pickup.ConfirmationNumber || 'No se Solicito Recolección',
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
        SendMailers = SendMails(mailData, guia);
        proceso.email = await SendMailers.then(result => {
          return result;
        });
        
      } else {
        //TODO: SI ES PKG TOMA ESTE CAMINO

        const tipGuia = 'guia';      
        guia = await converterPDF(label, fdxcoId, tipGuia);
        rutaPdf = await guardarDocumentoBase64(label, fdxcoId, tipGuia)
        proceso.guia = rutaPdf
        const tipProforma = 'proforma';
        proforma = await converterPDF(packageLabel, fdxcoId, tipProforma);
        rutaPdfProforma = await guardarPkgsBase64(packageLabel, fdxcoId, tipProforma)
        proceso.proforma = rutaPdfProforma
        const carta = await CartaResponsabilidadPDF()
        const sendCarta = await GetCartaResponsabilidadPDF()
        
        proceso.carta = carta
        
        mailData = {
          coid: fdxcoId,
          ShipmentCode: ShipmentCode,
          PickupCode: proceso.pickup.ConfirmationNumber || 'No se Solicito Recolección',
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

        SendMailers = SendMailsPkg(mailData, guia, proforma, sendCarta);
        proceso.email = await SendMailers.then(result => {
          return result;
        });
      }

      // if(this.exitoso){
        return{
          ok: true,
          msg: proceso
        };
      // }
      // else{
      //   return{
      //     ok: false,
      //     msg: proceso
      //   };
      // }


      // return proceso

      

    } else if (shipper.countryCode === "US" && recipient.countryCode === "US") {

        return {
            ok: false,
            msg: 'Aqui vamos con FDX Envios Nacionales desde US'
        };
        
    } else if (shipper.countryCode === "US") {

        return {
          ok: false,
          msg: 'Aqui vamos con FDX Envios Internacional desde US'            
        };      
    }
  // } 
  // catch (error) {
  //   applogger.error(`Error en shipmentFDX > creacion de promesa, error: ${error}`);
  //   return `$Error enviando con FDX: ${error}`;
  // }
}

module.exports = {
    shipmentFDX,
};

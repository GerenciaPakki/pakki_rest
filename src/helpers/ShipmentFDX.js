const fs = require('fs');
const { PayShipment } = require('./payGateway');
const { REQ_1_ShipmentFDX, REQ_2_ShipmentFDX, REQ_1_ShipmentFDX_PGK, REQ_1_ShipmenDomestictFDX, REQ_1_ShipmenDomesticFDX } = require('./saveShipmentFDX');
const { SendMails, SendMailsPkg } = require('./sendMail');
const { converterPDF, guardarDocumentoBase64, guardarPkgsBase64, CartaResponsabilidadPDF, GetCartaResponsabilidadPDF } = require('./convertToPDF');
const { DataSendMails } = require('./emailProvider');

// global.ShipFDX = [];
// global.ProvidersFDX = [];
// global.jsonResFDX = [];
// global.proceso = {
//   DB: false,
//   payGateway: false,
//   pickup: false,
//   email: false,
//   errores: []
// };

async function shipmentFDX_XML(shipper, recipient, shipment, Pickup, Provider, company, dat) {
    
  let pkgType = '';
  const { weight, length, width, height } = shipment;
  const volumetricWeight = ((length * width * height) / 5000);

  if (weight === 0.5 && volumetricWeight <= 0.5 && shipment.documentShipment) {
      pkgType = "FEDEX_ENVELOPE";
    } else if ((weight >= 0.5 && weight <= 2) && !shipment.documentShipment || (volumetricWeight >= 0.5 && volumetricWeight <= 2) && !shipment.documentShipment) {
      pkgType = "FEDEX_PAK";
    } else if ((weight >= 2.5 && weight <= 3.5) || (volumetricWeight >= 2.5 && volumetricWeight <= 3.5)) {
      pkgType = "FEDEX_BOX";
    } else if ((weight >= 4 && weight <= 9) || (volumetricWeight >= 4 && volumetricWeight <= 9)) {
      pkgType = "FEDEX_TUBE";
    } else if ((weight >= 9.5) || (volumetricWeight >= 9.5 )) {
      pkgType = "YOUR_PACKAGING";
    } else {
      pkgType = "YOUR_PACKAGING";
    }
  
  dat.Shipments.packagingType = pkgType;
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


  global.QuotationsArray = [];
  global.ProvidersFDX = [];
  global.jsonResFDX = [];
  global.PickupResFDX = [];
  // global.proceso = {
  //   DB: "",
  //   payGateway: "",
  //   pickup: "",
  //   email: "",
  //   errores: []
  // }
  let fdxcoId = '';
  let pickFDX = ''
  let req1FDX = ''
  let req2FDX = ''
  let payGateway = {}
  let resPayGate = ''
  let guia = ''
  let rutaPdf = ''
  let mailData = ''
  let SendMailers = ''
  let proforma = ''
  let rutaPdfProforma = ''


  if (shipper.countryCode === "CO" && recipient.countryCode === "CO") {
    proceso = {};
    let pkgType = '';
    const { weight, length, width, height } = shipment;
    const volumetricWeight = ((length * width * height) / 5000);

    if (weight === 0.5 && volumetricWeight <= 0.5 && shipment.documentShipment) {
        pkgType = "FEDEX_ENVELOPE";
      } else if ((weight >= 0.5 && weight <= 2) && !shipment.documentShipment || (volumetricWeight >= 0.5 && volumetricWeight <= 2) && !shipment.documentShipment) {
        pkgType = "YOUR_PACKAGING";
      } else if ((weight >= 2.5 && weight <= 3.5) || (volumetricWeight >= 2.5 && volumetricWeight <= 3.5)) {
        pkgType = "YOUR_PACKAGING";
      } else if ((weight >= 4 && weight <= 9) || (volumetricWeight >= 4 && volumetricWeight <= 9)) {
        pkgType = "YOUR_PACKAGING";
      } else if ((weight >= 9.5) || (volumetricWeight >= 9.5 )) {
        pkgType = "YOUR_PACKAGING";
      } else {
        pkgType = "YOUR_PACKAGING";
      }
    
    dat.Shipments.packagingType = pkgType;
    if (dat.Shipments.documentShipment === true) {
      dat.Shipments.DocumentContent = 'DOCUMENTS';    
    } else {
      dat.Shipments.DocumentContent = 'NON_DOCUMENTS';
    }

    req1FDX = await REQ_1_ShipmenDomesticFDX(dat);
    console.log('req1FDX: ', req1FDX)

    if (req1FDX.OK === false) {
      return req1FDX;
    }

    fdxcoId = await req1FDX.fdxcoId;
    const ShipmentID = req1FDX.ShipmentID;
    const label = req1FDX.label.Parts[0].Image[0];
    payGateway = {
      ShipmentID: req1FDX.ShipmentID,
      ShipmentCode: req1FDX.ShipmentCode,
      PaymentType: req1FDX.PaymentType,
      ReferenceCodePay: dat.Shipments.ReferenceCodePay,
      PaymentMethod: dat.Shipments.PaymentMethod,
      Payment: dat.Shipments.Payment,
      PaymentConfirmation:  dat.Shipments.PaymentConfirmation,
      shippingValue: req1FDX.shippingValue,
    };
    proceso.NumGuia = req1FDX.ShipmentCode
    proceso.DB = req1FDX.ShipmentID;
    
    //TODO: PAGO EXITOSO! (SI SE REQUIERE) GENERAR PICKUP Y ACTUALIZA DATOS DE SHIPMENT PICKUP
    resPayGate = await PayShipment(payGateway).then(result => {
      return result;
    });

    const payGateWay = {
        billPayment: resPayGate.billPayment.paymentType,
        paymentCash: resPayGate.statusCompany.paymentCash,
    };
    proceso.payGateway = payGateWay;
    
    // //TODO: GENERAR PICKUP Y ACTUALIZA DATOS DE SHIPMENT PICKUP
    
    req2FDX = await REQ_2_ShipmentFDX(dat, ShipmentID);

    if (req2FDX.OK === false) {
      return req2FDX;
    }

    if (req2FDX.Pickup.PickupRequired === false) {
      // console.log(req2FDX);
      pickFDX = {
        PickupCode: 'No se solicito recoleccion al Proveedor'
      }      
    } else {
      // console.log(req2FDX);
      pickFDX = {
        PickupCode: 'El codigo de Recolección es: ' + req2FDX.Pickup.PickupCode
      }
    }
    

    proceso.pickup = pickFDX;
      
    
    //TODO: ENVIO DE CORREO ELECTRONICO

    const tipGuia = 'guia';
    guia = await converterPDF(label, fdxcoId, tipGuia);
    rutaPdf = await guardarDocumentoBase64(label, fdxcoId, tipGuia)
    proceso.guia = rutaPdf
    mailData = {
      coid: fdxcoId,
      ShipmentCode: req1FDX.ShipmentCode,
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

    return proceso;

  } else if ((shipper.countryCode === "CO" && recipient.countryCode !== "CO") || (shipper.countryCode !== "CO" && recipient.countryCode === "CO")) {
    console.log('Entramos a FDX Creacion de Envios...', )
    proceso = {};
    let req1FDX = '';
    let pickFDX = '';
    let req2PickupFDX = '';
    let label = [{}];
    let package = [{}];
    let fdxcoId = '';

    console.log('Es un Documento...', dat.Shipments.documentShipment)

    if (dat.Shipments.documentShipment === true) {
      req1FDX = await REQ_1_ShipmentFDX(dat); 
      label = req1FDX.label.Parts[0].Image[0];
      fdxcoId = req1FDX.fdxcoId;
      console.log(fdxcoId)
      proceso.NumGuia = req1FDX.ShipmentCode
  } else {
    //TODO: SI ES PKG TOMA ESTE CAMINO
      req1FDX = await REQ_1_ShipmentFDX_PGK(dat)
      fdxcoId = await req1FDX.fdxcoId;
      if (req1FDX.OK === false) {
        return {
          ok: false,
          msg: req1FDX.Message
        };
      }
      package = req1FDX.package.Parts[0].Image[0];
      label = req1FDX.label.Parts[0].Image[0];
      proceso.NumGuia = req1FDX.ShipmentCode
  }
    const ShipmentID = req1FDX.ShipmentID;   
        
    const payGateway = {        
        ShipmentID: req1FDX.ShipmentID,
        ShipmentCode: req1FDX.ShipmentCode,
        PaymentType: req1FDX.PaymentType,
        ReferenceCodePay: dat.Shipments.ReferenceCodePay,
        PaymentMethod: dat.Shipments.PaymentMethod,
        Payment: dat.Shipments.Payment,
        PaymentConfirmation:  dat.Shipments.PaymentConfirmation,
        shippingValue: req1FDX.shippingValue
      };
    proceso.DB = req1FDX.ShipmentID;
      
      //TODO: PAGO EXITOSO! (SI SE REQUIERE) GENERAR PICKUP Y ACTUALIZA DATOS DE SHIPMENT PICKUP
      const resPayGate = await PayShipment(payGateway).then(result => {
        return result;
      });
      const payGateWay = {
        billPayment: resPayGate.billPayment.paymentType,
        paymentCash: resPayGate.statusCompany.paymentCash,
      };
      
      proceso.payGateway = payGateWay;
      
    //TODO: GENERAR PICKUP Y ACTUALIZA DATOS DE SHIPMENT PICKUP
    req2FDX = await REQ_2_ShipmentFDX(dat, ShipmentID)
    if( !req2FDX.OK ) {
      req2PickupFDX = {
        error: req2FDX.error,
        Notifications: req2FDX.Notifications,
        Message: req2FDX.Message
      };
    }
    if (req2FDX.statusPickup) {
      pickFDX = {
        PickupCode: 'El codigo de Recolección es: ' + req2FDX.Pickup.PickupCode
      }
    }
    if (!req2FDX.statusPickup) {
      pickFDX = {
        PickupCode: 'No se Solicito Recolección al Proveedor'
      }
    }
    proceso.pickup =  pickFDX || req2PickupFDX
    //TODO: ENVIO DE CORREO ELECTRONICO
    
    // TODO: pasamos los archivos a PDF para adjuntar al Email.
    if (dat.Shipments.documentShipment === true) {      
      const tipGuia = 'guia';
      guia = await converterPDF(label, fdxcoId, tipGuia)
      rutaPdf = await guardarDocumentoBase64(label, fdxcoId, tipGuia)
      proceso.guia = rutaPdf

      mailData = {
        coid: fdxcoId,
        ShipmentCode: req1FDX.ShipmentCode,
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
      proforma = await converterPDF(package, fdxcoId, tipProforma);
      rutaPdfProforma = await guardarPkgsBase64(package, fdxcoId, tipProforma)
      proceso.proforma = rutaPdfProforma
      const carta = await CartaResponsabilidadPDF()
      const sendCarta = await GetCartaResponsabilidadPDF()
      proceso.carta = carta
      mailData = {
        coid: fdxcoId,
        shipmentID: req1FDX.ShipmentCode,
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
      
      SendMailers = SendMailsPkg(mailData, guia, proforma,sendCarta);
      proceso.email = await SendMailers.then(result => {
          return result;
      });
    }
    return proceso

  } else if (shipper.countryCode === "US" && recipient.countryCode === "US") {

      return {
          msg: 'Aqui vamos con FDX Envios Nacionales desde US'
      };
      
  } else if (shipper.countryCode === "US") {

      return {
          msg: 'Aqui vamos con FDX Envios Internacional desde US'            
      };
      
  }
}

module.exports = {
    shipmentFDX,
};

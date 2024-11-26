const { DateTime } = require('luxon');
const shipments = require('../models/shipments');
const { REQ_1_ShipmentDHL, REQ_2_ShipmentDHL, REQ_1_ShipmentPKGDHL, REQ_1_ShipmentDHL_IMPORT } = require('./saveShipmentDHL');
const { pakkiSecutivo, generateUID, GenerateID } = require('./pakkiSecutivo');
const { PayShipment } = require('./payGateway');
const { ShipmentDBDHL } = require('../structures/xml/shipDHL');
const { SendMails, SendMailsPkg } = require('./sendMail');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');

const crypto = require('crypto');
const { SurchargePakkiShipmentDHL } = require('./companySurcharges');
const { converterPDF, guardarDocumentoBase64, guardarPkgsBase64, CartaResponsabilidadPDF, GetCartaResponsabilidadPDF } = require('./convertToPDF');
const { DataSendMails } = require('./emailProvider');
const { applogger } = require('../utils/logger');


const randomBuffer = crypto.randomBytes(1);
const consecu = randomBuffer[0] / 255;

id = "";
setTimeout(() => {
    randomNumber = null; // borrar el valor de la variable global después de 1 segundo
}, 1000);

async function shipmentDHL(dat) {
    
    try {
        const GenerateId = await GenerateID()
        const dhlcoId = `dhlco-${GenerateId}`;

        const PickupRequired = dat.Pickup.PickupRequired;

        const Weight = dat.Shipments.Shipment.Weight
        const Domestic = dat.Shipments.documentShipment

        
        if (dat.Origin.CountryCode === "CO" && dat.Destination.CountryCode !== "CO" ) {
            
            let mailData = {}
            let payGateway = {}
            let ShipResDHL = [];
            const proceso = {
                DB: "",
                NumGuia: "",
                payGateway: "",
                pickup: "",
                email: "",
                guia: "",
                proforma: "",
                carta: "",
                errores: []
            };
            let req1DHL = '';
            let ShipDHL = '';
            let payGateWay = {};
            let guia = '';
            let rutaPdf = '';
            let SendMailers = '';
            let ShipmentCode = '';
            let shippingValue = {};
            let ServiceType = {};
            let SurchargePakki = {};
            let label = {};
            let package = {};
            let ShipDHLDB = {};
            let resPayGate = {};

            applogger.info('Exportacion')

            if (dat.Shipments.documentShipment === true) {
                return new Promise(async (resolve, reject) => {
                
                    try {
                        applogger.info('Generar guia')
                        req1DHL = await REQ_1_ShipmentDHL(dat);
                        applogger.info('Genrerar guia realizado: ' + req1DHL)
                        // console.log('req1DHL: ', req1DHL)
                        //TODO: CARGAR DATOS A ShipmentDBDHL
                        // console.log('dat.Provider.ShipCod: ', dat.Provider.ShipCod)
                        dat.Provider.ShipCod = req1DHL.AirwayBillNumber[0]
                        // console.log('req1DHL.AirwayBillNumber[0]: ', req1DHL.AirwayBillNumber[0])

                        shippingValue = req1DHL.ShippingCharge[0];
                        ServiceType = req1DHL.ProductShortName[0];
                        applogger.info('Calcular tarifa')
                        SurchargePakki = await SurchargePakkiShipmentDHL(ServiceType, shippingValue, Domestic, Weight);
                        applogger.info('Calcular tarifa realizado: ' + SurchargePakki)
                        ShipmentCode = req1DHL.AirwayBillNumber[0];
                        label = req1DHL.LabelImage[0].OutputImage[0];
                        package = [{}];

                        applogger.info('Crear solicitud de compra de servicio')
                        ShipDHL = new shipments(
                            ShipmentDBDHL(dhlcoId, dat, ShipmentCode, label, package, req1DHL, SurchargePakki)
                        );
                        ShipDHLDB = await ShipDHL.save();
                        applogger.info('Crear solicitud de compra de servicio, realizada.')
                        ShipResDHL.push(ShipDHLDB);
                        proceso.DB = ShipResDHL[0].ShipmentID;

                        payGateway = {
                            ShipmentID: ShipResDHL[0].ShipmentID,
                            ShipmentCode: ShipResDHL[0].shipment.ShipmentCode,
                            PaymentType: ShipResDHL[0].billPayment.paymentType,
                            ReferenceCodePay: dat.Shipments.ReferenceCodePay,
                            PaymentMethod: dat.Shipments.PaymentMethod,
                            Payment: dat.Shipments.Payment,
                            PaymentConfirmation: dat.Shipments.PaymentConfirmation,
                            shippingValue: ShipResDHL[0].Provider.shippingValue
                        };
                        resPayGate = await PayShipment(payGateway).then(result => {
                            return result;
                        });

                        payGateWay = {
                            billPayment: resPayGate.billPayment.paymentType,
                            paymentCash: resPayGate.statusCompany.paymentCash,
                        };
                        proceso.payGateway = payGateWay;
                        proceso.NumGuia = req1DHL.AirwayBillNumber[0]
                        applogger.info('Generacion de guia: ' + NumGuia);
                        //TODO: SOLICITUD DE RECOLECCION PARA DHL

                        if (dat.Pickup.PickupRequired === true) {
                            const req2DHL = await REQ_2_ShipmentDHL(dat)
                            const PickupCode = req2DHL.ConfirmationNumber;
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
                                        dateCreate: marcaDeTiempo,
                                    },
                                    statusPickup: true
                                }
                            };
                            const options = {
                                CDRert: true,
                                returnOriginal: false
                            };
                            const ShipPickupUpdate = await shipments.findOneAndUpdate({
                                    ShipmentID: dhlcoId
                                },
                                updatedValuesPickup, options);
                            proceso.pickup = req2DHL
                        } else {
                            pickDHL = {
                                PickupCode: 'No se Solicito Recolección al Proveedor'
                            }
                            proceso.pickup = pickDHL
                        }


                        //TODO: ENVIO DE CORREO ELECTRONICO
                        const tipGuia = 'guia';
                        guia = await converterPDF(label, dhlcoId, tipGuia);
                        applogger.info('Generacion de pdf');
                        rutaPdf = await guardarDocumentoBase64(label, dhlcoId, tipGuia)
                        applogger.info('Guardar pdf ruta');
                        proceso.guia = rutaPdf

                        

                        // TODO: pasamos los archivos a PDF para adjuntar al Email.
                        mailData = {
                            coid: dhlcoId,
                            ShipmentCode: ShipResDHL[0].shipment.ShipmentCode,
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
                        applogger.info('Enviado correo: ' + SendMailers);
                        proceso.email = await SendMailers.then(result => {
                            return result;
                        });
                        applogger.info('Proceso terminado: ');
                        resolve(proceso);
                    } catch (error) {
                        reject(error);
                    }
                })
                

            } else {
                let ShipResDHL = [];
                let proceso = {
                    DB: "",
                    NumGuia: "",
                    payGateway: "",
                    pickup: "",
                    email: "",
                    guia: "",
                    proforma: "",
                    carta: "",
                    errores: []
                };
                let req1DHL = '';
                let ShipDHL = '';
                let payGateWay = {};
                let guia = '';
                let rutaPdf = '';
                let SendMailers = '';
                let ShipmentCode = '';
                //TODO: SI ES PKG TOMA ESTE CAMINO
                req1DHL = await REQ_1_ShipmentPKGDHL(dat);
                // console.log('req1DHL: ', req1DHL.AirwayBillNumber[0])
                dat.Provider.ShipCod = req1DHL.AirwayBillNumber[0]
                
                const shippingValue = req1DHL.ShippingCharge[0];
                const ServiceType = req1DHL.ProductShortName[0];
                const SurchargePakki = await SurchargePakkiShipmentDHL(ServiceType,shippingValue,Domestic,Weight);
                // console.log(SurchargePakki)
                
                ShipmentCode = req1DHL.AirwayBillNumber[0];
                const label = req1DHL.LabelImage[0];
                const package = req1DHL.LabelImage[0].MultiLabels[0].MultiLabel[0];

                ShipDHL = new  shipments(
                    ShipmentDBDHL(dhlcoId, dat, ShipmentCode, label, package, req1DHL,SurchargePakki)
                )

                await ShipDHL.save();
                ShipResDHL.push(ShipDHL);
                proceso.DB = ShipResDHL[0].ShipmentID;

                payGateway = {
                    ShipmentID: ShipResDHL[0].ShipmentID,
                    ShipmentCode: ShipResDHL[0].shipment.ShipmentCode,
                    PaymentType: ShipResDHL[0].billPayment.paymentType,
                    ReferenceCodePay: dat.Shipments.ReferenceCodePay,
                    PaymentMethod: dat.Shipments.PaymentMethod,
                    Payment: dat.Shipments.Payment,
                    PaymentConfirmation:  dat.Shipments.PaymentConfirmation,
                    shippingValue: ShipResDHL[0].Provider.shippingValue
                };
                const resPayGate = await PayShipment(payGateway).then(result => {
                    return result;
                });

                payGateWay = {
                    billPayment: resPayGate.billPayment.paymentType,
                    paymentCash: resPayGate.statusCompany.paymentCash,
                };
                proceso.payGateway = payGateWay;
                proceso.NumGuia = ShipmentCode

                //TODO: SOLICITUD DE RECOLECCION PARA DHL

                req2DHL = await REQ_2_ShipmentDHL(dat,proceso.NumGuia);
                const PickupCode = req2DHL.ConfirmationNumber;
                ('Solicitud de recoleccion: ' + PickupCode);
                updatedValuesPickup = {
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
                            dateCreate: marcaDeTiempo,
                        },
                        statusPickup: true
                    }
                };
                const options = { CDRert: true, returnOriginal: false };
                ShipPickupUpdate = await shipments.findOneAndUpdate({ ShipmentID: dhlcoId },
                    updatedValuesPickup, options);
                proceso.pickup = req2DHL;

                //TODO: ENVIO DE CORREO ELECTRONICO
                // TODO: pasamos los archivos a PDF para adjuntar al Email.
                

                const tipGuia = 'guia';
                guia = await converterPDF(label.OutputImage[0], dhlcoId, tipGuia);
                applogger.info('Generar pdf: ');
                rutaPdfGuia = await guardarDocumentoBase64(label.OutputImage[0], dhlcoId, tipGuia);
                applogger.info('Guardar pdf ruta');
                const tipProforma = 'proforma';
                proforma = await converterPDF(package.DocImageVal[0], dhlcoId, tipProforma);
                applogger.info('Guardar proforma.');
                rutaPdfProforma = await guardarPkgsBase64(package.DocImageVal[0], dhlcoId, tipProforma)
                applogger.info('Guardar proforma.');
                proceso.guia = rutaPdfGuia
                proceso.proforma = rutaPdfProforma
                const carta = await CartaResponsabilidadPDF()
                applogger.info('Generar carta de responsanilidades: ' + carta);
                const sendCarta = await GetCartaResponsabilidadPDF()
                applogger.info('Guardar carta de responsanilidades: ' + sendCarta);
                proceso.carta = carta
                let mailData = {}
                mailData = {
                    coid: dhlcoId,
                    ShipmentCode: ShipmentCode,
                    PickupCode: PickupCode || 'No se Solicito Recolección',
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
                applogger.info('Enviar email.');
                SendMailers = await SendMailsPkg(mailData, guia, proforma, sendCarta);
                applogger.info('Email enviado.' + SendMailers);
                // console.log('SendMailers: ', SendMailers)
                proceso.email = SendMailers
                
                applogger.info('Proceso terminado.');

                return({
                    ok: true,
                    msg: proceso
                });                          
            }
        } else if (dat.Destination.CountryCode === "CO" && dat.Origin.CountryCode !== "CO") {

            let mailData = {}
            let payGateway = {}
            let ShipResDHL = [];
            const proceso = {
                DB: "",
                NumGuia: "",
                payGateway: "",
                pickup: "",
                email: "",
                guia: "",
                proforma: "",
                carta: "",
                errores: []
            };
            let req1DHL = '';
            let ShipDHL = '';
            let payGateWay = {};
            let guia = '';
            let rutaPdf = '';
            let SendMailers = '';
            let ShipmentCode = '';
            let shippingValue = {};
            let ServiceType = {};
            let SurchargePakki = {};
            let label = {};
            let package = {};
            let ShipDHLDB = {};
            let resPayGate = {};

            applogger.info('Importacion')

            if (dat.Shipments.documentShipment === true) {
                fo('Importacion documento')
                return new Promise(async (resolve, reject) => {
                
                    try {

                        req1DHL = await REQ_1_ShipmentDHL_IMPORT(dat);
                        dat.Provider.ShipCod = req1DHL.AirwayBillNumber[0]

                        shippingValue = req1DHL.ShippingCharge[0];
                        ServiceType = req1DHL.ProductShortName[0];
                        SurchargePakki = await SurchargePakkiShipmentDHL(ServiceType, shippingValue, Domestic, Weight);

                        ShipmentCode = req1DHL.AirwayBillNumber[0];
                        label = req1DHL.LabelImage[0].OutputImage[0];
                        package = [{}];

                        ShipDHL = new shipments(
                            ShipmentDBDHL(dhlcoId, dat, ShipmentCode, label, package, req1DHL, SurchargePakki)
                        );
                        ShipDHLDB = await ShipDHL.save();
                        ShipResDHL.push(ShipDHLDB);
                        proceso.DB = ShipResDHL[0].ShipmentID;

                        payGateway = {
                            ShipmentID: ShipResDHL[0].ShipmentID,
                            ShipmentCode: ShipResDHL[0].shipment.ShipmentCode,
                            PaymentType: ShipResDHL[0].billPayment.paymentType,
                            ReferenceCodePay: dat.Shipments.ReferenceCodePay,
                            PaymentMethod: dat.Shipments.PaymentMethod,
                            Payment: dat.Shipments.Payment,
                            PaymentConfirmation: dat.Shipments.PaymentConfirmation,
                            shippingValue: ShipResDHL[0].Provider.shippingValue
                        };
                        resPayGate = await PayShipment(payGateway).then(result => {
                            return result;
                        });

                        payGateWay = {
                            billPayment: resPayGate.billPayment.paymentType,
                            paymentCash: resPayGate.statusCompany.paymentCash,
                        };
                        proceso.payGateway = payGateWay;
                        proceso.NumGuia = req1DHL.AirwayBillNumber[0]

                        if (dat.Pickup.PickupRequired === true) {
                            const req2DHL = await REQ_2_ShipmentDHL(dat)
                            const PickupCode = req2DHL.ConfirmationNumber;
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
                                        dateCreate: marcaDeTiempo,
                                    },
                                    statusPickup: true
                                }
                            };
                            const options = {
                                CDRert: true,
                                returnOriginal: false
                            };
                            const ShipPickupUpdate = await shipments.findOneAndUpdate({
                                    ShipmentID: dhlcoId
                                },
                                updatedValuesPickup, options);
                            proceso.pickup = req2DHL
                        } else {
                            pickDHL = {
                                PickupCode: 'No se Solicito Recolección al Proveedor'
                            }
                            proceso.pickup = pickDHL
                        }


                        //TODO: ENVIO DE CORREO ELECTRONICO
                        const tipGuia = 'guia';
                        guia = await converterPDF(label, dhlcoId, tipGuia);
                        rutaPdf = await guardarDocumentoBase64(label, dhlcoId, tipGuia)
                        proceso.guia = rutaPdf
                        // TODO: pasamos los archivos a PDF para adjuntar al Email.
                        mailData = {
                            coid: dhlcoId,
                            ShipmentCode: ShipResDHL[0].shipment.ShipmentCode,
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

                        resolve(proceso);
                    } catch (error) {
                        reject(error);
                    }
                })
                

            } else {
                let ShipResDHL = [];
                let proceso = {
                    DB: "",
                    NumGuia: "",
                    payGateway: "",
                    pickup: "",
                    email: "",
                    guia: "",
                    proforma: "",
                    carta: "",
                    errores: []
                };
                let req1DHL = '';
                let ShipDHL = '';
                let payGateWay = {};
                let guia = '';
                let rutaPdf = '';
                let SendMailers = '';
                let ShipmentCode = '';
                //TODO: SI ES PKG TOMA ESTE CAMINO
                req1DHL = await REQ_1_ShipmentPKGDHL(dat);
                // console.log('req1DHL: ', req1DHL.AirwayBillNumber[0])
                dat.Provider.ShipCod = req1DHL.AirwayBillNumber[0]
                
                const shippingValue = req1DHL.ShippingCharge[0];
                const ServiceType = req1DHL.ProductShortName[0];
                const SurchargePakki = await SurchargePakkiShipmentDHL(ServiceType,shippingValue,Domestic,Weight);
                // console.log(SurchargePakki)
                
                applogger.info('Importacion diferente a documento')
                

                ShipmentCode = req1DHL.AirwayBillNumber[0];
                const label = req1DHL.LabelImage[0];
                const package = req1DHL.LabelImage[0].MultiLabels[0].MultiLabel[0];

                ShipDHL = new  shipments(
                    ShipmentDBDHL(dhlcoId, dat, ShipmentCode, label, package, req1DHL,SurchargePakki)
                )

                await ShipDHL.save();
                ShipResDHL.push(ShipDHL);
                proceso.DB = ShipResDHL[0].ShipmentID;

                applogger.info('Se guardo la guia');

                payGateway = {
                    ShipmentID: ShipResDHL[0].ShipmentID,
                    ShipmentCode: ShipResDHL[0].shipment.ShipmentCode,
                    PaymentType: ShipResDHL[0].billPayment.paymentType,
                    ReferenceCodePay: dat.Shipments.ReferenceCodePay,
                    PaymentMethod: dat.Shipments.PaymentMethod,
                    Payment: dat.Shipments.Payment,
                    PaymentConfirmation:  dat.Shipments.PaymentConfirmation,
                    shippingValue: ShipResDHL[0].Provider.shippingValue
                };
                const resPayGate = await PayShipment(payGateway).then(result => {
                    return result;
                });

                payGateWay = {
                    billPayment: resPayGate.billPayment.paymentType,
                    paymentCash: resPayGate.statusCompany.paymentCash,
                };
                proceso.payGateway = payGateWay;
                proceso.NumGuia = ShipmentCode

                applogger.info('Guia No. ' + proceso.NumGuia);

                //TODO: SOLICITUD DE RECOLECCION PARA DHL

                req2DHL = await REQ_2_ShipmentDHL(dat,proceso.NumGuia);
                const PickupCode = req2DHL.ConfirmationNumber;
                updatedValuesPickup = {
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
                            dateCreate: marcaDeTiempo,
                        },
                        statusPickup: true
                    }
                };
                const options = { CDRert: true, returnOriginal: false };
                ShipPickupUpdate = await shipments.findOneAndUpdate({ ShipmentID: dhlcoId },
                    updatedValuesPickup, options);
                proceso.pickup = req2DHL;

                //TODO: ENVIO DE CORREO ELECTRONICO
                // TODO: pasamos los archivos a PDF para adjuntar al Email.
                
                
                const tipGuia = 'guia';
                guia = await converterPDF(label.OutputImage[0], dhlcoId, tipGuia);
                applogger.info('Guia pdf. ' + guia);
                rutaPdfGuia = await guardarDocumentoBase64(label.OutputImage[0], dhlcoId, tipGuia);
                applogger.info('Guardar documento ruta pdf. ' + rutaPdfGuia);
                const tipProforma = 'proforma';
                proforma = await converterPDF(package.DocImageVal[0], dhlcoId, tipProforma);
                rutaPdfProforma = await guardarPkgsBase64(package.DocImageVal[0], dhlcoId, tipProforma)
                applogger.info('Guardar proforms ruta. ' + rutaPdfProforma);
                proceso.guia = rutaPdfGuia
                proceso.proforma = rutaPdfProforma
                const carta = await CartaResponsabilidadPDF()
                const sendCarta = await GetCartaResponsabilidadPDF()
                proceso.carta = carta
                let mailData = {}
                mailData = {
                    coid: dhlcoId,
                    ShipmentCode: ShipmentCode,
                    PickupCode: PickupCode || 'No se Solicito Recolección',
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
                SendMailers = await SendMailsPkg(mailData, guia, proforma, sendCarta);
                
                applogger.info('Envio correo. ' + SendMailers);
                // console.log('SendMailers: ', SendMailers)
                proceso.email = SendMailers
                
                return({
                    ok: true,
                    msg: proceso
                });
                applogger.info('Proceso terminado.');
                // return proceso            
            }
        }
        else if (shipper.countryCode === "US" && recipient.countryCode === "US") {

            return {
                msg: 'Aqui vamos con DHL Envios Nacionales desde US'
            };

        } else if (shipper.countryCode === "US") {

            return {
                msg: 'Aqui vamos con DHL Envios Internacional desde US'
            };

        }
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
    shipmentDHL,
};

const { Schema, model } = require('mongoose');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');

const ShipmentsSchema = Schema({
    ShipmentID: {
        type: String
    },
    // Datos del Aliado y su Sucursal
    business: {
        business: {
            type: Schema.Types.ObjectId,
            ref: 'Business',
            require: true
        },
        brachOffice: {
            type: String,
            require: true
        },
        collaborator: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator',
            require: true
        }, 
    },
    // Datos del Origen del Envio
    origin: {
        cityOrigin: {
            cityName: {
                type: String
            },
            stateOrProvinceCode: {
                type: String
            },
            postalCode: {
                type: String
            },
            countryCode: {
                type: String
            },
            DANECode: {
                type: Number
            }
        },
        sender: {
            ContactName: {
                type: String
            },
            CompanyName: {
                type: String
            },
            Address: {
                type: String
            },
            AddressDetails: {
                type: String
            },
            AddressDetails1: {
                type: String
            },
            PhoneNumber: {
                type: String
            },
            Email: {
                type: String
            },
        }        
    },
    // Datos de quien recepciona el Envio
    Destination: {
        cityDestination: {
            cityName: {
                type: String
            },
            postalCode: {
                type: String
            },
            countryCode: {
                type: String
            },
            DANECode: {
                type: Number
            }
        },
        Receiver: {
            ContactName: {
                type: String
            },
            CompanyName: {
                type: String
            },
            Address: {
                type: String
            },
            AddressDetails: {
                type: String
            },
            AddressDetails1: {
                type: String
            },
            PhoneNumber: {
                type: String
            },
            Email: {
                type: String
            },
        }        
    },
    // Datos del Envio
    shipment: {
        ShipmentCode: {
            type: String
        },
        IsDocument: {
            type: Boolean
        },
        DocumentContent: {
            type: String
        },
        serviceType: {
            type: String
        },
        packagingType: {
            type: String
        },
        description: {
            type: String
        },
        Comments: {
            type: String
        },
        weightUnit: {
            type: String
        },
        weigh: {
            type: Number
        },
        length: {
            type: Number
        },
        width: {
            type: Number
        },
        height: {
            type: Number
        },
        description: {
            type: String
        },
        quantityPackage: {
            type: String
        },
        ReasonDescription: {
            type: String
        },           
        DeclaredValue: {
            type: Number
        },        
        packageLabels: [
            {}],        
        package: [{}], // Este es para almacenar los objetos de paquetes cuando sean 1 o mas
    },
    // Datos del Proveedor Logistico
    Provider: {
        partners: {
            type: String
        },
        serviceType: {
            type: String
        },
        serviceName: {
            type: String
        },
        shipValueNeto: {
            type: String
        },
        packagingType: {
            type: String
        },
        deliveryDate: {
            type: String
        },
        shippingValue: {
            type: String
        },
        PublicAmount: {
            type: String
        },
    },
    // Datos de Recoleccion de ser necesario
    Pickup: {
        PickupRequired: {
            type: Boolean
        },
        PickupCode: {},
        Pickuplocation: {},
        PickupDate: {
            type: String
        },
        PickupStartTime: {
            type: String
        },
        PickupEndTime: {
            type: String
        },
        PickupAutomatic: {
            type: Boolean
        },
        PickupContactName: {
            type: String
        },
        PickupPhoneNumber: {
            type: String
        },
        PickupAddress: {
            type: String
        },
        PickupAddressDetails: {
            type: String
        },
        PickupAddressDetails2: {
            type: String
        },
        PickupNotes: {
            type: String
        },
        dateCreate: {
            type: Date
        },
    },
    // Datos del Costo del Envio
    shippingValue: {
        ProviderAmount: {
            type: String
        },
        FinalUserAmount: {
            type: String
        },
        ConversionRate: {
            type: String
        },
        PublicAmount: {
            type: String
        },
        Currency: {
            type: String
        },

    },
    // En caso de requerir autorizacion para un Sobregiro, Autoriza Pakki
    overdraftApproval: {
        type: String,
        default: false
    },
    // Datos de la Pasarela de pago
    billPayment: {
        paymentType: {
            type: String
        },
        Currency: {
            type: String
        },
        valuePaid: {
            type: String
        },
        Reference: {
            type: String
        },
        Payment: {},
        PaymentConfirmation: {},
        shippingValue: {},
        PaymentReference: {
            type: String
        },
        status: {
            type: String
        },
        Authorization: {
            type: String
        },
        PaymentError: {
            type: String
        },
        dateCreate: {
            type: Date
        },
    },
    // Datos de pago en Efectivo
    statusCompany: {
        paymentCash: {
            type: String,
        },
        Currency: {
            type: String
        },
        valuePaid: {
            type: String
        },
        Reference: {
            type: String
        },
        PaymentType: {
            type: String
        },
        ReferenceCodePay: {
            type: String
        },
        PaymentMethod: {
            type: String
        },
        paymentToPakki: {
            type: Boolean
        },
        dateCreate: {
            type: Date
        },
        dateUpdate: {
            type: Date
        },
    },
    // Estatus del envio, datos que se recopilan de consultar al proveedor
    ShipmentStatus: {
        status: {
            type: String
        },
        codeStatus: {
            type: String
        },
        dateCreate: {
            type: Date
        },
        dateUpdate: {
            type: Date
        },
    },
    // Datos que llegan en la creacion de la guia desde el proveedor
    alerts: [{}],
    // Datos completos del envio almacenados para posterior analisis por parte de Pakki
    respShip: [{}],
    // Errores reportados en la creacion de la guia
    err: {
        provides: {
            type: String
        },
        typeError: {
            type: String
        },
        er: {}
    },
    statusBill: {
        type: Boolean,
        default: false
    },
    statusComp: {
        type: Boolean,
        default: false
    },
    statusPickup: {
        type: Boolean,
        default: false
    },
    // Fecha de creacion del Documento
    dateCreate: {
        type: Date,
        default: marcaDeTiempo
    },
}, { collection: 'shipments' });

ShipmentsSchema.index({
    ShipmentID: 1
});
ShipmentsSchema.index({
    "business.business": 1
});
ShipmentsSchema.index({
    "business.brachOffice": 1
});
ShipmentsSchema.index({
    "business.collaborator": 1
});
ShipmentsSchema.index({
    "origin.cityOrigin.cityName": 1
});
ShipmentsSchema.index({
    "origin.cityOrigin.postalCode": 1
});
ShipmentsSchema.index({
    "origin.cityOrigin.countryCode": 1
});
ShipmentsSchema.index({
    "origin.cityOrigin.DANECode": 1
});
ShipmentsSchema.index({
    "Destination.cityDestination.cityName": 1
});
ShipmentsSchema.index({
    "Destination.cityDestination.postalCode": 1
});
ShipmentsSchema.index({
    "Destination.cityDestination.countryCode": 1
});
ShipmentsSchema.index({
    "Destination.cityDestination.DANECode": 1
});
ShipmentsSchema.index({
    "shipment.ShipmentCode": 1
});
ShipmentsSchema.index({
    "shipment.packagingType": 1
});
ShipmentsSchema.index({
    "shipment.IsDocument": 1
});
ShipmentsSchema.index({
    "shipment.serviceType": 1
});
ShipmentsSchema.index({
    "shipment.description": 1
});
ShipmentsSchema.index({
    "shipment.weightUnit": 1
});
ShipmentsSchema.index({
    "shipment.weigh": 1
});
ShipmentsSchema.index({
    "shipment.length": 1
});
ShipmentsSchema.index({
    "shipment.height": 1
});
ShipmentsSchema.index({
    "Provider.partners": 1
});
ShipmentsSchema.index({
    "Provider.serviceType": 1
});
ShipmentsSchema.index({
    "Provider.serviceName": 1
});
ShipmentsSchema.index({
    "Provider.shipValueNeto": 1
});
ShipmentsSchema.index({
    "Provider.packagingType": 1
});
ShipmentsSchema.index({
    "Provider.deliveryDate": 1
});
ShipmentsSchema.index({
    "Provider.shippingValue": 1
});
ShipmentsSchema.index({
    "Provider.PublicAmount": 1
});
ShipmentsSchema.index({
    "Pickup.PickupRequired": 1
});
ShipmentsSchema.index({
    "shippingValue.ProviderAmount": 1
});
ShipmentsSchema.index({
    "shippingValue.FinalUserAmount": 1
});
ShipmentsSchema.index({
    "shippingValue.ConversionRate": 1
});
ShipmentsSchema.index({
    "shippingValue.PublicAmount": 1
});
ShipmentsSchema.index({
    "shippingValue.Currency": 1
});
ShipmentsSchema.index({
    overdraftApproval: 1
});
ShipmentsSchema.index({
    "billPayment.paymentType": 1
});
ShipmentsSchema.index({
    "billPayment.Currency": 1
});
ShipmentsSchema.index({
    "billPayment.valuePaid": 1
});
ShipmentsSchema.index({
    "billPayment.Reference": 1
});
ShipmentsSchema.index({
    "billPayment.PaymentReference": 1
});
ShipmentsSchema.index({
    "billPayment.status": 1
});
ShipmentsSchema.index({
    "billPayment.dateCreate": 1
});
ShipmentsSchema.index({
    "ShipmentStatus.status": 1
});
ShipmentsSchema.index({
    "ShipmentStatus.codeStatus": 1
});
ShipmentsSchema.index({
    "ShipmentStatus.dateCreate": 1
});
ShipmentsSchema.index({
    "ShipmentStatus.dateUpdate": 1
});
ShipmentsSchema.index({
    statusBill: 1
});
ShipmentsSchema.index({
    statusComp: 1
});
ShipmentsSchema.index({
    statusPickup: 1
});
ShipmentsSchema.index({
    dateCreate: 1
});




ShipmentsSchema.method('toJSON', function() {
    const { __v, _id, pass, ...object } = this.toObject();
    // object.uid = _id;
    return object;
});

module.exports = model('Shipment', ShipmentsSchema);
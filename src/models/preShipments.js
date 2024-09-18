const { Schema, model } = require('mongoose');
const { DateTime } = require("luxon");

// Creating a date time object
let date = DateTime.local();
const dat = date.toISO({ includeOffset: true }); // Ejemplo de salida: "2023-02-28T16:23:45-06:00"
const hrColombia = DateTime.fromISO(dat).minus({ hours: 5 }).toISO({ includeOffset: true });
const preShipmentsSchema = Schema({
    ShipmentID: {
        type: String
    },
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
    shipment: {
        ShipmentCode: {
            type: String
        },
        IsDocument: {
            type: Boolean
        },
        packagingType: {
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
        Comments: {
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
    Provider: {
        partner: {
            type: String
        },
        service: {
            type: String
        },
        arrivalDate: {
            type: String
        },
        shippingValue: {
            type: String
        },
    },
    Pickup: {
        PickupRequired: {
            type: Boolean
        },
        PickupCode: {
            type: String
        },
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
    overdraftApproval: {
        type: String,
        default: false
    },
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
    statusCompany: {
        paymentCash: {
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
        PaymentReference: {
            type: String
        },
        paymentToPakki: {
            type: Boolean
        },
        status: {
            type: String
        },
        dateCreate: {
            type: Date
        },
    },
    ShipmentStatus: {
        type: String
    },
    alerts: [{}],
    respShip:[{}],
    err: {
        provides: {
            type: String
        },
        typeError: {
            type: String
        },
        er: {}
    },
    dateCreate: {
        type: Date,
        default: hrColombia
    },
}, { collection: 'preShipments' });

preShipmentsSchema.method('toJSON', function() {
    const { __v, _id, pass, ...object } = this.toObject();
    // object.uid = _id;
    return object;
});

module.exports = model('PreShipment', preShipmentsSchema);
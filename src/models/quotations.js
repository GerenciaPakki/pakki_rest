const { Schema, model } = require('mongoose');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');
const {
    DateTime,
    Duration,
    hours
} = require('luxon');

const QuotationSchema = Schema({
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
        cityName: {
            type: String
        },
        postalCode: {
            type: String
        },
        countryCode: {
            type: String
        },
    },
    destination: {
        cityName: {
            type: String
        },
        postalCode: {
            type: String
        },
        countryCode: {
            type: String
        },
    },
    shipment: {
        weightUnit: {
            type: String
        },
        weigh: {
            type: String
        },
        length: {
            type: String
        },
        width: {
            type: String
        },
        height: {
            type: String
        },
    },
    provider: {
        partner: {
            type: String
        },
        service: {
            type: String
        },
        arrivalDate: {
            type: String
        },
        arrivalTime: {
            type: String
        },
        ProvicerDiscount: {type: String},
        exchangeRate: { type: String },
        shipValueNeto: {
            type: String
        },
        valueNetoTrm: {
            type: String
        },
        shippingValue: {
            type: String
        },
        PublicAmount: {
            type: String
        },
    },
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
        type: String,
        default: () => DateTime.local().setZone('America/Bogota').toJSDate()
    },
}, { collection: 'quotations' });

QuotationSchema.method('toJSON', function() {
    const { __v, _id, pass, ...object } = this.toObject();
    // object.uid = _id;
    return object;
});

module.exports = model('Quotation', QuotationSchema);
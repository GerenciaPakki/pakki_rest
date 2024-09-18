const { Schema, model } = require('mongoose');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');


const CompanyDiscountsSchema = Schema({
    Provider:{
        type: String,
        require: true
    },
    ServiceName:{
        type: String,
        require: true
    },
    ServiceCode:{
        type: Number,
    },
    Domestic:{
        type: Boolean,
        require: true,
    },
    ServiceType:{
        type: String,
        require: true
    },
    Data: [{
        Country:[{
            type: String,
        }],
        Weight:{
            type: String,
            require: true
        },
        Fee:{
            type: Number,
            require: true
        },
        RateIncrease:{
            type: String,
            require: true
        },
        PakkiIncrease:{
            type: String,
            require: true
        },
        PakkiDiscount:{
            type: String,
            require: true
        }
    }],
    creatorUser: {
        type: Schema.Types.ObjectId,
        ref: 'Collaborator',
        require: true
    },
    dateCreate: {
        type: String,
        default: marcaDeTiempo
    },
}, { collection: 'companyDiscounts' });

CompanyDiscountsSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    // object.bus = _id;
    return object;
});

module.exports = model('CompanyDiscount', CompanyDiscountsSchema);
const {
    Schema,
    model
} = require('mongoose');
const {
    marcaDeTiempo
} = require('../helpers/pakkiDateTime');

const ShipmentsCommentsSchema = Schema({
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
    shipment: {
        ShipmentCode: {type: String},
        Comments: {type: String},
        ReasonDescription: {type: String}
    },
    Destination: {
        cityDestination: {
            cityName: {
                type: String
            }
        }
    },
    Provider: {
        partners: {type: String}
    },
    // Fecha de creacion del Documento
    createDateShipment: {
        type: String
    },
    comments: [{
        creatorUser: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator',
            require: true
        },
        name: {
            type: String,
        },
        lastname: {
            type: String,
        },
        dateUpdate: {
            type: String
        },
        observation: {
            type: String
        },
        dateCreate: {
            type: String
        },
    }],
     status: {
         type: String,
         enum: ['Abierto', 'Cerrado'],
         default: 'Abierto',
     },
}, {
    collection: 'shipmentsComments'
});

ShipmentsCommentsSchema.index({
    ShipmentID: 1,
    "business.business": 1
});
ShipmentsCommentsSchema.index({
    ShipmentID: 1,
    "business.business": 1,
    "business.brachOffice": 1
});
ShipmentsCommentsSchema.index({
    ShipmentID: 1
});
ShipmentsCommentsSchema.index({
    "business.business": 1
});
ShipmentsCommentsSchema.index({
    "business.brachOffice": 1
});
ShipmentsCommentsSchema.index({
    "business.collaborator": 1
});
ShipmentsCommentsSchema.index({
    "business.createDateShipment": 1
});
ShipmentsCommentsSchema.index({
    "comments.creatorUser": 1
});
ShipmentsCommentsSchema.index({
    "comments.observation": 1
});


ShipmentsCommentsSchema.method('toJSON', function () {
    const {
        __v,
        ...object
    } = this.toObject();
    // object.uid = _id;
    return object;
});

module.exports = model('ShipmentsComments', ShipmentsCommentsSchema);
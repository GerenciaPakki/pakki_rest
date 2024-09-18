const { Schema, model } = require('mongoose');
const { marcaDeTiempoInter } = require('../helpers/pakkiDateTime');

const CollaboratorSchema = Schema({
    colla: {
        collaborator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        name: {
        type: String,
        },
        lastName: {
            type: String,
        }, 
        docu: {
            type: Number,
            unique: true
        }, 
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'profile',
        require: true
    },
    business: {
        business: {
            type: Schema.Types.ObjectId,
            ref: 'Business',
            require: true
        },
        irs: {
            type: Number,
            require: true,
            min: [9999999, "Minimo 8 Digitos"],
            max: [9999999999, "Maximo 10 Digitos"],
        },
        businessName: {
            type: String,
            require: true
        }
    },
    status: {
        type: Boolean,
        default: true
    },
    collaboratorUnique: {
        type: String,
        unique: true,
        require: true,
    },
    creatorUser: {
        type: Schema.Types.ObjectId,
        ref: 'Collaborator',
        require: true
    },
    dateCreate: {
        type: String,
        default: marcaDeTiempoInter
    },
    update: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator'
        },
        dateUpdate: {
            type: String,
            default: marcaDeTiempoInter
        },
        observation: {
            type: String
        },
    }]
}, { collection: 'collaborators' });

CollaboratorSchema.method('toJSON', function() {
    const { __v, _id, pass, ...object } = this.toObject();
    // object.uid = _id;
    return object;
});

module.exports = model('Collaborator', CollaboratorSchema);
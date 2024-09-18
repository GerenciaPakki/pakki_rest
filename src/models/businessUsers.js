const { Schema, model } = require('mongoose');
const { marcaDeTiempoInter } = require('../helpers/pakkiDateTime');
    
    
const BusinessUsersShema = Schema({
    colla: {
        collaborator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        name: {
            type: String,
            require: true
        },
        lastName: {
            type: String,
            require: true
        },
        movil: {
            type: Number,
        },
        email: {
            type: String,
            require: true,
        },
        docu: {
            type: Number,
            require: true,
            unique: true
        },
        pass: {
            type: String,
            require: true,
        },
        changePass: {
            type: Boolean,
            default: false,
        }      
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'profile',
        require: true
    },
    terms: {
        type: Boolean,
        default: false
    },
    business: {
        business: {
            type: Schema.Types.ObjectId,
            ref: 'Business',
            require: true
        },
        irs_nit: {
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
    observation: {
        type: String
    },
    collaboratorUnique: {
        type: String,
        require: true,
        unique: true
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
}, { collection: 'businessUsers' });

BusinessUsersShema.method('toJSON', function() {
    const { __v, _id, pass, ...object } = this.toObject();
    object.uid = _id;
    return object;
});

module.exports = model('BusinessUser', BusinessUsersShema);
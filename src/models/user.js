const { Schema, model } = require('mongoose');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');

const UserShema = Schema({
    name: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    documentType: {
        type: String,
        require: true
    },
    docu: {
        type: Number,
        require: true,
        unique: true,
        min: 999999,
        max: 9999999999
    },
    mobil: {
        type: Number,
        require: true,
        max: 9999999999
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    pass: {
        type: String,
        require: true,
    },
    datebirth: {
        type: String
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    citycode: {
        type: String,
    },
    country: {
        type: String,
    },
    countrycode: {
        type: String,
    },
    state: {
        type: String,
    },
    homephone: {
        type: String,
    },
    workphone: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
    terms: {
        type: String,
        default: false,
        require: true
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'roll',
        require: true
    },
    dateCreate: {
        type: String,
    },
    update: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            require: true
        },
        dateUpdate: {
            type: String,
        },
        observation: {
            type: String
        },
    }]
}, { collection: 'users' });


UserShema.method('toJSON', function() {
    const { __v, _id, pass, ...object } = this.toObject();
    object.uid = _id;
    return object;
});

module.exports = model('User', UserShema);
const { Schema, model } = require('mongoose');
const { marcaDeTiempoInter } = require('../helpers/pakkiDateTime');


const profileShema = Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    role: [{
        type: Schema.Types.ObjectId,
        ref: 'role',
        require: true
    }],
    allyAssignment: [{
        type: String,
        default: 'No Asignados'
    }],
    creatorUser: {
        type: Schema.Types.ObjectId,
        ref: 'Collaborator',
        require: true
    },
    dateCreate: {
        type: String,
    },
    update: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator'
        },
        dateUpdate: {
            type: String,
        },
        observation: {
            type: String
        },
    }]
}, { collection: 'profiles' });

profileShema.method('toJSON', function() {
    const { __v,pass, ...object } = this.toObject();
    return object;
});

module.exports = model('profile', profileShema);
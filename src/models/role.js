const { Schema, model } = require('mongoose');
const { marcaDeTiempoInter } = require('../helpers/pakkiDateTime');


const RoleShema = Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    destination: {
        type: String,
        require: true,
    },
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
}, { collection: 'roles' });

RoleShema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model('role', RoleShema);
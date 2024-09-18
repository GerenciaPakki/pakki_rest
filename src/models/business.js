const { Schema, model } = require('mongoose');


// Creating a date time object


const BusinessSchema = Schema({
    business: {
        irs_nit: {
            type: String,
            require: true,
            min: 9999999,
            max: 99999999999,
            unique: true
        },
        tradename: {
            type: String,
            require: true
        },
        businessname: {
            type: String,
            require: true
        },
        companytype: {
            type: String,
            require: true
        },
        mainaddress: {
            type: String,
            require: true
        },
        phone: {
            number: {type: Number},
            description: { type: String },
        },
        cellphone: {
            number: {type: Number},
            description: { type: String },
        },
        email: {
            type: String,
            require: true
        },
        branchoffices: {
            type: Number,
        },
        city: {
            type: String
        },
        citycode: {
            type: String
        },
        country: {
            type: String
        },
        countrycode: {
            type: String
        },
        state: {
            type: String
        }
    },
    manager: {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        name: {
            type: String,
        },
        lastname: {
            type: String,
        },
        phone: {
            number: {type: Number},
            description: { type: String },
        },
        cellphone: {
            number: {type: Number},
            description: { type: String },
        },
        email: {
            type: String,
        },
        profile: [{
            type: Schema.Types.ObjectId,
            ref: 'profiles',
            require: true
        }],
        status: {
            type: String,
            default: true
        },
        creatorUser: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator',
            require: true
        },
        dateCreate: {
            type: String
        },
        update: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'Collaborator'
            },
            dateUpdate: {
                type: String
            },
            observation: {
                type: String
            },
        }]
    },
    negotiation: {
        discount: {
            type: Number,
            require: true
        },
    },
    assignedCommercial: {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator',
        },
        name: {
            type: String
        },
        lastname: {
            type: String
        },
        update: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'Collaborator'
            },
            dateUpdate: {
                type: String
            },
            observation: {
                type: String
            },
        }]
    },
    collaborators: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator',
        },
        name: {
            type: String
        },
        lastname: {
            type: String
        },
        docu: {
            type: Number
        },
        profile: {
            type: Schema.Types.ObjectId,
            ref: 'profiles',
            require: true
        },
        status: {
            type: String,
            default: true
        },
        creatorUser: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator',
        },
        dateCreate: {
            type: String
        },
        update: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'Collaborator'
            },
            dateUpdate: {
                type: String
            },
            observation: {
                type: String
            },
        }]
    }],
    branchoffices: [{
        businessname: {
            type: String,
            require: true
        },
        tradename: {
            type: String,
            require: true
        },
        mainaddress: {
            type: String,
            require: true
        },
        phone: {
            number: {type: Number},
            description: { type: String },
        },
        cellphone: {
            number: {type: Number},
            description: { type: String },
        },
        email: {
            type: String,
            require: true
        },
        negotiation: {
            discount: {
                type: Number,
                require: true
            },
        },
        city: {
            type: String
        },
        CityCode: {
            type: String
        },
        country: {
            type: String
        },
        CountryCode: {
            type: String
        },
        state: {
            type: String
        },
        WorkdayTomorrow: {
            start: {
                type: String
            },
            end: {
                type: String
            },            
        },
        WorkdayLate: {
            start: {
                type: String
            },
            end: {
                type: String
            },            
        },
        serviceday: [{
            type: String
        }],
        status: {
            type: String,
            default: true
        },
        collaborators: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'Collaborator',
                require: true
            },
            name: {
                type: String
            },
            lastname: {
                type: String
            },
            docu: {
                type: Number
            },
            profile: [{
                type: Schema.Types.ObjectId,
                ref: 'profile',
                require: true
            }],
            creatorUser: {
                type: Schema.Types.ObjectId,
                ref: 'Collaborator',
                require: true
            },
            dateCreate: {
                type: String
            },
            update: [{
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'Collaborator'
                },
                dateUpdate: {
                    type: String
                },
                observation: {
                    type: String
                },
            }]
        }],
        brachOfficeUnique: {
            type: String,
            unique: true
        },
        creatorUser: {
            type: Schema.Types.ObjectId,
            ref: 'Collaborator',
            require: true
        },
        dateCreate: {
            type: String
        },
        update: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'Collaborator'
            },
            dateUpdate: {
                type: String
            },
            observation: {
                type: String
            },
        }]
    }],
    observation: {
        type: String
    },
    status: {
        type: String,
        default: true
    },
    businessunique: {
        type: String,
        unique: true
    },
    creatorUser: {
        type: Schema.Types.ObjectId,
        ref: 'Collaborator',
        require: true
    },
    dateCreate: {
        type: String
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
}, { collection: 'business' });

BusinessSchema.method('toJSON', function() {
    const { __v, pass, ...object } = this.toObject();
    // object.bus = _id;
    return object;
});

module.exports = model('Business', BusinessSchema);
const { Schema, model } = require('mongoose');

const menuprofileSchema = Schema({
    title: { type: String },
    profile: { type: String },                
    menu: [{
        path: String,
        title: String,
        type: { type: String },
        icontype: { type: String },
        collapse: { type: String },
        access: [{
            type: String
        }],
        status: { 
            type: Boolean,
        },
        children: [{
            path: String,            
            title: String,
            ab: String,
            access: [{
                type: String
            }],
        }]
    }]
    
}, { collection: 'menuprofiles' });

menuprofileSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model('Menuprofile', menuprofileSchema);
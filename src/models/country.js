const { Schema, model } = require('mongoose');

const countrySchema = Schema({
    CountryCode: {
        type: String
    },	
    CountryName: {
        type: String
    },	
    PostalCode: {
        type: String
    },
}, { collection: 'countrys' });

countrySchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model('Country', countrySchema);
const { Schema, model } = require('mongoose');

const PostalCodeSchema = Schema({
    CountryCode: {
        type: String
    },
    PostalCodeCity: {
        type: String
    },
    CityName: {
        type: String
    },
    StateName: {
        type: String
    },
    StateCode: {
        type: String
    },
    StateGuidance: {
        type: String
    },
    StateNumber: {
        type: String
    },
    Cam1: {
        type: String
    },
    Cam2: {
        type: String
    },
    Lat: {
        type: String
    },
    Log: {
        type: String
    },
    Cam3: {
        type: String
    },

}, { collection: 'postalCodes' });

PostalCodeSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model('PostalCode', PostalCodeSchema);
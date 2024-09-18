const { Schema, model } = require('mongoose');



const DaneCodeSchema = Schema({
    CountryCode: { type: String },
    CountryName_ES: { type: String },
    CountryName_EN: { type: String },
    StateCode: { type: String },
    CityCode: { type: String },
    CityName: { type: String },
    ZipCode: { type: String },
    DANECode: { type: String }
}, { collection: 'danecodes' });

DaneCodeSchema.method('toJSON', function() {
    const { __v, _id, pass, ...object } = this.toObject();
    // object.bus = _id;
    return object;
});

module.exports = model('Danecode', DaneCodeSchema);
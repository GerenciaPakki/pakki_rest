const { Schema, model } = require('mongoose');

const holidaysSchema = Schema({
    date: { type: String, unique: true },
    day: { type: Number },
    dayCategory: { type: String },
    Holidays: { type: String },
}, { collection: 'holidays' });

holidaysSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    // object.bus = _id;
    return object;
});

module.exports = model('Holiday', holidaysSchema);
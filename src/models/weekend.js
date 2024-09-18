const { Schema, model } = require('mongoose');

const weekendSchema = Schema({
    date: { type: String ,unique: true },
    day: { type: Number },
    Weekday: { type: String },
}, { collection: 'weekends' });

weekendSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    // object.bus = _id;
    return object;
});

module.exports = model('Weekend', weekendSchema);
const { Schema, model } = require('mongoose');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');

const TrmSchema = Schema({
  unit: String,
  validityFrom: Date,
  validityTo: Date,
  value: Number,
  success: Boolean,
  date: {
    type: String,
    unique: true
  },
  createdAt: {
        type: String,
        default: marcaDeTiempo
    },
}, { collection: 'trms' });

TrmSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    return object;
});

module.exports = model('trm', TrmSchema);
const { Schema, model } = require('mongoose');

const companyTypeShema = Schema({
    name: {
        type: String,
        require: true,
        unique: true
    }
}, { collection: 'CompanyTypes' });

companyTypeShema.method('toJSON', function() {
    const { __v,pass, ...object } = this.toObject();
    return object;
});

module.exports = model('CompanyType', companyTypeShema);
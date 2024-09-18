const { Schema, model } = require('mongoose');
const { DateTime, Duration, hours } = require('luxon');


// Creating a date time object
let date = DateTime.local();
let dte = date.minus(Duration.fromObject({ hours: 5 })); // restamos 5 hrs 
let dat = dte.toJSDate(); // seteamos a formato Json para guardar en la base
// let dat = date.toFormat('dd/MM/yyyy HH:mm:ss');
// let dt = dat.toJSDate();


const TokensAuthSchema = Schema({
    provider: {
        envPrefix: {
          type: String,
        },
        access_token: {
            type: String,
        },
        token_type: {
            type: String,
        },
        expires_in: {
            type: Number,
        },
        scope: {
            type: String,
        },
        issued_at: {
            type: String,
        },
        client_id: {
            type: String,
        },
        refresh_count: {
            type: String,
        },
        status: {
            type: String,
        },
        timestamp: {
            type: Date, 
            default: dat
        }
    }
}, { collection: 'tokensauth'});

TokensAuthSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    return object;
});

module.exports = model('TokensAuth', TokensAuthSchema);
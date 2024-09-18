const { DateTime } = require('luxon');

// Creating a date time object
const date = DateTime.local().toISODate();



module.exports = {
    getQuotaFDX,
};
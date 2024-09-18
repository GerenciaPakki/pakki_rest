const { response } = require('express');
const business = require('../models/business');

const cargueroll = async (busId, dato, next) => {
    
    for (i = 1; i <= dato.length; i++) {
        return await business.findOneAndUpdate(busId, {
            "collaborators.roll": dato[i]
        });
    }
};
const cargueprofile = async (busId, dato, next) => {
    
    for (i = 1; i <= dato.length; i++) {
        return await business.findOneAndUpdate(busId, {
            "collaborators.profile": dato[i]
        });
    }
};

module.exports = {
    cargueroll,
    cargueprofile,
};
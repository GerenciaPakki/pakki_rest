const { exceptions, error } = require("winston");
const daneCode = require("../models/daneCode");


async function DaneCodeCity(origin, destination) { 
    try {
        const daneCodeOriginDB = await daneCode.find({
            CityName: origin
        }, {
            DANECode:1, _id:0
        }).where("CountryCode").equals("CO")
    
        const daneCodeDestinationDB = await daneCode.find({
            CityName: destination
        }, {
            DANECode:1, _id:0
        }).where("CountryCode").equals("CO")
    
        if(daneCodeOriginDB.length == 0)
        {
            throw new Error(`No existe codigo dane para la ciudad ${origin}`);
        }

        if(daneCodeDestinationDB.length == 0)
        {
            throw new Error(`No existe codigo dane para la ciudad ${destination}`);
        }

        DaneCodeResp = {
            origin: daneCodeOriginDB[0].DANECode,
            destination: daneCodeDestinationDB[0].DANECode
        }    
    } catch (error) {
        throw(error);
    }

    return DaneCodeResp

}


module.exports = {
    DaneCodeCity,
}
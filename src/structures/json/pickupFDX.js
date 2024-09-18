const { DateTime } = require('luxon');
let date = DateTime.local();
const dat = date.toISO({ includeOffset: true }); // Ejemplo de salida: "2023-02-28T16:23:45-06:00"
const hrColombia = DateTime.fromISO(dat).minus({ hours: 5 }).toISO({ includeOffset: true });
const fechaActual = DateTime.utc().toFormat('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
function PickupDBFDX(shipment, Pickup, Provider) {
    return {
        "associatedAccountNumber": {
            "value": "740561073"
        },
        "originDetail": {
            "pickupLocation": {
                "contact": {
                    "personName": Pickup.ContactName,
                    "phoneNumber": Pickup.ContactPhone
                },
                "address": {
                    "streetLines": [
                        Pickup.Address,
                        Pickup.AddressAdditional,
                        Pickup.AddressAdditional1
                    ],
                    "city": Pickup.City,
                    "stateOrProvinceCode": Pickup.StateOrProvinceCode,
                    "postalCode": Pickup.PostalCode,
                    "countryCode": Pickup.CountryCode,
                }
            },
            "readyDateTimestamp": fechaActual,
            "customerCloseTime": Pickup.TimeEnd
        },
        "carrierCode": "FDXE",
        "expressFreightDetail": {
            "truckType": "DROP_TRAILER_AGREEMENT",
            "service": Provider.service,
            "dimensions": {
                "length": shipment.length,
                "width": shipment.width,
                "height": shipment.height,
                "units": "CM"
            }
        }
    };
}



module.exports = {
    PickupDBFDX,
};
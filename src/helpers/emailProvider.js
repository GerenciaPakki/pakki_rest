const shipments = require("../models/shipments");

async function DataSendMails(dat,coId) { 

    const Shipment = await shipments.find({ ShipmentID: coId });
    let DeliveryToDestination = {}
    let shippingCosts = {}

    // console.log(Shipment[0]);

    DeliveryToDestination = {
        Remitente: {
            Name: dat.Origin.ContactName,
            Business: dat.Origin.CompanyName,
            Phone: dat.Origin.ContactPhone,
            Email: dat.Origin.ContactEmail,
        },
        Destinatario: {
            Name: dat.Destination.ContactName,
            Business: dat.Destination.CompanyName,
            Phone: dat.Destination.ContactPhone,
            Email: dat.Destination.ContactEmail,
        },
    };
    shippingCosts = {
        Remitente: {
            Country: dat.Origin.CountryCode,
            City: dat.Origin.CityName,
            Address: dat.Origin.Address + " " + dat.Origin.AddressAdditional +" " + dat.Origin.AddressAdditional2,
            PostalCode: dat.Origin.PostalCode,
        },
        Destinatario: {
            Country: dat.Destination.CountryCode,
            City: dat.Destination.CityName,
            Address: dat.Destination.Address + " " + dat.Destination.AddressAdditional +" " + dat.Destination.AddressAdditional2,
            PostalCode: dat.Destination.PostalCode,
        },
        Provider: {
            partner: dat.Provider.partner,
            ArrivalDate: dat.Provider.arrivalDate,
            PostalCode: dat.Destination.PostalCode,
            PackQuantity: dat.Shipments.Shipment.PackQuantity,
            Weight: dat.Shipments.Shipment.Weight,
            Content: dat.Shipments.Shipment.Content,
            Reference: dat.Shipments.Shipment.Reference,
            ShipmentCode: dat.Provider.ShipCod
        },
        Billing: {
            Reference: coId,
            // FinalUserAmount: Shipment[0].shippingValue.FinalUserAmount,
            FinalUserAmount: Shipment[0].shippingValue.FinalUserAmount,
        },
    };

    return {
        DeliveryToDestination: DeliveryToDestination,
        shippingCosts: shippingCosts
    };
    
}

module.exports = {
    DataSendMails,
};
const { DateTime } = require('luxon');
const date = DateTime.local().toISODate();
const fechaHoraActual = DateTime.local();
const fchActual = fechaHoraActual.toISO({ includeOffset: true });


function getShipmentDBUPS(upscoId, shipper, recipient, shipment, Pickup, Provider, company, dat, ShipmentCode,contentType,resp) {
    return {
        ShipmentID: upscoId,
        business: {
            business: company.CompanyID,
            brachOffice: company.branchoffices,
            collaborator: company.Collaborator,
        },
        origin: {
            cityOrigin: {
                cityName: shipper.city,
                stateOrProvinceCode: shipper.stateOrProvinceCode,
                postalCode: shipper.postalCode,
                countryCode: shipper.countryCode,
                DANECode: ""
            },
            sender: {
                ContactName: shipper.ContactName,
                CompanyName: shipper.CompanyName,
                Address: shipper.Address,
                AddressDetails: shipper.AddressAdditional,
                AddressDetails1: shipper.AddressAdditional2,
                PhoneNumber: shipper.ContactPhone,
                Email: shipper.ContactEmail,
            }
        },
        Destination: {
            cityDestination: {
                cityName: recipient.city,
                stateOrProvinceCode: recipient.stateOrProvinceCode,
                postalCode: recipient.postalCode,
                countryCode: recipient.countryCode,
                DANECode: ""
            },
            Receiver: {
                ContactName: recipient.ContactName,
                CompanyName: recipient.CompanyName,
                Address: recipient.Address,
                AddressDetails: recipient.AddressAdditional,
                AddressDetails1: recipient.AddressAdditional2,
                PhoneNumber: recipient.ContactPhone,
                Email: recipient.ContactEmail,
            }
        },
        shipment: {
            ShipmentCode: ShipmentCode,
            IsDocument: shipment.documentShipment,
            packagingType: shipment.packagingTypefdx,
            weightUnit: shipment.weightUnit,
            weigh: shipment.weight,
            length: shipment.length,
            width: shipment.width,
            height: shipment.height,
            description: shipment.description,
            quantityPackage: shipment.QuantityPackage,
            Comments: shipment.Comments,
            ReasonDescription: "",
            DeclaredValue: shipment.declaredValue,
            packageLabels: contentType, 
            package: contentType, // Este es para almacenar los objetos de paquetes cuando sean 1 o mas
        },
        Provider: {
            partner: "UPS",
            service: resp.serviceType,
            arrivalDate: Provider.arrivalDate,
            shippingValue: Provider.shippingValue,
        },
        shippingValue: {
            ProviderAmount: dat.Provider.shippingValue,
            FinalUserAmount: dat.Provider.shippingValue,
            ConversionRate: "TRM",
            PublicAmount: "VALOR PUBLICo",
            Currency: "COP",
        },
        billPayment: {
            paymentType: "",
            Currency: "",
            valuePaid: "",
            Reference: "",
            PaymentReference: "",
            status: "",
            Authorization: "",
            PaymentError: "",
            dateCreate: "",
        },        
        // si requiere Pickup se generara la solicitud al endpoint del proveedor
        Pickup: {
            PickupRequired: true,
            PickupCode: "",
            PickupDate: "",
            PickupStartTime: "",
            PickupEndTime: "",
            PickupAutomatic: true,
            PickupContactName: "",
            PickupPhoneNumber: "",
            PickupAddress: "",
            PickupAddressDetails: "",
            PickupAddressDetails2: "",
            PickupNotes: "",
        },
        ShipmentStatus: "",
        alerts: resp.alerts,
        // statusCompany: {
        //     paymentCash: "",
        //     details: "",
        //     creatorUser: "",
        //     dateCreate: ""
        // },
        err: {
            provides: "",
            typeError: "",
            er: {}
        }
    };
}



module.exports = {
    getShipmentDBUPS,
};
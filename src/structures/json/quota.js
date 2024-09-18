const { calcularFecha } = require('../../helpers/pakkiDateTime');

function responseQuota(provider,resp,dat) {
    return {
        partners: provider,
        serviceType: resp.prodDescripcion,
        serviceName: SurchargePakki.ServiceType,
        packagingType: dat.Shipments.packagingTypeCRD,
        deliveryDate:  resp.tiempoEntrega, // calcularFecha(resp.dias_entrega[0]) + ' '+ '23:59:00',
        shipValueNeto: SurchargePakki.shipValueNeto,
        shippingValue: SurchargePakki.shippingValue,
        PublicAmount: SurchargePakki.PublicAmount,
        conditions:'Envios Estandar en Colombia en mas de 1440 destinos. Requiere Imprimir GUIA. Entrega puerta a Puerta sujeta a disponibilidad.'
    };
}

function quotaJsonDataBase(responseApiGateway, bus, uid, dat, provider) {
    return {
        business: {
            business: bus,
            collaborator: uid
        },
        origin: {
            cityName: dat.Origin.CityName,
            postalCode: dat.Origin.PostalCode,
            countryCode: dat.Origin.CountryCode,
        },
        destination: {
            cityName: dat.Destination.CityName,
            postalCode: dat.Destination.PostalCode,
            countryCode: dat.Destination.CountryCode,
        },
        shipment: {
            weightUnit: dat.Shipments.Shipment.WeightUnit,
            weigh: dat.Shipments.Shipment.Weight,
            length: dat.Shipments.Shipment.Length,
            width: dat.Shipments.Shipment.Width,
            height: dat.Shipments.Shipment.Height,
        },
        provider: {
            partners: provider,
            service: responseApiGateway.prodDescripcion,
            arrivalDate: responseApiGateway.tiempoEntrega, // calcularFecha(resp.dias_entrega[0]),
            arrivalTime: '23:59:00',
            shippingCurrency: dat.Shipments.Shipment.InsuranceCurrency,
            shippingValue: responseApiGateway.total,
        }
    };
}

module.exports = { responseQuota, quotaJsonDataBase }
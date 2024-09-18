const dotenv = require('dotenv');
const { FormattedDate, ConvertDateFDX } = require('../../helpers/pakkiDateTime');
const { FDX_USER,FDX_PASSWORD,FDX_ACCOUNT_NUMBER,FDX_ACCOUNT_MATER_NUMBER } = require('../../utils/config');



const QuotaXML_FDX = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://fedex.com/ws/rate/v26">
    <soapenv:Header/>
    <soapenv:Body>
        <RateRequest>
            <WebAuthenticationDetail>
                <ParentCredential>
                    <Key>${FDX_USER}</Key>
                    <Password>${FDX_PASSWORD}</Password>
                </ParentCredential>
                <UserCredential>
                    <Key>${FDX_USER}</Key>
                    <Password>${FDX_PASSWORD}</Password>
                </UserCredential>
            </WebAuthenticationDetail>
            <ClientDetail>
                <AccountNumber>${FDX_ACCOUNT_NUMBER}</AccountNumber>
                <MeterNumber>${FDX_ACCOUNT_MATER_NUMBER}</MeterNumber>
            </ClientDetail>
            <TransactionDetail>
                <CustomerTransactionId>***Rate Request using PAKKI***</CustomerTransactionId>
            </TransactionDetail>
            <Version>
                <ServiceId>crs</ServiceId>
                <Major>26</Major>
                <Intermediate>0</Intermediate>
                <Minor>0</Minor>
            </Version>
            <ReturnTransitAndCommit>true</ReturnTransitAndCommit>
            <RequestedShipment>
                <ShipTimestamp>{{Shipments.DateTime}}</ShipTimestamp>
                <ServiceType>{{Shipments.ServiceType}}</ServiceType>
                <PackagingType>{{Shipments.packagingType}}</PackagingType>
                <TotalInsuredValue>
                    <Currency>USD</Currency>
                    <Amount>{{Shipments.Shipment.Insurance}}</Amount>
                </TotalInsuredValue>
                <Shipper>
                    <Address>
                        <StreetLines>{{Origin.Address}}</StreetLines>
                        <City>{{Origin.CityName}}</City>
                        <StateOrProvinceCode>{{Origin.StateCode}}</StateOrProvinceCode>
                        <PostalCode>{{Origin.PostalCode}}</PostalCode>
                        <CountryCode>{{Origin.CountryCode}}</CountryCode>
                    </Address>
                </Shipper>
                <Recipient>
                    <Address>
                        <StreetLines>{{Destination.Address}}</StreetLines>
                        <City>{{Destination.CityName}}</City>
                        <StateOrProvinceCode>{{Destination.StateCode}}</StateOrProvinceCode>
                        <PostalCode>{{Destination.PostalCode}}</PostalCode>
                        <CountryCode>{{Destination.CountryCode}}</CountryCode>
                    </Address>
                </Recipient>
                <RateRequestTypes>LIST</RateRequestTypes>
                <PackageCount>1</PackageCount>
                <RequestedPackageLineItems>
                    <SequenceNumber>1</SequenceNumber>
                    <GroupPackageCount>1</GroupPackageCount>
                    <InsuredValue>
                        <Currency>{{Shipments.Shipment.InsuranceCurrency}}</Currency>
                        <Amount>{{Shipments.Shipment.Insurance}}</Amount>
                    </InsuredValue>
                    <Weight>
                        <Units>KG</Units>
                        <Value>{{Shipments.Shipment.Weight}}</Value>
                    </Weight>
                    <Dimensions>
                        <Length>{{Shipments.Shipment.Length}}</Length>
                        <Width>{{Shipments.Shipment.Width}}</Width>
                        <Height>{{Shipments.Shipment.Height}}</Height>
                        <Units>CM</Units>
                    </Dimensions>
                </RequestedPackageLineItems>
            </RequestedShipment>
        </RateRequest>
    </soapenv:Body>
</soapenv:Envelope>`;


function quotaJsonFDXDataBase(arrivalDate, company, dat, SurchargePakki) {
    return {
        business: {
            // business: company.CompanyID,
            brachOffice: company.branchoffices,
            collaborator: company.Collaborator
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
            partners: "FDX",
            service: SurchargePakki.ServiceType,
            valueNetoTrm: SurchargePakki.valueNetoTrm,
            arrivalDate: arrivalDate,
            arrivalTime: '23:59:00',
            ProvicerDiscount: SurchargePakki.ProvicerDiscount,
            shipValueNeto: SurchargePakki.shipValueNeto,
            PublicAmount: SurchargePakki.PublicAmount.toLocaleString("co"),
            shippingValue: SurchargePakki.shippingValue,
        }
    };
}

async function resProFDX(ServiceType, serviceName, packagingType, arrivalDate, SurchargePakki) {
    // const DateArrival = await ConvertDateFDX(resp.RateReply[0].RateReplyDetails[0].DeliveryTimestamp[0])
    return {
        partners: "FDX",
        serviceType: ServiceType,
        serviceName: serviceName,
        valueNetoTrm: SurchargePakki.valueNetoTrm,
        packagingType: packagingType,
        deliveryDate: arrivalDate,
        shippingValue: SurchargePakki.shippingValue,
        PublicAmount: SurchargePakki.PublicAmount.toLocaleString("co"),
        conditions:'Requiere Impresión de GUIA. Se puede entregar en Punto Aliado. TARIFA UNICAMENTE PARA ENVIO DE HOJAS. Sujeto a revisión aduanal en destino.',
    };
}


//
module.exports = {
	QuotaXML_FDX,
	quotaJsonFDXDataBase,
	resProFDX,
};
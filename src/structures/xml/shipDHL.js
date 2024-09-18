const dotenv = require('dotenv');
const { DateTime } = require('luxon');
const { DHL_USER, DHL_PASSWORD, DHL_ACCOUNT_NUMBER, DHL_ACCOUNT_NUMBER_IMPORT } = require('../../utils/config');

// Creating a date time object
const date = DateTime.local();

// Obtenemos la fecha actual en formato ISO (YYYY-MM-DD)
const fechaActual = DateTime.now().toISODate(); 
// Formatear la fecha y hora en el formato deseado
const formattedDate = date.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

const ShipXmlDHL = 
`<?xml version="1.0"?>
<req:ShipmentRequest xsi:schemaLocation="http://www.dhl.com ship-val-global-req.xsd" schemaVersion="10.0" xmlns:req="http://www.dhl.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Request>
        <ServiceHeader>
            <MessageTime>${formattedDate}</MessageTime>
            <MessageReference>1234567890123456789012345678901</MessageReference>
            <SiteID>${DHL_USER}</SiteID>
            <Password>${DHL_PASSWORD}</Password>
        </ServiceHeader>
        <MetaData>
            <SoftwareName>PAKKI</SoftwareName>
            <SoftwareVersion>10.0</SoftwareVersion>
        </MetaData>
    </Request>
    <RegionCode>AM</RegionCode>
    <LanguageCode>en</LanguageCode>
    <Billing>
        <ShipperAccountNumber>${DHL_ACCOUNT_NUMBER}</ShipperAccountNumber>
        <ShippingPaymentType>S</ShippingPaymentType>
        <BillingAccountNumber>${DHL_ACCOUNT_NUMBER}</BillingAccountNumber>
    </Billing>
    <Consignee>
        <CompanyName>{{Destination.CompanyName}}</CompanyName>
        <AddressLine1>{{Destination.Address}} {{Destination.AddressAdditional}} {{Destination.AddressAdditional2}}</AddressLine1>
        <City>{{Destination.CityName}}</City>
        <PostalCode>{{Destination.PostalCode}}</PostalCode>
        <CountryCode>{{Destination.CountryCode}}</CountryCode>
        <CountryName/>
        <Contact>
            <PersonName>{{Destination.ContactName}}</PersonName>
            <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
            <Email>{{Destination.ContactEmail}}</Email>
        </Contact>
        <BusinessPartyTypeCode>BU</BusinessPartyTypeCode>
    </Consignee>
    <Dutiable>
        <DeclaredValue>0</DeclaredValue>
        <DeclaredCurrency>USD</DeclaredCurrency>
        <ShipperEIN/>
        <TermsOfTrade>DAP</TermsOfTrade>
    </Dutiable>
    <UseDHLInvoice>N</UseDHLInvoice>
    <DHLInvoiceLanguageCode>en</DHLInvoiceLanguageCode>
    <DHLInvoiceType>PFI</DHLInvoiceType>
    <Reference>
        <ReferenceID/>
        <ReferenceType>OBC</ReferenceType>
    </Reference>
    <ShipmentDetails>
        <Pieces>
            <Piece>
                <PieceID>{{Shipments.Shipment.PackQuantity}}</PieceID>
                <PackageType>EE</PackageType>
                <Weight>{{Shipments.Shipment.Weight}}</Weight>
                <Width>{{Shipments.Shipment.Width}}</Width>
                <Height>{{Shipments.Shipment.Height}}</Height>
                <Depth>{{Shipments.Shipment.Length}}</Depth>
                <PieceContents>{{Shipments.Shipment.Content}}</PieceContents>
            </Piece>
        </Pieces>
        <WeightUnit>K</WeightUnit>
        <GlobalProductCode>D</GlobalProductCode>
        <LocalProductCode>D</LocalProductCode>
        <Date>${fechaActual}</Date>
        <Contents>{{Shipments.Shipment.Content}}</Contents>
        <DimensionUnit>C</DimensionUnit>
        <PackageType>EE</PackageType>
        <IsDutiable>N</IsDutiable>
        <CurrencyCode>USD</CurrencyCode>
    </ShipmentDetails>
    <Shipper>
        <ShipperID>1234567890</ShipperID>
        <CompanyName>{{Origin.CompanyName}}</CompanyName>
        <AddressLine1>{{Origin.Address}} {{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</AddressLine1>
        <City>{{Origin.CityName}}</City>
        <PostalCode>{{Origin.PostalCode}}</PostalCode>
        <CountryCode>{{Origin.CountryCode}}</CountryCode>
        <CountryName/>
        <Contact>
            <PersonName>{{Origin.ContactName}}</PersonName>
            <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
            <Email>{{Origin.ContactEmail}}</Email>
        </Contact>
        <BusinessPartyTypeCode>BU</BusinessPartyTypeCode>
    </Shipper>
    <EProcShip>N</EProcShip>
    <LabelImageFormat>PDF</LabelImageFormat>
    <RequestArchiveDoc>Y</RequestArchiveDoc>
    <NumberOfArchiveDoc>1</NumberOfArchiveDoc>
    <Label>
        <HideAccount>Y</HideAccount>
        <LabelTemplate>8X4_thermal</LabelTemplate>
    </Label>
    <GetPriceEstimate>Y</GetPriceEstimate>
    <SinglePieceImage>N</SinglePieceImage>
</req:ShipmentRequest>`;

const ShipXmlDHL_IMPORT = 
`<?xml version="1.0"?>
<req:ShipmentRequest xsi:schemaLocation="http://www.dhl.com ship-val-global-req.xsd" schemaVersion="10.0" xmlns:req="http://www.dhl.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Request>
        <ServiceHeader>
            <MessageTime>${formattedDate}</MessageTime>
            <MessageReference>1234567890123456789012345678901</MessageReference>
            <SiteID>${DHL_USER}</SiteID>
            <Password>${DHL_PASSWORD}</Password>
        </ServiceHeader>
        <MetaData>
            <SoftwareName>PAKKI</SoftwareName>
            <SoftwareVersion>10.0</SoftwareVersion>
        </MetaData>
    </Request>
    <RegionCode>AM</RegionCode>
    <LanguageCode>en</LanguageCode>
    <Billing>
        <ShipperAccountNumber>${DHL_ACCOUNT_NUMBER_IMPORT}</ShipperAccountNumber>
        <ShippingPaymentType>S</ShippingPaymentType>
        <BillingAccountNumber>${DHL_ACCOUNT_NUMBER_IMPORT}</BillingAccountNumber>
    </Billing>
    <Consignee>
        <CompanyName>{{Destination.CompanyName}}</CompanyName>
        <AddressLine1>{{Destination.Address}} {{Destination.AddressAdditional}} {{Destination.AddressAdditional2}}</AddressLine1>
        <City>{{Destination.CityName}}</City>
        <PostalCode>{{Destination.PostalCode}}</PostalCode>
        <CountryCode>{{Destination.CountryCode}}</CountryCode>
        <CountryName/>
        <Contact>
            <PersonName>{{Destination.ContactName}}</PersonName>
            <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
            <Email>{{Destination.ContactEmail}}</Email>
        </Contact>
        <BusinessPartyTypeCode>BU</BusinessPartyTypeCode>
    </Consignee>
    <Dutiable>
        <DeclaredValue>0</DeclaredValue>
        <DeclaredCurrency>USD</DeclaredCurrency>
        <ShipperEIN/>
        <TermsOfTrade>DAP</TermsOfTrade>
    </Dutiable>
    <UseDHLInvoice>N</UseDHLInvoice>
    <DHLInvoiceLanguageCode>en</DHLInvoiceLanguageCode>
    <DHLInvoiceType>PFI</DHLInvoiceType>
    <Reference>
        <ReferenceID/>
        <ReferenceType>OBC</ReferenceType>
    </Reference>
    <ShipmentDetails>
        <Pieces>
            <Piece>
                <PieceID>{{Shipments.Shipment.PackQuantity}}</PieceID>
                <PackageType>EE</PackageType>
                <Weight>{{Shipments.Shipment.Weight}}</Weight>
                <Width>{{Shipments.Shipment.Width}}</Width>
                <Height>{{Shipments.Shipment.Height}}</Height>
                <Depth>{{Shipments.Shipment.Length}}</Depth>
                <PieceContents>{{Shipments.Shipment.Content}}</PieceContents>
            </Piece>
        </Pieces>
        <WeightUnit>K</WeightUnit>
        <GlobalProductCode>D</GlobalProductCode>
        <LocalProductCode>D</LocalProductCode>
        <Date>${fechaActual}</Date>
        <Contents>{{Shipments.Shipment.Content}}</Contents>
        <DimensionUnit>C</DimensionUnit>
        <PackageType>EE</PackageType>
        <IsDutiable>N</IsDutiable>
        <CurrencyCode>USD</CurrencyCode>
    </ShipmentDetails>
    <Shipper>
        <ShipperID>1234567890</ShipperID>
        <CompanyName>{{Origin.CompanyName}}</CompanyName>
        <AddressLine1>{{Origin.Address}} {{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</AddressLine1>
        <City>{{Origin.CityName}}</City>
        <PostalCode>{{Origin.PostalCode}}</PostalCode>
        <CountryCode>{{Origin.CountryCode}}</CountryCode>
        <CountryName/>
        <Contact>
            <PersonName>{{Origin.ContactName}}</PersonName>
            <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
            <Email>{{Origin.ContactEmail}}</Email>
        </Contact>
        <BusinessPartyTypeCode>BU</BusinessPartyTypeCode>
    </Shipper>
    <EProcShip>N</EProcShip>
    <LabelImageFormat>PDF</LabelImageFormat>
    <RequestArchiveDoc>Y</RequestArchiveDoc>
    <NumberOfArchiveDoc>1</NumberOfArchiveDoc>
    <Label>
        <HideAccount>Y</HideAccount>
        <LabelTemplate>8X4_thermal</LabelTemplate>
    </Label>
    <GetPriceEstimate>Y</GetPriceEstimate>
    <SinglePieceImage>N</SinglePieceImage>
</req:ShipmentRequest>`;

const ShipPickupXmlDHL = 
`<?xml version="1.0"?>
<req:BookPURequest xsi:schemaLocation="http://www.dhl.com pickup-global-req.xsd" schemaVersion="3.0" xmlns:req="http://www.dhl.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Request>
        <ServiceHeader>
            <MessageTime>${formattedDate}</MessageTime>
            <MessageReference>BookPickupGL_PAKKI123456789012</MessageReference>
            <SiteID>${DHL_USER}</SiteID>
            <Password>${DHL_PASSWORD}</Password>
        </ServiceHeader>
        <MetaData>
            <SoftwareName>PAKKI</SoftwareName>
            <SoftwareVersion>10.0</SoftwareVersion>
        </MetaData>
    </Request>
    <RegionCode>AM</RegionCode>
    <Requestor>
        <AccountType>D</AccountType>
        <AccountNumber>${DHL_ACCOUNT_NUMBER}</AccountNumber>
        <RequestorContact>
            <PersonName>{{Origin.ContactName}}</PersonName>
            <Phone>{{Origin.ContactPhone}}</Phone>
        </RequestorContact>
        <CompanyName>{{Origin.CompanyName}}</CompanyName>
        <Address1>{{Origin.Address}} {{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</Address1>
        <City>{{Origin.CityName}}</City>
        <CountryCode>{{Origin.CountryCode}}</CountryCode>
    </Requestor>
    <Place>
        <LocationType>C</LocationType>
        <CompanyName>{{Pickup.CompanyName}}</CompanyName>
        <Address1>{{Pickup.Address}} {{Pickup.AddressAdditional}} {{Pickup.AddressAdditional2}}</Address1>
        <PackageLocation>{{Pickup.Comments}}</PackageLocation>
        <City>{{Pickup.City}}</City>
        <CountryCode>{{Pickup.CountryCode}}</CountryCode>
        <PostalCode>{{Pickup.PostalCode}}</PostalCode>
    </Place>
    <Pickup>
        <PickupDate>{{Pickup.DateTime1}}</PickupDate>
        <PickupTypeCode>A</PickupTypeCode>
        <ReadyByTime>{{Pickup.TimeStart}}</ReadyByTime>
        <CloseTime>{{Pickup.TimeEnd}}</CloseTime>
        <Pieces>1</Pieces>
        <RemotePickupFlag>N</RemotePickupFlag>
        <weight>
            <Weight>{{Shipments.Shipment.Weight}}</Weight>
            <WeightUnit>K</WeightUnit>
        </weight>
    </Pickup>
    <PickupContact>
        <PersonName>{{Pickup.ContactName}}</PersonName>
        <Phone>{{Pickup.ContactPhone}}</Phone>
    </PickupContact>
    <ShipmentDetails>
        <AccountType>D</AccountType>
        <AccountNumber>${DHL_ACCOUNT_NUMBER}</AccountNumber>
        <AWBNumber>{{Provider.ShipCod}}</AWBNumber>
        <NumberOfPieces>1</NumberOfPieces>
        <Weight>1</Weight>
        <WeightUnit>K</WeightUnit>
        <GlobalProductCode>D</GlobalProductCode>
        <LocalProductCode>D</LocalProductCode>
        <DoorTo>DD</DoorTo>
        <DimensionUnit>C</DimensionUnit>
        <InsuredAmount>0</InsuredAmount>
        <InsuredCurrencyCode>USD</InsuredCurrencyCode>
        <Pieces>
            <Piece>
                <Weight>{{Shipments.Shipment.Weight}}</Weight>
                <Width>{{Shipments.Shipment.Width}}</Width>
                <Height>{{Shipments.Shipment.Height}}</Height>
                <Depth>{{Shipments.Shipment.Length}}</Depth>
            </Piece>
        </Pieces>
    </ShipmentDetails>
</req:BookPURequest>`


const ShipXmlPKGDHL = 
`<?xml version="1.0"?>
<req:ShipmentRequest xsi:schemaLocation="http://www.dhl.com ship-val-global-req.xsd" schemaVersion="10.0" xmlns:req="http://www.dhl.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Request>
        <ServiceHeader>
            <MessageTime>${formattedDate}</MessageTime>
            <MessageReference>1234567890123456789012345678901</MessageReference>
            <SiteID>${DHL_USER}</SiteID>
            <Password>${DHL_PASSWORD}</Password>
        </ServiceHeader>
        <MetaData>
            <SoftwareName>PAKKI</SoftwareName>
            <SoftwareVersion>10.0</SoftwareVersion>
        </MetaData>
    </Request>
    <RegionCode>AM</RegionCode>
    <LanguageCode>en</LanguageCode>
    <Billing>
        <ShipperAccountNumber>${DHL_ACCOUNT_NUMBER}</ShipperAccountNumber>
        <ShippingPaymentType>S</ShippingPaymentType>
        <BillingAccountNumber>${DHL_ACCOUNT_NUMBER}</BillingAccountNumber>
    </Billing>
    <Consignee>
        <CompanyName>{{Destination.CompanyName}}</CompanyName>
        <AddressLine1>{{Destination.Address}} {{Destination.AddressAdditional}} {{Destination.AddressAdditional2}}</AddressLine1>
        <City>{{Destination.CityName}}</City>
        <PostalCode>{{Destination.PostalCode}}</PostalCode>
        <CountryCode>{{Destination.CountryCode}}</CountryCode>
        <CountryName/>
        <Contact>
            <PersonName>{{Destination.ContactName}}</PersonName>
            <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
            <Email>{{Destination.ContactEmail}}</Email>
        </Contact>
        <RegistrationNumbers>
            <RegistrationNumber>
                <Number>1</Number>
                <NumberTypeCode>VAT</NumberTypeCode>
                <NumberIssuerCountryCode>US</NumberIssuerCountryCode>
            </RegistrationNumber>
        </RegistrationNumbers>
        <BusinessPartyTypeCode>BU</BusinessPartyTypeCode>
    </Consignee>
    <Dutiable>
        <DeclaredValue>{{Shipments.Shipment.DeclaredValue}}</DeclaredValue>
        <DeclaredCurrency>USD</DeclaredCurrency>
        <ShipperEIN/>
        <TermsOfTrade>DAP</TermsOfTrade>
    </Dutiable>
    <UseDHLInvoice>Y</UseDHLInvoice>
    <DHLInvoiceLanguageCode>en</DHLInvoiceLanguageCode>
    <DHLInvoiceType>PFI</DHLInvoiceType>
    <!-- CMI Commercial Invoice   PFI Proforma invoice-->
    <ExportDeclaration/>
    <Reference>
        <ReferenceID>{{Shipments.Shipment.Content}}</ReferenceID>
        <ReferenceType>OBC</ReferenceType>
    </Reference>
    <ShipmentDetails>
        <Pieces>
            <Piece>
                <PieceID>{{Shipments.Shipment.PackQuantity}}</PieceID>
                <PackageType>YP</PackageType>
                <Weight>{{Shipments.Shipment.Weight}}</Weight>
                <Width>{{Shipments.Shipment.Width}}</Width>
                <Height>{{Shipments.Shipment.Height}}</Height>
                <Depth>{{Shipments.Shipment.Length}}</Depth>
                <PieceContents>{{Shipments.Shipment.Content}}</PieceContents>
            </Piece>
        </Pieces>
        <WeightUnit>K</WeightUnit>
        <GlobalProductCode>P</GlobalProductCode>
        <LocalProductCode>P</LocalProductCode>
        <Date>${fechaActual}</Date>
        <Contents>{{Shipments.Shipment.Content}}</Contents>
        <DimensionUnit>C</DimensionUnit>
        <PackageType>YP</PackageType>
        <IsDutiable>Y</IsDutiable>
        <CurrencyCode>USD</CurrencyCode>
    </ShipmentDetails>
    <Shipper>
        <ShipperID>1234567890</ShipperID>
        <CompanyName>{{Origin.CompanyName}}</CompanyName>
        <AddressLine1>{{Origin.Address}} {{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</AddressLine1>
        <City>{{Origin.CityName}}</City>
        <PostalCode>{{Origin.PostalCode}}</PostalCode>
        <CountryCode>{{Origin.CountryCode}}</CountryCode>
        <CountryName/>
        <Contact>
            <PersonName>{{Origin.ContactName}}</PersonName>
            <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
            <Email>{{Origin.ContactEmail}}</Email>
        </Contact>
        <RegistrationNumbers>
            <RegistrationNumber>
                <Number>1</Number>
                <NumberTypeCode>VAT</NumberTypeCode>
                <NumberIssuerCountryCode>CO</NumberIssuerCountryCode>
            </RegistrationNumber>
        </RegistrationNumbers>
        <BusinessPartyTypeCode>BU</BusinessPartyTypeCode>
    </Shipper>
    <EProcShip>N</EProcShip>
    <LabelImageFormat>PDF</LabelImageFormat>
    <RequestArchiveDoc>Y</RequestArchiveDoc>
    <NumberOfArchiveDoc>1</NumberOfArchiveDoc>
    <Label>
        <HideAccount>Y</HideAccount>
        <LabelTemplate>8X4_thermal</LabelTemplate>
    </Label>
    <GetPriceEstimate>Y</GetPriceEstimate>
    <SinglePieceImage>N</SinglePieceImage>
</req:ShipmentRequest>`;

function ShipmentDBDHL(dhlcoId, dat, ShipmentCode, label, package, resp,SurchargePakki) {
    return {
        ShipmentID: dhlcoId,
        business: {
            business: dat.company.CompanyID,
            brachOffice: dat.company.branchoffices,
            collaborator: dat.company.Collaborator,
        },
        origin: {
            cityOrigin: {
                cityName: dat.Origin.CityName,
                stateOrProvinceCode: dat.Origin.StateCode,
                postalCode: dat.Origin.PostalCode,
                countryCode: dat.Origin.CountryCode,
                DANECode: dat.Origin.DANECode
            },
            sender: {
                ContactName: dat.Origin.ContactName,
                CompanyName: dat.Origin.CompanyName,
                Address: dat.Origin.Address,
                AddressDetails: dat.Origin.AddressAdditional,
                AddressDetails1: dat.Origin.AddressAdditional2,
                PhoneNumber: dat.Origin.ContactPhone,
                Email: dat.Origin.ContactEmail,
            }
        },
        Destination: {
            cityDestination: {
                cityName: dat.Destination.CityName,
                stateOrProvinceCode: dat.Destination.StateCode,
                postalCode: dat.Destination.PostalCode,
                countryCode: dat.Destination.CountryCode,
                DANECode: dat.Destination.DANECode
            },
            Receiver: {
                ContactName: dat.Destination.ContactName,
                CompanyName: dat.Destination.CompanyName,
                Address: dat.Destination.Address,
                AddressDetails: dat.Destination.AddressAdditional,
                AddressDetails1: dat.Destination.AddressAdditional2,
                PhoneNumber: dat.Destination.ContactPhone,
                Email: dat.Destination.ContactEmail,
            }
        },
        shipment: {
            ShipmentCode: ShipmentCode,
            IsDocument: dat.Shipments.documentShipment,
            DocumentContent: dat.Shipments.DocumentContent,
            serviceType: dat.Shipments.serviceType,
            packagingType: dat.Shipments.packagingType,
            description: dat.Shipments.description,
            Comments: dat.Shipments.Comments,
            weightUnit: dat.Shipments.Shipment.weightUnit,
            weigh: dat.Shipments.Shipment.weight,
            length: dat.Shipments.Shipment.length,
            width: dat.Shipments.Shipment.width,
            height: dat.Shipments.Shipment.height,
            description: dat.Shipments.Shipment.description,
            quantityPackage: dat.Shipments.Shipment.QuantityPackage,
            Comments: dat.Shipments.Comments,
            ReasonDescription: "",
            DeclaredValue: dat.Shipments.Shipment.declaredValue,
            packageLabels: label, 
            package: package, // Este es para almacenar los objetos de paquetes cuando sean 1 o mas
        },
        Provider: {
            partners: dat.Provider.partners,
            serviceType: dat.Provider.serviceType,
            serviceName: dat.Provider.serviceName,
            shipValueNeto: dat.Provider.shipValueNeto,
            packagingType: dat.Provider.packagingType,
            deliveryDate: dat.Provider.deliveryDate,
            shippingValue: dat.Provider.shippingValue,
            PublicAmount: dat.Provider.PublicAmount,
        },
        shippingValue: {
            ProviderAmount: dat.Provider.shippingValue,
            FinalUserAmount: SurchargePakki.shippingValue,
            ConversionRate: SurchargePakki.exchangeRate,
            PublicAmount: SurchargePakki.PublicAmount,
            Currency: "COP",
        },
        billPayment: {
            paymentType: dat.Shipments.PaymentType,
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
        alerts: resp.Note,
        statusCompany: {
            paymentCash: "",
            Currency: "",
            valuePaid: "",
            Reference: "",
            PaymentReference: "",
            status: "",
            Authorization: "",
            PaymentError: "",
            dateCreate: "",
        },
        respShip: resp,
        err: {
            provides: "",
            typeError: "",
            er: {}
        }
    };
}
function resProDHL(resp,dat) {
    return {
        partners: "DHL",
        serviceType: resp.RateReply[0].RateReplyDetails[0].ServiceDescription[0].Code[0],
        serviceName: resp.RateReply[0].RateReplyDetails[0].ServiceDescription[0].ServiceType[0],
        packagingType: resp.RateReply[0].RateReplyDetails[0].PackagingType[0],
        deliveryDate: resp.RateReply[0].RateReplyDetails[0].DeliveryTimestamp[0],
        totalNetFedExCharge: resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].ShipmentRateDetail[0].TotalNetChargeWithDutiesAndTaxes[0].Amount[0] 
    };
}



module.exports = {
    ShipXmlDHL,
    ShipPickupXmlDHL,
    ShipXmlPKGDHL,
    ShipXmlDHL_IMPORT,
    ShipmentDBDHL,
    resProDHL,
};
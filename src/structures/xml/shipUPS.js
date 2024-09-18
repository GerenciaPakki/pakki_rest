const dotenv = require('dotenv');
const { DateTime } = require('luxon');
const { UPS_USER, UPS_PASSWORD, UPS_BILLSHIPPER, UPS_ACCOUNT_NUMBER } = require('../../utils/config');

// Creating a date time object
const date = DateTime.local().toISODate();
const dateQuota = DateTime.fromFormat(date, 'yyyyMMdd').toISODate(); // Output: '2023-02-24'
const horaQuota = DateTime.fromFormat(date, 'HHmm');
// const fechaFormateada = date.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

const xmlQuotaUPS = {
	"AccessRequest xml:lang=`en-US`": {
    AccessLicenseNumber: "CD393505DC755C88",
    UserId: "YoTraigo.com",
    Password: "Colombia1"
    },
    RatingServiceSelectionRequest: {
        Request: {
            TransactionReference: {
                CustomerContext: "PAKKI"
            },
            RequestAction: "RateTimeInTransit",
            RequestOption: "Rate"
        },
        Shipment: {
            Shipper: {
                Name: "Shipper Name",
                AttentionName: "Shipper Attention Name",
                PhoneNumber: "1234567890",
                FaxNumber: "1234567890",
                ShipperNumber: "${UPS_BILLSHIPPER}",
                Address: {
                    AddressLine1: "Address Line 1",
                    City: "Bogota",
                    StateProvinceCode: "DC",
                    PostalCode: "111111",
                    CountryCode: "CO"
                }
            },
            ShipTo: {
                CompanyName: "",
                AttentionName: "",
                PhoneNumber: "",
                FaxNumber: "",
                Address: {
                    AddressLine1: "",
                    AddressLine: "",
                    AddressLine2: "",
                    City: "",
                    StateProvinceCode: "",
                    PostalCode: "",
                    CountryCode: ""
                }
            },
            ShipFrom: {
                CompanyName: "",
                AttentionName: "",
                PhoneNumber: "",
                FaxNumber: "",
                Address: {
                    AddressLine1: "",
                    City: "",
                    StateProvinceCode: "",
                    PostalCode: "",
                    CountryCode: ""
                }
            },
            Service: {
                Code: "65",
                Description: ""
            },
            Package: {
                PackagingType: {
                    Code: "00",
                    Description: "UPS Package"
                },
                PackageWeight: {
                    UnitOfMeasurement: {
                        Code: ""
                    },
                    Weight: ""
                },
                Dimensions: {
                    UnitOfMeasurement: {
                        Code: "IN"
                    },
                    Length: "",
                    Width: "",
                    Height: ""
                },
                PackageServiceOptions: {
                    InsuredValue: {
                        MonetaryValue: "",
                        CurrencyCode: ""
                    }
                },
				residentialIndicator: "02"
            },
			RateInformation: {
                NegotiatedRatesIndicator: null,
                RateChartIndicator: null
            },
            ShipmentTotalWeight: {
                UnitOfMeasurement: {
                    Code: "KGS"
                },
                Weight: "0.5"
            },
            InvoiceLineTotal: {
                CurrencyCode: "",
                MonetaryValue: ""
            },
        }
    }
};
const xmlShipDocUPS = 
`<?xml version="1.0"?>
<AccessRequest xml:lang="en-US">
    <AccessLicenseNumber>${UPS_ACCOUNT_NUMBER}</AccessLicenseNumber>
    <UserId>${UPS_USER}</UserId>
    <Password>${UPS_PASSWORD}</Password>
</AccessRequest>
<ShipmentConfirmRequest xml:lang="en-US">
    <Request>
        <TransactionReference>
            <CustomerContext>PAKKI</CustomerContext>
        </TransactionReference>
        <RequestAction>ShipConfirm</RequestAction>
        <RequestOption>nonvalidate</RequestOption>
    </Request>
    <Shipment>
        <Description>Documents</Description>
        <Shipper>
            <Name>{{Origin.ContactName}}</Name>
            <AttentionName>{{Origin.ContactName}}</AttentionName>
            <CompanyDisplayableName>{{Origin.ContactName}}</CompanyDisplayableName>
            <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
            <ShipperNumber>${UPS_BILLSHIPPER}</ShipperNumber>
            <TaxIdentificationNumber/>
            <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
            <Address>
                <AddressLine1>{{Origin.Address}}</AddressLine1>
                <AddressLine2>{{Origin.AddressAdditional}}</AddressLine2>
                <AddressLine3>{{Origin.AddressAdditional2}}</AddressLine3>
                <City>Bogota</City>
                <StateProvinceCode>DC</StateProvinceCode>
                <PostalCode>110111</PostalCode>
                <CountryCode>CO</CountryCode>
            </Address>
        </Shipper>
        <ShipTo>
            <CompanyName>{{Destination.CompanyName}}</CompanyName>
            <AttentionName>{{Destination.ContactName}}</AttentionName>
            <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
            <EMailAddress>{{Destination.ContactEmail}}</EMailAddress>
            <Address>
                <AddressLine1>{{Destination.Address}}</AddressLine1>
                <AddressLine2>{{Destination.AddressAdditional}}</AddressLine2>
                <AddressLine3>{{Destination.AddressAdditional2}}</AddressLine3>
                <City>{{Destination.CityName}}</City>
                <StateProvinceCode>{{Destination.StateCode}}</StateProvinceCode>
                <PostalCode>{{Destination.PostalCode}}</PostalCode>
                <CountryCode>{{Destination.CountryCode}}</CountryCode>
            </Address>
        </ShipTo>
        <ShipFrom>
            <CompanyName>{{Origin.CompanyName}}</CompanyName>
            <AttentionName>{{Origin.ContactName}}</AttentionName>
            <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
            <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
            <Address>
                <AddressLine1>{{Origin.Address}}</AddressLine1>
                <AddressLine2>{{Origin.AddressAdditional}}</AddressLine2>
                <AddressLine3>{{Origin.AddressAdditional2}}</AddressLine3>
                <City>{{Origin.CityName}}</City>
                <StateProvinceCode>{{Origin.StateCode}}</StateProvinceCode>
                <PostalCode>{{Origin.PostalCode}}</PostalCode>
                <CountryCode>{{Origin.CountryCode}}</CountryCode>
            </Address>
        </ShipFrom>
        <PaymentInformation>
            <Prepaid>
                <BillShipper>
                    <AccountNumber>${UPS_BILLSHIPPER}</AccountNumber>
                </BillShipper>
            </Prepaid>
        </PaymentInformation>
        <Service>
            <Code>65</Code>
            <Description>UPS Worldwide Saver</Description>
        </Service>
        <Package>
            <PackagingType>
                <Code>01</Code>
                <Description>UPS Letter</Description>
            </PackagingType>
            <Description>Documents</Description>
            <PackageWeight>
                <UnitOfMeasurement>
                    <Code>KGS</Code>
                    <Description>KILOGRAMS</Description>
                </UnitOfMeasurement>
                <Weight>{{Shipments.Shipment.Weight}}</Weight>
            </PackageWeight>
            <PackageServiceOptions>
                <InsuredValue>
                    <Type>
                        <Code>01</Code>
                    </Type>
                    <CurrencyCode>USD</CurrencyCode>
                    <MonetaryValue>100</MonetaryValue>
                </InsuredValue>
                <DeclaredValue>
                    <Type>
                        <Code>01</Code>
                    </Type>
                    <CurrencyCode>{{Shipments.Shipment.InsuranceCurrency}}</CurrencyCode>
                    <MonetaryValue>{{Shipments.Shipment.DeclaredValue}}</MonetaryValue>
                </DeclaredValue>
            </PackageServiceOptions>
        </Package>
        <RateInformation>
            <NegotiatedRatesIndicator/>
            <RateChartIndicator/>
        </RateInformation>
    </Shipment>
    <LabelSpecification>
        <LabelPrintMethod>
            <Code>GIF</Code>
            <Description>GIF</Description>
        </LabelPrintMethod>
        <LabelImageFormat>
            <Code>GIF</Code>
            <Description>GIF</Description>
        </LabelImageFormat>
    </LabelSpecification>
</ShipmentConfirmRequest>`;

const xmlShipDocUPS_import = 
`<?xml version="1.0"?>
<AccessRequest xml:lang="en-US">
    <AccessLicenseNumber>${UPS_ACCOUNT_NUMBER}</AccessLicenseNumber>
    <UserId>${UPS_USER}</UserId>
    <Password>${UPS_PASSWORD}</Password>
</AccessRequest>
<ShipmentConfirmRequest xml:lang="en-US">
    <Request>
        <TransactionReference>
            <CustomerContext>PAKKI</CustomerContext>
        </TransactionReference>
        <RequestAction>ShipConfirm</RequestAction>
        <RequestOption>nonvalidate</RequestOption>
    </Request>
    <Shipment>
        <Description>Documents</Description>
        <Shipper>
            <Name>{{Origin.ContactName}}</Name>
            <AttentionName>{{Origin.ContactName}}</AttentionName>
            <CompanyDisplayableName>{{Origin.ContactName}}</CompanyDisplayableName>
            <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
            <ShipperNumber>${UPS_BILLSHIPPER}</ShipperNumber>
            <TaxIdentificationNumber/>
            <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
            <Address>
                <AddressLine1>{{Origin.Address}}</AddressLine1>
                <AddressLine2>{{Origin.AddressAdditional}}</AddressLine2>
                <AddressLine3>{{Origin.AddressAdditional2}}</AddressLine3>
                <City>Bogota</City>
                <StateProvinceCode>DC</StateProvinceCode>
                <PostalCode>110111</PostalCode>
                <CountryCode>CO</CountryCode>
            </Address>
        </Shipper>
        <ShipTo>
            <CompanyName>{{Destination.CompanyName}}</CompanyName>
            <AttentionName>{{Destination.ContactName}}</AttentionName>
            <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
            <EMailAddress>{{Destination.ContactEmail}}</EMailAddress>
            <Address>
                <AddressLine1>{{Destination.Address}}</AddressLine1>
                <AddressLine2>{{Destination.AddressAdditional}}</AddressLine2>
                <AddressLine3>{{Destination.AddressAdditional2}}</AddressLine3>
                <City>{{Destination.CityName}}</City>
                <StateProvinceCode>{{Destination.StateCode}}</StateProvinceCode>
                <PostalCode>{{Destination.PostalCode}}</PostalCode>
                <CountryCode>{{Destination.CountryCode}}</CountryCode>
            </Address>
        </ShipTo>
        <ShipFrom>
            <CompanyName>{{Origin.CompanyName}}</CompanyName>
            <AttentionName>{{Origin.ContactName}}</AttentionName>
            <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
            <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
            <Address>
                <AddressLine1>{{Origin.Address}}</AddressLine1>
                <AddressLine2>{{Origin.AddressAdditional}}</AddressLine2>
                <AddressLine3>{{Origin.AddressAdditional2}}</AddressLine3>
                <City>{{Origin.CityName}}</City>
                <StateProvinceCode>{{Origin.StateCode}}</StateProvinceCode>
                <PostalCode>{{Origin.PostalCode}}</PostalCode>
                <CountryCode>{{Origin.CountryCode}}</CountryCode>
            </Address>
        </ShipFrom>
        <PaymentInformation>
            <Prepaid>
                <BillShipper>
                    <AccountNumber>${UPS_BILLSHIPPER}</AccountNumber>
                </BillShipper>
            </Prepaid>
        </PaymentInformation>
        <Service>
            <Code>65</Code>
            <Description>UPS Worldwide Saver</Description>
        </Service>
        <Package>
            <PackagingType>
                <Code>01</Code>
                <Description>UPS Letter</Description>
            </PackagingType>
            <Description>Documents</Description>
            <PackageWeight>
                <UnitOfMeasurement>
                    <Code>KGS</Code>
                    <Description>KILOGRAMS</Description>
                </UnitOfMeasurement>
                <Weight>{{Shipments.Shipment.Weight}}</Weight>
            </PackageWeight>
            <PackageServiceOptions>
                <InsuredValue>
                    <Type>
                        <Code>01</Code>
                    </Type>
                    <CurrencyCode>USD</CurrencyCode>
                    <MonetaryValue>100</MonetaryValue>
                </InsuredValue>
                <DeclaredValue>
                    <Type>
                        <Code>01</Code>
                    </Type>
                    <CurrencyCode>{{Shipments.Shipment.InsuranceCurrency}}</CurrencyCode>
                    <MonetaryValue>{{Shipments.Shipment.DeclaredValue}}</MonetaryValue>
                </DeclaredValue>
            </PackageServiceOptions>
        </Package>
        <RateInformation>
            <NegotiatedRatesIndicator/>
            <RateChartIndicator/>
        </RateInformation>
    </Shipment>
    <LabelSpecification>
        <LabelPrintMethod>
            <Code>GIF</Code>
            <Description>GIF</Description>
        </LabelPrintMethod>
        <LabelImageFormat>
            <Code>GIF</Code>
            <Description>GIF</Description>
        </LabelImageFormat>
    </LabelSpecification>
</ShipmentConfirmRequest>`;


const xmlShipPkgUPS = 
`<?xml version="1.0" xml:lang="en-US"?>
<root>
    <AccessRequest>
        <AccessLicenseNumber>${UPS_ACCOUNT_NUMBER}</AccessLicenseNumber>
        <UserId>${UPS_USER}</UserId>
        <Password>${UPS_PASSWORD}</Password>
    </AccessRequest>
    <ShipmentConfirmRequest>
        <Request>
            <TransactionReference>
                <CustomerContext>PAKKI</CustomerContext>
            </TransactionReference>
            <RequestAction>ShipConfirm</RequestAction>
            <RequestOption>nonvalidate</RequestOption>
        </Request>
        <Shipment>
            <Description>Package</Description>
            <Shipper>
                <Name>{{Origin.ContactName}}</Name>
                <AttentionName>{{Origin.ContactName}}</AttentionName>
                <CompanyDisplayableName>{{Origin.ContactName}}</CompanyDisplayableName>
                <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
                <ShipperNumber>${UPS_BILLSHIPPER}</ShipperNumber>
                <TaxIdentificationNumber>CO1234</TaxIdentificationNumber>
                <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
                <Address>
                    <AddressLine1>{{Origin.Address}}</AddressLine1>
                    <AddressLine2>{{Origin.AddressAdditional}}</AddressLine2>
                    <AddressLine3>{{Origin.AddressAdditional2}}</AddressLine3>
                    <City>Bogota</City>
                    <StateProvinceCode>DC</StateProvinceCode>
                    <PostalCode>110111</PostalCode>
                    <CountryCode>CO</CountryCode>
                </Address>
            </Shipper>
            <ShipTo>
                <CompanyName>{{Destination.CompanyName}}</CompanyName>
                <AttentionName>{{Destination.ContactName}}</AttentionName>
                <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
                <TaxIdentificationNumber>US1234</TaxIdentificationNumber>
                <EMailAddress>{{Destination.ContactEmail}}</EMailAddress>
                <Address>
                    <AddressLine1>{{Destination.Address}}</AddressLine1>
                    <AddressLine2>{{Destination.AddressAdditional}}</AddressLine2>
                    <AddressLine3>{{Destination.AddressAdditional2}}</AddressLine3>
                    <City>{{Destination.CityName}}</City>
                    <StateProvinceCode>{{Destination.StateCode}}</StateProvinceCode>
                    <PostalCode>{{Destination.PostalCode}}</PostalCode>
                    <CountryCode>{{Destination.CountryCode}}</CountryCode>
                </Address>
            </ShipTo>
            <SoldTo>
                <CompanyName>{{Destination.CompanyName}}</CompanyName>
                <AttentionName>{{Destination.ContactName}}</AttentionName>
                <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
                <TaxIdentificationNumber>US1234</TaxIdentificationNumber>
                <EMailAddress>{{Destination.ContactEmail}}</EMailAddress>
                <Address>
                    <AddressLine1>{{Destination.Address}}</AddressLine1>
                    <AddressLine2>{{Destination.AddressAdditional}}</AddressLine2>
                    <AddressLine3>{{Destination.AddressAdditional2}}</AddressLine3>
                    <City>{{Destination.CityName}}</City>
                    <StateProvinceCode>{{Destination.StateCode}}</StateProvinceCode>
                    <PostalCode>{{Destination.PostalCode}}</PostalCode>
                    <CountryCode>{{Destination.CountryCode}}</CountryCode>
                </Address>
            </SoldTo>
            <ShipFrom>
                <CompanyName>{{Origin.CompanyName}}</CompanyName>
                <AttentionName>{{Origin.ContactName}}</AttentionName>
                <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
                <TaxIdentificationNumber>CO1234</TaxIdentificationNumber>
                <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
                <Address>
                    <AddressLine1>{{Origin.Address}}</AddressLine1>
                    <AddressLine2>{{Origin.AddressAdditional}}</AddressLine2>
                    <AddressLine3>{{Origin.AddressAdditional2}}</AddressLine3>
                    <City>{{Origin.CityName}}</City>
                    <StateProvinceCode>{{Origin.StateCode}}</StateProvinceCode>
                    <PostalCode>{{Origin.PostalCode}}</PostalCode>
                    <CountryCode>{{Origin.CountryCode}}</CountryCode>
                </Address>
            </ShipFrom>
            <PaymentInformation>
                <Prepaid>
                    <BillShipper>
                        <AccountNumber>${UPS_BILLSHIPPER}</AccountNumber>
                    </BillShipper>
                </Prepaid>
            </PaymentInformation>
            <Service>
                <Code>65</Code>
                <Description>UPS Worldwide Saver</Description>
            </Service>
            <Package>
                <PackagingType>
                    <Code>02</Code>
                    <Description>Customer Supplied Package</Description>
                </PackagingType>
                <Description>Documents</Description>
                <Dimensions>
                    <UnitOfMeasurement>
                        <Code>CM</Code>
                        <Description>CENTIMETERS</Description>
                    </UnitOfMeasurement>
                    <Length>{{Shipments.Shipment.Length}}</Length>
                    <Width>{{Shipments.Shipment.Width}}</Width>
                    <Height>{{Shipments.Shipment.Height}}</Height>
                </Dimensions>
                <PackageWeight>
                    <UnitOfMeasurement>
                        <Code>KGS</Code>
                        <Description>KILOGRAMS</Description>
                    </UnitOfMeasurement>
                    <Weight>{{Shipments.Shipment.Weight}}</Weight>
                </PackageWeight>
                <PackageServiceOptions>
                    <InsuredValue>
                        <Type>
                            <Code>01</Code>
                        </Type>
                        <CurrencyCode>USD</CurrencyCode>
                        <MonetaryValue>{{Shipments.Shipment.Insurance}}</MonetaryValue>
                    </InsuredValue>
                    <DeclaredValue>
                        <Type>
                            <Code>01</Code>
                        </Type>
                        <CurrencyCode>{{Shipments.Shipment.InsuranceCurrency}}</CurrencyCode>
                        <MonetaryValue>{{Shipments.Shipment.DeclaredValue}}</MonetaryValue>
                    </DeclaredValue>
                </PackageServiceOptions>
            </Package>
            <ShipmentServiceOptions></ShipmentServiceOptions>
        </Shipment>
        <LabelSpecification>
            <LabelPrintMethod>
                <Code>GIF</Code>
                <Description>GIF</Description>
            </LabelPrintMethod>
            <LabelImageFormat>
                <Code>GIF</Code>
                <Description>GIF</Description>
            </LabelImageFormat>
        </LabelSpecification>
    </ShipmentConfirmRequest>
</root>`;

const xmlResponseShipDocUPS = 
`<?xml version="1.0"?>
  <AccessRequest xml:lang="en-US">
    <AccessLicenseNumber>${UPS_ACCOUNT_NUMBER}</AccessLicenseNumber>
    <UserId>${UPS_USER}</UserId>
    <Password>${UPS_PASSWORD}</Password>
  </AccessRequest>
  <ShipmentAcceptRequest>
    <Request>
      <TransactionReference>
        <CustomerContext>Your Customer Context.</CustomerContext>
      </TransactionReference>
      <RequestAction>ShipAccept</RequestAction>
      <RequestOption>01</RequestOption>
    </Request>
    <ShipmentDigest>{{ShipmentDigest}}</ShipmentDigest>
  </ShipmentAcceptRequest>`;

function ShipmentDBUPS(upscoId, shipper, recipient, shipment, Pickup, Provider, company, dat, ShipmentCode, package, req2UPS) {
    return {
        ShipmentID: upscoId,
        business: {
            business: company.CompanyID,
            brachOffice: company.branchoffices,
            collaborator: company.Collaborator,
        },
        origin: {
            cityOrigin: {
                cityName: dat.Origin.CityName,
                stateOrProvinceCode: dat.Origin.StateCode,
                postalCode: dat.Origin.PostalCode,
                countryCode: dat.Origin.CountryCode,
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
                cityName: dat.Destination.CityName,
                stateOrProvinceCode: dat.Destination.StateCode,
                postalCode: dat.Destination.PostalCode,
                countryCode: dat.Destination.CountryCode,
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
            IsDocument: dat.Shipments.documentShipment,
            DocumentContent: dat.Shipments.DocumentContent,
            serviceType: dat.Shipments.serviceType,
            packagingType: dat.Shipments.packagingType,
            description: dat.Shipments.description,
            Comments: dat.Shipments.Comments,
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
            packageLabels: req2UPS.LabelImage, 
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
            ProviderAmount: req2UPS.MonetaryValue,
            FinalUserAmount: req2UPS.FinalUserAmount,
            ConversionRate: req2UPS.ConversionRate,
            PublicAmount: req2UPS.PublicAmount,
            Currency: "COP",
        },
        billPayment: {
            paymentType: shipment.PaymentType,
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
        alerts: "",
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
        respShip: req2UPS,
        err: {
            provides: "",
            typeError: "",
            er: {}
        }
    };
}
function resProUPS(resp,dat) {
    return {
        partners: "FDX",
        serviceType: resp.RateReply[0].RateReplyDetails[0].ServiceDescription[0].Code[0],
        serviceName: resp.RateReply[0].RateReplyDetails[0].ServiceDescription[0].ServiceType[0],
        packagingType: resp.RateReply[0].RateReplyDetails[0].PackagingType[0],
        deliveryDate: resp.RateReply[0].RateReplyDetails[0].DeliveryTimestamp[0],
        totalNetFedExCharge: resp.RateReply[0].RateReplyDetails[0].RatedShipmentDetails[0].ShipmentRateDetail[0].TotalNetChargeWithDutiesAndTaxes[0].Amount[0] 
    };
}



module.exports = {
    xmlQuotaUPS,
    xmlShipDocUPS,
    xmlShipPkgUPS,
	xmlResponseShipDocUPS,
	ShipmentDBUPS,
	resProUPS,
	
};
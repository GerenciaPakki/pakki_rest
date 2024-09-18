const dotenv = require('dotenv');
const { DateTime } = require('luxon');
const { ConvertDateUPS } = require('../../helpers/pakkiDateTime');
const {
    UPS_USER,
    UPS_PASSWORD,
    UPS_BILLSHIPPER,
    UPS_ACCOUNT_NUMBER
} = require('../../utils/config');

// Creating a date time object
const date = DateTime.local().toISODate();
const dateQuota = DateTime.fromFormat(date, 'yyyyMMdd').toISODate(); // Output: '2023-02-24'
const horaQuota = DateTime.fromFormat(date, 'HHmm');

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
                ShipperNumber: "7359XW",
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
const xmlQuotaUPS_Beta =
    `<?xml version="1.0"?>
<AccessRequest xml:lang="en-US">
    <AccessLicenseNumber>${UPS_ACCOUNT_NUMBER}</AccessLicenseNumber> 
    <UserId>${UPS_USER}</UserId> 
    <Password>${UPS_PASSWORD}</Password>
</AccessRequest>
<?xml version="1.0"?>
<RatingServiceSelectionRequest xml:lang="en-US">
    <Request>
        <TransactionReference>
            <CustomerContext>PAKKI</CustomerContext>
        </TransactionReference>
        <RequestAction>RateTimeInTransit</RequestAction>
        <RequestOption>RateTimeInTransit</RequestOption>
    </Request>
    <Shipment>
        <Shipper>
            <!-- numero que se incluye para tener tarifas de retail o publicas-->
            <ShipperNumber>${UPS_BILLSHIPPER}</ShipperNumber>
            <Address>
                <AddressLine1>Address Line 1</AddressLine1>
                <City>Bogota</City>
                <StateProvinceCode>DC</StateProvinceCode>
                <PostalCode>111111</PostalCode>
                <CountryCode>CO</CountryCode>
            </Address>
        </Shipper>
        <ShipTo>
            <Address>
                <AddressLine1/>
                <City>{{Destination.CityName}}</City>
                <StateProvinceCode>{{Destination.StateCode}}</StateProvinceCode>
                <PostalCode>{{Destination.PostalCode}}</PostalCode>
                <CountryCode>{{Destination.CountryCode}}</CountryCode>
            </Address>
        </ShipTo>
        <ShipFrom>
            <Address>
                <AddressLine1>Address Line 1</AddressLine1>
                <City>{{Origin.CityName}}</City>
                <StateProvinceCode>{{Origin.StateCode}}</StateProvinceCode>
                <PostalCode>{{Origin.PostalCode}}</PostalCode>
                <CountryCode>{{Origin.CountryCode}}</CountryCode>
            </Address>
        </ShipFrom>
        <Service>
            <!-- Service codes 08 Expedited, 65 WorldWide Saver, 07 Express -->
            <Code>65</Code>
            <Description/>
        </Service>
        <Package>
            <PackagingType>
                <!-- Package types. 00 = UNKNOWN; 01 = UPS Letter; ... -->
                <Code>01</Code>
                <Description>UPS Letter</Description>
            </PackagingType>
            <PackageWeight>
                <UnitOfMeasurement>
                    <Code>KGS</Code>
                </UnitOfMeasurement>
                <Weight>{{Shipments.Shipment.Weight}}</Weight>
            </PackageWeight>
            <Dimensions>
                <Length>{{Shipments.Shipment.Length}}</Length> 
                <Width>{{Shipments.Shipment.Width}}</Width> 
                <Height>{{Shipments.Shipment.Height}}</Height>
            </Dimensions>
            <PackageServiceOptions>
                <InsuredValue>
                    <MonetaryValue>{{Shipments.Shipment.Insurance}}</MonetaryValue>
                    <CurrencyCode>USD</CurrencyCode>
                </InsuredValue>
            </PackageServiceOptions>
        </Package>
        <RateInformation>
            <NegotiatedRatesIndicator/>
            <RateChartIndicator/>
        </RateInformation>
        <DeliveryTimeInformation>
            <PackageBillType>03</PackageBillType>
            <Pickup/>
        </DeliveryTimeInformation>
        <ShipmentTotalWeight>
            <UnitOfMeasurement>
                <Code>KGS</Code>
            </UnitOfMeasurement>
            <Weight>{{Shipments.Shipment.Weight}}</Weight>
        </ShipmentTotalWeight>
        <InvoiceLineTotal>
            <CurrencyCode>USD</CurrencyCode>
            <MonetaryValue>1</MonetaryValue>
        </InvoiceLineTotal>
        <ShipmentServiceOptions/>
        <TaxInformationIndicator/>
    </Shipment>
</RatingServiceSelectionRequest>`;

const xmlQuotaUPS_Import =
    `<?xml version="1.0"?>
<AccessRequest xml:lang="en-US">
    <AccessLicenseNumber>${UPS_ACCOUNT_NUMBER}</AccessLicenseNumber> 
    <UserId>${UPS_USER}</UserId> 
    <Password>${UPS_PASSWORD}</Password>
</AccessRequest>
<?xml version="1.0"?>
<RatingServiceSelectionRequest xml:lang="en-US">
    <Request>
        <TransactionReference>
            <CustomerContext>PAKKI</CustomerContext>
        </TransactionReference>
        <RequestAction>RateTimeInTransit</RequestAction>
        <RequestOption>RateTimeInTransit</RequestOption>
    </Request>
    <Shipment>
        <Shipper>
            <!-- numero que se incluye para tener tarifas de retail o publicas-->
            <ShipperNumber>${UPS_BILLSHIPPER}</ShipperNumber>
            <Address>
                <AddressLine1>Address Line 1</AddressLine1>
                <City>Bogota</City>
                <StateProvinceCode>DC</StateProvinceCode>
                <PostalCode>111111</PostalCode>
                <CountryCode>CO</CountryCode>
            </Address>
        </Shipper>
        <ShipTo>
            <Address>
                <AddressLine1/>
                <City>{{Destination.CityName}}</City>
                <StateProvinceCode>{{Destination.StateCode}}</StateProvinceCode>
                <PostalCode>{{Destination.PostalCode}}</PostalCode>
                <CountryCode>{{Destination.CountryCode}}</CountryCode>
            </Address>
        </ShipTo>
        <ShipFrom>
            <Address>
                <AddressLine1>Address Line 1</AddressLine1>
                <City>{{Origin.CityName}}</City>
                <StateProvinceCode>{{Origin.StateCode}}</StateProvinceCode>
                <PostalCode>{{Origin.PostalCode}}</PostalCode>
                <CountryCode>{{Origin.CountryCode}}</CountryCode>
            </Address>
        </ShipFrom>
        <Service>
            <!-- Service codes 08 Expedited, 65 WorldWide Saver, 07 Express -->
            <Code>65</Code>
            <Description/>
        </Service>
        <Package>
            <PackagingType>
                <!-- Package types. 00 = UNKNOWN; 01 = UPS Letter; ... -->
                <Code>00</Code>
                <Description>UNKNOWN</Description>
            </PackagingType>
            <PackageWeight>
                <UnitOfMeasurement>
                    <Code>LBS</Code>
                </UnitOfMeasurement>
                <Weight>{{Shipments.Shipment.Weight}}</Weight>
            </PackageWeight>
            <Dimensions>
                <Length>{{Shipments.Shipment.Length}}</Length> 
                <Width>{{Shipments.Shipment.Width}}</Width> 
                <Height>{{Shipments.Shipment.Height}}</Height>
            </Dimensions>
            <PackageServiceOptions>
                <InsuredValue>
                    <MonetaryValue>{{Shipments.Shipment.Insurance}}</MonetaryValue>
                    <CurrencyCode>USD</CurrencyCode>
                </InsuredValue>
            </PackageServiceOptions>
        </Package>
        <RateInformation>
            <NegotiatedRatesIndicator/>
            <RateChartIndicator/>
        </RateInformation>
        <DeliveryTimeInformation>
            <PackageBillType>03</PackageBillType>
            <Pickup/>
        </DeliveryTimeInformation>
        <ShipmentTotalWeight>
            <UnitOfMeasurement>
                <Code>KGS</Code>
            </UnitOfMeasurement>
            <Weight>{{Shipments.Shipment.Weight}}</Weight>
        </ShipmentTotalWeight>
        <InvoiceLineTotal>
            <CurrencyCode>USD</CurrencyCode>
            <MonetaryValue>1</MonetaryValue>
        </InvoiceLineTotal>
        <ShipmentServiceOptions/>
        <TaxInformationIndicator/>
    </Shipment>
</RatingServiceSelectionRequest>`;


const xmlShipmentUPS = {
	"AccessRequest": {
    AccessLicenseNumber: "CD393505DC755C88",
    UserId: "YoTraigo.com",
    Password: "Colombia1"
    },
    RatingServiceSelectionRequest: {
        '@xml:lang': "en-US",
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
                ShipperNumber: "7359XW",
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
                    City: "Bogota",
                    StateProvinceCode: "",
                    PostalCode: "111111",
                    CountryCode: "CO"
                }
            },
            ShipFrom: {
                CompanyName: "",
                AttentionName: "",
                PhoneNumber: "",
                FaxNumber: "",
                Address: {
                    AddressLine1: "",
                    City: "MIAMI",
                    StateProvinceCode: "",
                    PostalCode: "33166",
                    CountryCode: "US"
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
                        Code: "KGS"
                    },
                    Weight: "0.5"
                },
                Dimensions: {
                    UnitOfMeasurement: {
                        Code: "CM"
                    },
                    Length: "1",
                    Width: "1",
                    Height: "3"
                },
                PackageServiceOptions: {
                    InsuredValue: {
                        MonetaryValue: "100",
                        CurrencyCode: "USD"
                    }
                }
            },
            RateInformation: {
                NegotiatedRatesIndicator: null,
                RateChartIndicator: null
            },
            DeliveryTimeInformation: {
                PackageBillType: "03",
                Pickup: {
                    Date: "20220820",
                    Time: "1751"
                }
            },
            ShipmentTotalWeight: {
                UnitOfMeasurement: {
                    Code: "KGS"
                },
                Weight: "0.5"
            },
            InvoiceLineTotal: {
                CurrencyCode: "USD",
                MonetaryValue: "1"
            },
            ShipmentServiceOptions: null,
            TaxInformationIndicator: null
        }
    }
};

function quotaJsonUPSDataBase(resp, bus, uid, dat,SurchargePakki) {
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
            partner: "UPS",
            service: resp.Service.Code,
            arrivalDate: DateTime.local().plus({ days: resp.GuaranteedDelivery.BusinessDaysInTransit }).toISODate(),
            arrivalTime: '23:59:00',
            ProvicerDiscount: SurchargePakki.ProvicerDiscount,
            exchangeRate: SurchargePakki.exchangeRate,
            shippingValue: SurchargePakki.shippingValue.toLocaleString("co"),
            PublicAmount: SurchargePakki.PublicAmount.toLocaleString("co"),
        }
    };
}

async function resXmlProUPS(resp, SurchargePakki) {
    const DateArrival = await ConvertDateUPS(resp.TimeInTransit[0].ServiceSummary[0].EstimatedArrival[0].Arrival[0].Date[0])
    const TimeArrival = '23:00'//resp.TimeInTransit[0].ServiceSummary[0].EstimatedArrival[0].Arrival[0].Time[0]
    return {
        partners: "UPS",
        serviceType: resp.Service[0].Code[0],
        serviceName: resp.TimeInTransit[0].ServiceSummary[0].Service[0].Description[0],
        exchangeRate: SurchargePakki.exchangeRate,
        shipValueNeto: SurchargePakki.shipValueNeto,
        valueNetoTrm: SurchargePakki.valueNetoTrm,
        // packagingType:
        deliveryDate: DateArrival + ' ' + TimeArrival,
        deliveryTime: TimeArrival,
        shippingValue: SurchargePakki.shippingValue.toLocaleString("co"),
        PublicAmount: SurchargePakki.PublicAmount.toLocaleString("co"),
        conditions:'Requiere programar recolección telefonica. Requiere Impresión de GUIA. Precio corresponde a transporte. No incluye Impuestos en Destino. Se puede entregar en Punto Aliado. Sujeto a revisión aduanal en destino.'
    };
}

function quotaXmlUPSDataBase(resp, bus, uid, dat, SurchargePakki) {
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
            weightUnit: resp.BillingWeight?.[0]?.UnitOfMeasurement?.[0]?.Code?.[0],
            weigh: dat.Shipments.Shipment.Weight,
            length: dat.Shipments.Shipment.Length,
            width: dat.Shipments.Shipment.Width,
            height: dat.Shipments.Shipment.Height,
        },
        provider: {
            partner: "UPS",
            service: resp.TimeInTransit?.[0]?.ServiceSummary?.[0]?.Service?.[0]?.Description?.[0],
            exchangeRate: SurchargePakki.exchangeRate,
            shipValueNeto: SurchargePakki.shipValueNeto,
            valueNetoTrm: SurchargePakki.valueNetoTrm,
            arrivalDate: resp.TimeInTransit?.[0]?.ServiceSummary?.[0]?.EstimatedArrival?.[0]?.Arrival?.[0]?.Date?.[0],
            arrivalTime: resp.TimeInTransit?.[0]?.ServiceSummary?.[0]?.EstimatedArrival?.[0]?.Arrival?.[0]?.Time?.[0],
            shippingCurrency: resp.NegotiatedRates?.[0]?.NetSummaryCharges?.[0]?.GrandTotal?.[0]?.CurrencyCode?.[0] ?? resp.TransportationCharges?.[0]?.CurrencyCode?.[0],
            shippingValue: resp.NegotiatedRates?.[0]?.NetSummaryCharges?.[0]?.GrandTotal?.[0]?.MonetaryValue?.[0] ?? resp.TransportationCharges?.[0]?.MonetaryValue?.[0],
        }
    };
}

function resProUPS(resp) {
    return {
        partner: "UPS",
        serviceType: resp.Service.Code,
        serviceName: resp.Service.Description,
        packagingType: "Sin Definir",
        deliveryDate: resp.GuaranteedDelivery.BusinessDaysInTransit,
        totalNetFedExCharge: resp.TotalCharges.MonetaryValue
    };
}
function handleError(error, location, bus, uid) {
  let typeError = '';
  let msgError = {};
  if (error instanceof ReferenceError) {
    typeError = 'ReferenceError';
    msgError = error.message;
  } else if (error instanceof TypeError) {
    typeError = 'TypeError';
    msgError = error.message;
  } else {
    typeError = 'General';
    msgError = error.response.data.response;
  }

  function typeErrorMsg(bus, provides, typeError, er, location) {
    return new Promise((resolve, reject) => {
      const MSG_ERROR = {
        business: {
          business: bus,
          collaborator: uid
        },
        "err.provides": provides,
        "err.typeError": typeError,
        "err.er": er,
        "location": location
      };
      quotations.create(MSG_ERROR, function (err, res) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(res);
          resolve(res);
        }
      });
    });
  }

  const MSG_ERROR = typeErrorMsg(bus, 'Es Error FDX_CO', typeError, msgError, location);

  return {
    typeError: typeError,
    msgError: msgError,
    FDX_ERROR: MSG_ERROR,
  };
}




module.exports = {
    xmlQuotaUPS,
    xmlShipmentUPS,
    xmlQuotaUPS_Beta,
    xmlQuotaUPS_Import,
    quotaJsonUPSDataBase,
    resXmlProUPS,
    quotaXmlUPSDataBase,
    resProUPS,
    handleError,
};
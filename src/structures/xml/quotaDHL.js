// const { env } = require('../../utils/config');
const { DateTime } = require('luxon');
const { fecha, dates, calcularFecha } = require('../../helpers/pakkiDateTime');
const { DHL_USER,DHL_PASSWORD,DHL_ACCOUNT_NUMBER, DHL_ACCOUNT_NUMBER_IMPORT } = require('../../utils/config');


const SiteID = DHL_USER
const PasswordID = DHL_PASSWORD
const AccountNumber = DHL_ACCOUNT_NUMBER
const AccountNumberImport = DHL_ACCOUNT_NUMBER_IMPORT



// Creating a date time object
const date = DateTime.now();

const QuotaXmlDHL = 
`<?xml version="1.0" encoding="UTF-8"?>
<p:DCTRequest xmlns:p="http://www.dhl.com" xmlns:p1="http://www.dhl.com/datatypes" 
xmlns:p2="http://www.dhl.com/DCTRequestdatatypes" 
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
xsi:schemaLocation="http://www.dhl.com DCT-req.xsd ">
	<GetQuote>
		<Request>
			<ServiceHeader>
				<MessageTime>2020-05-18T17:51:00</MessageTime>
				<MessageReference>1234567890123456789012345678901</MessageReference>
				<SiteID>${SiteID}</SiteID>
            	<Password>${PasswordID}</Password>
			</ServiceHeader>
		</Request>
		<From>		
			<CountryCode>{{Origin.CountryCode}}</CountryCode>
			<Postalcode>{{Origin.PostalCode}}</Postalcode>
			<City>{{Origin.CityName}}</City>
		</From>
		<BkgDetails>
			<PaymentCountryCode>CO</PaymentCountryCode>
			<Date>{{Shipments.DateTimeDHL}}</Date>
			<ReadyTime>PT17H51M</ReadyTime>
			<ReadyTimeGMTOffset>-05:00</ReadyTimeGMTOffset>
			<DimensionUnit>CM</DimensionUnit>
			<WeightUnit>KG</WeightUnit>
			<Pieces>
				<Piece>
					<PieceID>1</PieceID>
					<Height>{{Shipments.Shipment.Height}}</Height>
					<Depth>{{Shipments.Shipment.Length}}</Depth>
					<Width>{{Shipments.Shipment.Width}}</Width>
					<Weight>{{Shipments.Shipment.Weight}}</Weight>
				</Piece>
			</Pieces>
			<PaymentAccountNumber>${AccountNumber}</PaymentAccountNumber>
			<IsDutiable>{{Shipments.IsDutiable}}</IsDutiable>
			<NetworkTypeCode>AL</NetworkTypeCode>
			<QtdShp>
				<GlobalProductCode>{{Shipments.packagingTypeDHL}}</GlobalProductCode>
				<LocalProductCode>{{Shipments.packagingTypeDHL}}</LocalProductCode>
			</QtdShp>
			<InsuredValue>{{Shipments.Shipment.Insurance}}</InsuredValue>
			<InsuredCurrency>{{Shipments.Shipment.InsuranceCurrency}}</InsuredCurrency>
		</BkgDetails>
		<To>
			<CountryCode>{{Destination.CountryCode}}</CountryCode>
			<Postalcode>{{Destination.PostalCode}}</Postalcode>
			<City>{{Destination.CityName}}</City>
		</To>
		<Dutiable>
			<DeclaredCurrency>{{Shipments.Shipment.InsuranceCurrency}}</DeclaredCurrency>
			<DeclaredValue>{{Shipments.Shipment.DeclaredValue}}</DeclaredValue>
		</Dutiable>
	</GetQuote>
</p:DCTRequest>`;

const QuotaXmlDHL_Import = 
`<?xml version="1.0" encoding="UTF-8"?>
<p:DCTRequest xmlns:p="http://www.dhl.com" xmlns:p1="http://www.dhl.com/datatypes" 
xmlns:p2="http://www.dhl.com/DCTRequestdatatypes" 
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
xsi:schemaLocation="http://www.dhl.com DCT-req.xsd ">
	<GetQuote>
		<Request>
			<ServiceHeader>
				<MessageTime>2020-05-18T17:51:00</MessageTime>
				<MessageReference>1234567890123456789012345678901</MessageReference>
				<SiteID>${SiteID}</SiteID>
            	<Password>${PasswordID}</Password>
			</ServiceHeader>
		</Request>
		<From>		
			<CountryCode>{{Origin.CountryCode}}</CountryCode>
			<Postalcode>{{Origin.PostalCode}}</Postalcode>
			<City>{{Origin.CityName}}</City>
		</From>
		<BkgDetails>
			<PaymentCountryCode>CO</PaymentCountryCode>
			<Date>{{Shipments.DateTimeDHL}}</Date>
			<ReadyTime>PT17H51M</ReadyTime>
			<ReadyTimeGMTOffset>-05:00</ReadyTimeGMTOffset>
			<DimensionUnit>CM</DimensionUnit>
			<WeightUnit>KG</WeightUnit>
			<Pieces>
				<Piece>
					<PieceID>1</PieceID>
					<Height>{{Shipments.Shipment.Height}}</Height>
					<Depth>{{Shipments.Shipment.Length}}</Depth>
					<Width>{{Shipments.Shipment.Width}}</Width>
					<Weight>{{Shipments.Shipment.Weight}}</Weight>
				</Piece>
			</Pieces>
			<PaymentAccountNumber>${AccountNumberImport}</PaymentAccountNumber>
			<IsDutiable>{{Shipments.IsDutiable}}</IsDutiable>
			<NetworkTypeCode>AL</NetworkTypeCode>
			<QtdShp>
				<GlobalProductCode>{{Shipments.packagingTypeDHL}}</GlobalProductCode>
				<LocalProductCode>{{Shipments.packagingTypeDHL}}</LocalProductCode>
			</QtdShp>
			<InsuredValue>{{Shipments.Shipment.Insurance}}</InsuredValue>
			<InsuredCurrency>{{Shipments.Shipment.InsuranceCurrency}}</InsuredCurrency>
		</BkgDetails>
		<To>
			<CountryCode>{{Destination.CountryCode}}</CountryCode>
			<Postalcode>{{Destination.PostalCode}}</Postalcode>
			<City>{{Destination.CityName}}</City>
		</To>
		<Dutiable>
			<DeclaredCurrency>{{Shipments.Shipment.InsuranceCurrency}}</DeclaredCurrency>
			<DeclaredValue>{{Shipments.Shipment.DeclaredValue}}</DeclaredValue>
		</Dutiable>
	</GetQuote>
</p:DCTRequest>`;

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
            partners: "DHL",
            service: SurchargePakki.ServiceType,
            arrivalDate: resp.BkgDetails[0].QtdShp[0].DeliveryDate[0],
            arrivalTime: '23:59:00',
            ProvicerDiscount: SurchargePakki.ProvicerDiscount,
            exchangeRate: SurchargePakki.exchangeRate.toLocaleString("co"),
            shipValueNeto: SurchargePakki.shipValueNeto,
            valueNetoTrm: SurchargePakki.valueNetoTrm.toLocaleString("co"),
            PublicAmount: SurchargePakki.PublicAmount.toLocaleString("co"),
            shippingValue: SurchargePakki.shippingValue.toLocaleString("co"),
        }
    };
}
function resProDHL(resp, dat, SurchargePakki) {
	
	const sumDays = parseInt(resp.BkgDetails[0].QtdShp[0].TotalTransitDays[0]) + parseInt(resp.BkgDetails[0].QtdShp[0].DestinationDayOfWeekNum[0]);
	const arrivalTime =  '23:59'
	return {
        partners: "DHL",
        serviceType: resp.BkgDetails[0].QtdShp[0].LocalProductName[0],
        serviceName: resp.BkgDetails[0].QtdShp[0].ProductShortName[0],
        exchangeRate: SurchargePakki.exchangeRate,
        shipValueNeto: SurchargePakki.shipValueNeto,
        valueNetoTrm: SurchargePakki.valueNetoTrm.toLocaleString("co"),
        packagingType: dat.Shipments.packagingTypeDHL,
        deliveryDate: calcularFecha(sumDays) + ' ' + arrivalTime,
        shippingValue: SurchargePakki.shippingValue.toLocaleString("co"),
        PublicAmount: SurchargePakki.PublicAmount.toLocaleString("co"),
        conditions:'Requiere impresión de GUIA. Se puede entregar en Punto Aliado. Precio corresponde a transporte. No incluye Impuestos en Destino. Seguro Adicional. Sujeto a revisión aduanal en destino.'
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
    msgError = error.response.data;
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
	QuotaXmlDHL,
  QuotaXmlDHL_Import,
	quotaJsonUPSDataBase,
	resProDHL,
	handleError,
};
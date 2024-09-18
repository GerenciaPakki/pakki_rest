const dotenv = require('dotenv');
const { DateTime } = require('luxon');
const { calcularFecha } = require('../../helpers/pakkiDateTime');
const { CDR_ACCOUNT_NUMBER, CDR_USER, CDR_PASSWORD } = require('../../utils/config');

// Creating a date time object
const date = DateTime.now();

const QuotaXmlCDR = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://ws.coordinadora.com/ags/1.5/server.php">
	<soapenv:Header/>
	<soapenv:Body>
		<ser:Cotizador_cotizar>
			<p>
				<nit>${CDR_ACCOUNT_NUMBER}</nit>
				<div>01</div>
				<cuenta>2</cuenta>
				<producto>0</producto>
				<origen>{{Origin.DANECode}}</origen>
				<destino>{{Destination.DANECode}}</destino>
				<valoracion>{{Shipments.Shipment.Insurance}}</valoracion>
				<nivel_servicio>
					<item>1</item>
				</nivel_servicio>
				<detalle>
					<item>
						<ubl>0</ubl>
						<alto>{{Shipments.Shipment.Height}}</alto>
						<ancho>{{Shipments.Shipment.Width}}</ancho>
						<largo>{{Shipments.Shipment.Length}}</largo>
						<peso>{{Shipments.Shipment.Weight}}</peso>
						<unidades>1</unidades>
					</item>
				</detalle>
				<apikey>${CDR_USER}</apikey>
				<clave>${CDR_PASSWORD}</clave>
			</p>
		</ser:Cotizador_cotizar>
	</soapenv:Body>
</soapenv:Envelope>`;

function quotaJsonCDRDataBase(resp, bus, uid, dat,SurchargePakki) {
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
            partners: "CDR",
            service: SurchargePakki.ServiceType,
            arrivalDate: calcularFecha(resp.dias_entrega[0]),
            arrivalTime: '23:59:00',
            shippingCurrency: 'COP',
            shippingValue: resp.flete_total[0],
        }
    };
}
function resProCDR(resp,dat) {
    return {
        partners: "CDR",
        serviceType: resp.producto[0],
        serviceName: SurchargePakki.ServiceType,
        packagingType: dat.Shipments.packagingTypeCRD,
        deliveryDate:  calcularFecha(resp.dias_entrega[0]) + ' '+ '23:59:00',
        shipValueNeto: SurchargePakki.shipValueNeto,
        shippingValue: SurchargePakki.shippingValue,
        PublicAmount: SurchargePakki.PublicAmount,
        conditions:'Envios Estandar en Colombia en mas de 1440 destinos. Requiere Imprimir GUIA. Entrega puerta a Puerta sujeta a disponibilidad.'
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
	QuotaXmlCDR,
	quotaJsonCDRDataBase,
	resProCDR,
};
const dotenv = require('dotenv');
const { DateTime } = require('luxon');
const { CDR_ACCOUNT_NUMBER_SHIP, CDR_USER_SHIP, CDR_PASSWORD_SHIP, CDR_PASSWORD, CDR_USER } = require('../../utils/config');

// Creating a date time object
const date = DateTime.now();

const ShipXml_1_CDR = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://sandbox.coordinadora.com/agw/ws/guias/1.6/server.php" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">
    <soapenv:Header/>
    <soapenv:Body>
        <ser:Guias_generarGuia soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <p xsi:type="ser:Agw_typeGenerarGuiaIn">
                <codigo_remision xsi:type="xsd:string"/>
                <fecha xsi:type="xsd:string"/>
                <id_cliente xsi:type="xsd:int">${CDR_ACCOUNT_NUMBER_SHIP}</id_cliente>
                <id_remitente xsi:type="xsd:int"/>
                <nit_remitente xsi:type="xsd:string"/>
                <nombre_remitente xsi:type="xsd:string">{{Origin.ContactName}}</nombre_remitente>
                <direccion_remitente xsi:type="xsd:string">{{Origin.Address}} {{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</direccion_remitente>
                <telefono_remitente xsi:type="xsd:string">{{Origin.ContactPhone}}</telefono_remitente>
                <ciudad_remitente xsi:type="xsd:string">{{Origin.DANECode}}</ciudad_remitente>
                <nit_destinatario xsi:type="xsd:string"/>
                <div_destinatario xsi:type="xsd:string"/>
                <nombre_destinatario xsi:type="xsd:string">{{Destination.ContactName}}</nombre_destinatario>
                <direccion_destinatario xsi:type="xsd:string">{{Destination.Address}} {{Destination.AddressAdditional}} {{Destination.AddressAdditional2}}</direccion_destinatario>
                <ciudad_destinatario xsi:type="xsd:string">{{Destination.DANECode}}</telefono_destinatario>
                <valor_declarado xsi:type="xsd:float">{{Shipments.Shipment.DeclaredValue}}</valor_declarado>
                <codigo_cuenta xsi:type="xsd:int">2</codigo_cuenta>
                <codigo_producto xsi:type="xsd:int">0</codigo_producto>
                <nivel_servicio xsi:type="xsd:int">1</nivel_servicio>
                <linea xsi:type="xsd:string"/>
                <contenido xsi:type="xsd:string">{{Shipments.Shipment.Content}}</contenido>
                <referencia xsi:type="xsd:string">{{Shipments.Shipment.Reference}}</referencia>
                <observaciones xsi:type="xsd:string">{{Shipments.Comments}}</observaciones>
                <estado xsi:type="xsd:string">IMPRESO</estado>
                <detalle>
                    <item xsi:type="ns1:Agw_typeGuiaDetalle">
                        <ubl xsi:type="xsd:int">0</ubl>
                        <alto>{{Shipments.Shipment.Height}}</alto>
						<ancho>{{Shipments.Shipment.Width}}</ancho>
						<largo>{{Shipments.Shipment.Length}}</largo>
						<peso>{{Shipments.Shipment.Weight}}</peso>
                        <unidades xsi:type="xsd:int">1</unidades>
                        <referencia xsi:type="xsd:string"/>
                        <nombre_empaque xsi:type="xsd:string">Empaque Personalizado</nombre_empaque>
                    </item>
                </detalle>
                <usuario xsi:type="xsd:string">${CDR_USER_SHIP}</usuario>
                <clave xsi:type="xsd:string">${CDR_PASSWORD_SHIP}</clave>
            </p>
        </ser:Guias_generarGuia>
    </soapenv:Body>
</soapenv:Envelope>`;

const ShipXml_2_CDR = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://sandbox.coordinadora.com/agw/ws/guias/1.6/server.php">
    <soapenv:Header/>
    <soapenv:Body>
        <ser:Guias_imprimirRotulos soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <p xsi:type="ser:Agw_imprimirRotulosIn">
                <id_rotulo xsi:type="xsd:string">59</id_rotulo>
                <codigos_remisiones xsi:type="soapenc:Array" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">
                    <item>{{ShipmentCode}}</item>
                </codigos_remisiones>
                <usuario xsi:type="xsd:string">${CDR_USER_SHIP}</usuario>
                <clave xsi:type="xsd:string">${CDR_PASSWORD_SHIP}</clave>
            </p>
        </ser:Guias_imprimirRotulos>
    </soapenv:Body>
</soapenv:Envelope>`;

const ShipXml_3_CDR = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://sandbox.coordinadora.com/ags/1.5/server.php">
    <soapenv:Header/>
    <soapenv:Body>
        <ser:Recogidas_programar>
            <p>
                <modalidad>5</modalidad>
                <fecha_recogida>{{Pickup.DateTime1}}</fecha_recogida>
                <ciudad_origen>{{Origin.DANECode}}</ciudad_origen>
                <ciudad_destino>{{Destination.DANECode}}</ciudad_destino>
                <nombre_destinatario/>
                <nit_destinatario/>
                <direccion_destinatario/>
                <telefono_destinatario>{{Destination.ContactPhone}}</telefono_destinatario>
                <nombre_empresa>${CDR_USER_SHIP}</nombre_empresa>
                <nombre_contacto>{{Origin.ContactName}}</nombre_contacto>
                <direccion>{{Origin.Address}} {{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</direccion>
                <telefono>{{Origin.ContactPhone}}</telefono>
                <producto>4</producto>
                <referencia/>
                <nivel_servicio>1</nivel_servicio>
                <guia_inicial/>
                <nit_cliente>901154626</nit_cliente>
                <div_cliente>01</div_cliente>
                <persona_autoriza>PERSONA QUE AUTORIZA</persona_autoriza>
                <telefono_autoriza>1</telefono_autoriza>
                <tipo_notificacion>1</tipo_notificacion>
                <destino_notificacion>{{Origin.ContactEmail}}</destino_notificacion>
                <valor_declarado>{{Shipments.Shipment.DeclaredValue}}</valor_declarado>
                <unidades>1</unidades>
                <observaciones/>
                <estado>0</estado>
                <apikey>${CDR_USER}</apikey>
                <clave>${CDR_PASSWORD}</clave>
            </p>
        </ser:Recogidas_programar>
    </soapenv:Body>
</soapenv:Envelope>`;

function ShipmentDB(crdcoId, dat, ShipmentCode, package, req2CDR) {
    return {
        ShipmentID: crdcoId,
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
            packagingType: dat.Shipments.Shipment.packagingTypefdx,
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
            packageLabels: req2CDR, 
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
            FinalUserAmount: dat.Provider.shippingValue,
            ConversionRate: "TRM",
            PublicAmount: "VALOR PUBLICO",
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
        respShip: req2CDR,
        err: {
            provides: "",
            typeError: "",
            er: {}
        }
    };
}
function resProCDR(resp,dat) {
    return {
        partners: "CDR",
        serviceType: resp.producto[0],
        serviceName: SurchargePakki.ServiceType,
        packagingType: dat.Shipments.packagingTypeCRD,
        deliveryDate:  calcularFecha(resp.dias_entrega[0]),
		shippingValue: SurchargePakki.shippingValue,
		PublicAmount: SurchargePakki.PublicAmount, 
    };
}

module.exports = {
    ShipXml_1_CDR,
    ShipXml_2_CDR,
    ShipXml_3_CDR,
    ShipmentDB,
    resProCDR,
};
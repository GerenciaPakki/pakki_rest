const dotenv = require('dotenv');
const { DateTime } = require('luxon');

// Creating a date time object
const date = DateTime.local();

const fechaActual = DateTime.now().toISODate(); // Obtenemos la fecha actual en formato ISO (YYYY-MM-DD)
// Formatear la fecha y hora en el formato deseado
const formattedDate = date.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

//TODO: HAY QUE VALIDAR EL DANECODE
const ShipXml_1_CDR = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://guias.coordinadora.com/ws/guias/1.6/server.php" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">
    <soapenv:Header/>
    <soapenv:Body>
        <ser:Guias_generarGuia soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <p xsi:type="ser:Agw_typeGenerarGuiaIn">
                <codigo_remision xsi:type="xsd:string"/>
                <fecha xsi:type="xsd:string"/>
                <id_cliente xsi:type="xsd:int">34557</id_cliente>
                <id_remitente xsi:type="xsd:int"/>
                <nit_remitente xsi:type="xsd:string"/>
                <nombre_remitente xsi:type="xsd:string">{{Origin.ContactName}}</nombre_remitente>
                <direccion_remitente xsi:type="xsd:string">{{Origin.Address}}</direccion_remitente>
                <telefono_remitente xsi:type="xsd:string">{{Origin.ContactPhone}}</telefono_remitente>
                <ciudad_remitente xsi:type="xsd:string">{{Origin.DANECode}}</ciudad_remitente>
                <nit_destinatario xsi:type="xsd:string"/>
                <div_destinatario xsi:type="xsd:string"/>
                <nombre_destinatario xsi:type="xsd:string">{{Destination.ContactName}}</nombre_destinatario>
                <direccion_destinatario xsi:type="xsd:string">{{Destination.Address}}</direccion_destinatario>
                <ciudad_destinatario xsi:type="xsd:string">{{Destination.DANECode}}</ciudad_destinatario>
                <telefono_destinatario xsi:type="xsd:string">{{Destination.ContactPhone}}</telefono_destinatario>
                <valor_declarado xsi:type="xsd:float">{{Shipments.Shipment.DeclaredValue}}</valor_declarado>
                <codigo_cuenta xsi:type="xsd:int">2</codigo_cuenta>
                <codigo_producto xsi:type="xsd:int">0</codigo_producto>
                <nivel_servicio xsi:type="xsd:int">1</nivel_servicio>
                <linea xsi:type="xsd:string"/>
                <contenido xsi:type="xsd:string">{{Shipments.Shipment.Content}}</contenido>
                <referencia xsi:type="xsd:string"/>
                <observaciones xsi:type="xsd:string"/>
                <estado xsi:type="xsd:string">IMPRESO</estado>
                <detalle>
                    <item xsi:type="ns1:Agw_typeGuiaDetalle">
                        <ubl xsi:type="xsd:int">0</ubl>
                        <alto xsi:type="xsd:float">{{Shipments.Shipment.Height}}</alto>
                        <ancho xsi:type="xsd:float">{{Shipments.Shipment.Width}}</ancho>
                        <largo xsi:type="xsd:float">{{Shipments.Shipment.Length}}</largo>
                        <peso xsi:type="xsd:float">{{Shipments.Shipment.Weight}}</peso>
                        <unidades xsi:type="xsd:int">1</unidades>
                        <referencia xsi:type="xsd:string"/>
                        <nombre_empaque xsi:type="xsd:string">Empaque Personalizado</nombre_empaque>
                    </item>
                </detalle>
                <usuario xsi:type="xsd:string">yotraigo.ws</usuario>
                <clave xsi:type="xsd:string">b980f931e3f9e0f73742431fc4b4d27f096f3912efc894c5a657b078eee32364</clave>
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
                <usuario xsi:type="xsd:string">yotraigo.ws</usuario>
                <clave xsi:type="xsd:string">b980f931e3f9e0f73742431fc4b4d27f096f3912efc894c5a657b078eee32364</clave>
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
				<telefono_destinatario/>
				<nombre_empresa>{{Origin.CompanyName}}</nombre_empresa>
				<nombre_contacto>{{Origin.ContactName}}</nombre_contacto>
				<direccion>{{Origin.Address}} {{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</direccion>
				<telefono>{{Origin.ContactPhone}}</telefono>
				<producto>4</producto>
				<referencia>{{Shipments.Shipment.Reference}}</referencia>
				<nivel_servicio>1</nivel_servicio>
				<guia_inicial/>
				<nit_cliente>901154626</nit_cliente>
				<div_cliente>01</div_cliente>
				<persona_autoriza>PERSONA QUE AUTORIZA</persona_autoriza>
				<telefono_autoriza>1</telefono_autoriza>
				<tipo_notificacion>1</tipo_notificacion>
				<destino_notificacion>{{Destination.ContactEmail}}</destino_notificacion>
				<valor_declarado>{{Shipments.Shipment.DeclaredValue}}</valor_declarado>
				<unidades>1</unidades>
				<observaciones>{{Shipments.Shipment.PackQuantity}}</observaciones>
				<estado>0</estado>
				<apikey>9c6ca50c-1bba-11eb-adc1-0242ac120002</apikey>
				<clave>sN7eX7sX3xF1tD4g</clave>
			</p>
		</ser:Recogidas_programar>
	</soapenv:Body>
</soapenv:Envelope>`;









module.exports = {
    ShipXml_1_CDR,
    ShipXml_2_CDR,
    ShipXml_3_CDR,
};
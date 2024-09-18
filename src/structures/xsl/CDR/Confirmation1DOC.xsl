<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" indent="yes"/>
    <!-- FUNCTION TO FORMAT DATE-->
    <xsl:template name="formatdate">
        <xsl:param name="DateTimeStr"/>
        <xsl:variable name="datestr">
            <xsl:value-of select="substring-before($DateTimeStr,'T')"/>
        </xsl:variable>
        <xsl:variable name="mm">
            <xsl:value-of select="substring($datestr,6,2)"/>
        </xsl:variable>
        <xsl:variable name="dd">
            <xsl:value-of select="substring($datestr,9,2)"/>
        </xsl:variable>
        <xsl:variable name="yyyy">
            <xsl:value-of select="substring($datestr,1,4)"/>
        </xsl:variable>
        <xsl:value-of select="concat($yyyy,'-',$mm,'-',$dd)"/>
    </xsl:template>
    <xsl:template match="/">
        <xsl:for-each select="/ConfirmationRQ">
            <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://guias.coordinadora.com/ws/guias/1.6/server.php" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">
                <soapenv:Header/>
                <soapenv:Body>
                    <ser:Guias_generarGuia soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                        <p xsi:type="ser:Agw_typeGenerarGuiaIn">
                            <!--You may enter the following 41 items in any order-->
                            <codigo_remision xsi:type="xsd:string"/>
                            <fecha xsi:type="xsd:string"/>
                            <id_cliente xsi:type="xsd:int">34557</id_cliente>
                            <id_remitente xsi:type="xsd:int"/>
                            <nit_remitente xsi:type="xsd:string"/>
                            <nombre_remitente xsi:type="xsd:string">
                                <xsl:value-of select="Origin/ContactName"/>
                            </nombre_remitente>
                            <!-- SOLO TENEMOS 1 LINEA PARA DIRECCION CONCATENAR?-->
                            <direccion_remitente xsi:type="xsd:string">
                                <xsl:value-of select="concat(Origin/Address,' ', Origin/AddressAdditional)"/>
                            </direccion_remitente>
                            <telefono_remitente xsi:type="xsd:string">
                                <xsl:value-of select="Origin/ContactPhone"/>
                            </telefono_remitente>
                            <ciudad_remitente xsi:type="xsd:string">
                                <xsl:value-of select="Origin/DANECode"/>
                            </ciudad_remitente>
                            <nit_destinatario xsi:type="xsd:string"/>
                            <div_destinatario xsi:type="xsd:string"/>
                            <nombre_destinatario xsi:type="xsd:string">
                                <xsl:value-of select="Destination/ContactName"/>
                            </nombre_destinatario>
                            <direccion_destinatario xsi:type="xsd:string">
                                <xsl:value-of select="concat(Destination/Address,' ',Destination/AddressAdditional)"/>
                            </direccion_destinatario>
                            <ciudad_destinatario xsi:type="xsd:string">
                                <xsl:value-of select="Destination/DANECode"/>
                            </ciudad_destinatario>
                            <telefono_destinatario xsi:type="xsd:string">
                                <xsl:value-of select="Destination/ContactPhone"/>
                            </telefono_destinatario>
                            <!-- PONEMOS SI ES <10000 POR DEFECTO 1000 SI ES >10000 EL VALOR DECLARADO -->
                            <valor_declarado xsi:type="xsd:float">
                                <xsl:choose>
                                    <xsl:when test="Shipments/Shipment/Insurance &lt;= 10000">10000</xsl:when>
                                    <xsl:otherwise>
                                        <xsl:value-of select="Shipments/Shipment/Insurance"/>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </valor_declarado>
                            <codigo_cuenta xsi:type="xsd:int">2</codigo_cuenta>
                            <codigo_producto xsi:type="xsd:int">0</codigo_producto>
                            <nivel_servicio xsi:type="xsd:int">1</nivel_servicio>
                            <linea xsi:type="xsd:string"/>
                            <!-- PARA ESTE CAMPO ES SELECCIONAR SI ES DOCUMENTO SE QUEMA DOCUMENTO DE LO CONTRARIO TOMA EL VALOR DEL CAMPO  -->
                            <contenido xsi:type="xsd:string">Documento</contenido>
                            <!-- TOMAMOS EL CAMPO Información de referencia -->
                            <referencia xsi:type="xsd:string"/>
                            <observaciones xsi:type="xsd:string"/>
                            <estado xsi:type="xsd:string">IMPRESO</estado>
                            <detalle>
                                <item xsi:type="ns1:Agw_typeGuiaDetalle">
                                    <ubl xsi:type="xsd:int">0</ubl>
                                    <alto xsi:type="xsd:float">
                                        <xsl:value-of select="Shipments/Shipment/Height"/>
                                    </alto>
                                    <ancho xsi:type="xsd:float">
                                        <xsl:value-of select="Shipments/Shipment/Width"/>
                                    </ancho>
                                    <largo xsi:type="xsd:float">
                                        <xsl:value-of select="Shipments/Shipment/Length"/>
                                    </largo>
                                    <peso xsi:type="xsd:float">
                                        <xsl:value-of select="Shipments/Shipment/Weight"/>
                                    </peso>
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
            </soapenv:Envelope>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" indent="yes"/>
    <xsl:template match="/">
        <xsl:for-each select="/QuotationRQ">
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                xmlns="http://fedex.com/ws/rate/v26">
                <soapenv:Header/>
                <soapenv:Body>
                    <RateRequest>
                        <WebAuthenticationDetail>
                            <ParentCredential>
                                <Key>
                                    <xsl:value-of select="Authentication/Key"/>
                                </Key>
                                <Password>
                                    <xsl:value-of select="Authentication/Password"/>
                                </Password>
                            </ParentCredential>
                            <UserCredential>
                                <Key>
                                    <xsl:value-of select="Authentication/Key"/>
                                </Key>
                                <Password>
                                    <xsl:value-of select="Authentication/Password"/>
                                </Password>
                            </UserCredential>
                        </WebAuthenticationDetail>
                        <ClientDetail xmlns="http://fedex.com/ws/rate/v26">
                            <AccountNumber>
                                <xsl:value-of select="Account"/>
                            </AccountNumber>
                            <MeterNumber>251581259</MeterNumber>
                        </ClientDetail>
                        <TransactionDetail xmlns="http://fedex.com/ws/rate/v26">
                            <CustomerTransactionId>***Rate Request using PAKKI***</CustomerTransactionId>
                        </TransactionDetail>
                        <Version xmlns="http://fedex.com/ws/rate/v26">
                            <ServiceId>crs</ServiceId>
                            <Major>26</Major>
                            <Intermediate>0</Intermediate>
                            <Minor>0</Minor>
                        </Version>
                        <ReturnTransitAndCommit xmlns="http://fedex.com/ws/rate/v26">true</ReturnTransitAndCommit>
                        <RequestedShipment xmlns="http://fedex.com/ws/rate/v26">
                            <ShipTimestamp>
                                <!--@ShipDateTime-->
                                <!--2020-05-04T17:00:05.5584487-05:00-->
                                <xsl:value-of select="Pickup/DateTime"/>
                            </ShipTimestamp>
                            <ServiceType>
                                <!--@ServiceCode-->
                                <!--INTERNATIONAL_PRIORITY-->
                                <xsl:value-of select="ServiceCode"/>
                            </ServiceType>
                            <PackagingType>
                                <xsl:choose>
                                    <xsl:when test="Shipments/Shipment/Weight &lt;= 0.5 and
									Destination/CountryCode != Origin/CountryCode">FEDEX_ENVELOPE</xsl:when>
                                    <xsl:when test="Shipments/Shipment/Weight &lt;= 0.5 and
									Destination/CountryCode = Origin/CountryCode">FEDEX_ENVELOPE</xsl:when>
                                    <xsl:when test="Shipments/Shipment/Weight &gt; 0.5 and
									Destination/CountryCode != Origin/CountryCode">FEDEX_PAK</xsl:when>
                                    <xsl:otherwise>YOUR_PACKAGING</xsl:otherwise>
                                </xsl:choose>
                            </PackagingType>
                            <TotalInsuredValue>
                                <Currency>USD</Currency>
                                <Amount>0</Amount>
                            </TotalInsuredValue>
                            <Shipper>
                                <Address>
                                    <StreetLines>SHIPPER ADDRESS LINE 1</StreetLines>
                                    <City>
                                        <!--@@OriginCityName-->
                                        <!--BOGOTA-->
                                        <xsl:value-of select="Origin/CityName"/>
                                    </City>
                                    <StateOrProvinceCode>
                                        <!--@@OriginStateCode-->
                                        <!--DC-->
                                        <xsl:value-of select="Origin/StateCode"/>
                                    </StateOrProvinceCode>
                                    <PostalCode>
                                        <!--@@OriginPostalCode-->
                                        <!--111111-->
                                        <xsl:value-of select="Origin/PostalCode"/>
                                    </PostalCode>
                                    <CountryCode>
                                        <!--@@OriginCountryCode-->
                                        <!--CO-->
                                        <xsl:value-of select="Origin/CountryCode"/>
                                    </CountryCode>
                                </Address>
                            </Shipper>
                            <Recipient>
                                <Address>
                                    <StreetLines>RECIPIENT ADDRESS LINE 1</StreetLines>
                                    <City>
                                        <!--@@DestinationCityName-->
                                        <!--Miami-->
                                        <xsl:value-of select="Destination/CityName"/>
                                    </City>
                                    <StateOrProvinceCode>
                                        <!--@@DestinationStateCode-->
                                        <!--FL-->
                                        <xsl:value-of select="Destination/StateCode"/>
                                    </StateOrProvinceCode>
                                    <PostalCode>
                                        <!--@@DestinationPostalCode-->
                                        <!--33101-->
                                        <xsl:value-of select="Destination/PostalCode"/>
                                    </PostalCode>
                                    <CountryCode>
                                        <!--@@DestinationCountryCode-->
                                        <!--US-->
                                        <xsl:value-of select="Destination/CountryCode"/>
                                    </CountryCode>
                                </Address>
                            </Recipient>
                            <RateRequestTypes>LIST</RateRequestTypes>
                            <PackageCount>1</PackageCount>
                            <RequestedPackageLineItems>
                                <SequenceNumber>1</SequenceNumber>
                                <GroupPackageCount>1</GroupPackageCount>
                                <InsuredValue>
                                    <Currency>USD</Currency>
                                    <!--@@InsuranceValue-->
                                    <!--0-->
                                    <Amount>0</Amount>
                                </InsuredValue>
                                <Weight>
                                    <Units>KG</Units>
                                    <Value>
                                        <!--@@WeightValue-->
                                        <!--1.5-->
                                        <xsl:value-of select="Shipments/Shipment/Weight"/>
                                    </Value>
                                </Weight>
                                <Dimensions>
                                    <!--@@LengthValue-->
                                    <!--1-->
                                    <Length>20</Length>
                                    <!--@@WidthValue-->
                                    <!--10-->
                                    <Width>10</Width>
                                    <!--@@HeightValue-->
                                    <!--20-->
                                    <Height>1</Height>
                                    <Units>CM</Units>
                                </Dimensions>
                            </RequestedPackageLineItems>
                        </RequestedShipment>
                    </RateRequest>
                </soapenv:Body>
            </soapenv:Envelope>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>

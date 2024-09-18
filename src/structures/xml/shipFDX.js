const dotenv = require('dotenv');
const { DateTime } = require('luxon');
const { FDX_USER, FDX_PASSWORD, FDX_ACCOUNT_NUMBER, FDX_ACCOUNT_MATER_NUMBER } = require('../../utils/config');

// Creating a date time object
const date = DateTime.local();
const fechaFormateada = date.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

const ShipXML_FDX_DOC = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v28="http://fedex.com/ws/ship/v28">
    <soapenv:Header/>
    <soapenv:Body>
        <ProcessShipmentRequest xmlns="http://fedex.com/ws/ship/v28">
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
                <CustomerTransactionId>PAKKI</CustomerTransactionId>
            </TransactionDetail>
            <Version>
                <ServiceId>ship</ServiceId>
                <Major>28</Major>
                <Intermediate>0</Intermediate>
                <Minor>0</Minor>
            </Version>
            <RequestedShipment>
                <ShipTimestamp>${fechaFormateada}</ShipTimestamp>
                <DropoffType>REGULAR_PICKUP</DropoffType>
                <ServiceType>{{Shipments.serviceType}}</ServiceType>
                <PackagingType>{{Shipments.packagingType}}</PackagingType>
                <PreferredCurrency>USD</PreferredCurrency>
                <Shipper>
                    <Contact>
                        <PersonName>{{Origin.ContactName}}</PersonName>
                        <CompanyName>{{Origin.CompanyName}}</CompanyName>
                        <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
                        <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
                    </Contact>
                    <Address>
                        <StreetLines>{{Origin.Address}}</StreetLines>
                        <StreetLines>{{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</StreetLines>
                        <City>{{Origin.CityName}}</City>
                        <StateOrProvinceCode>{{Origin.StateCode}}</StateOrProvinceCode>
                        <PostalCode>{{Origin.PostalCode}}</PostalCode>
                        <CountryCode>{{Origin.CountryCode}}</CountryCode>
                    </Address>
                </Shipper>
                <Recipient>
                    <Contact>
                        <PersonName>{{Destination.ContactName}}</PersonName>
                        <CompanyName>{{Destination.CompanyName}}</CompanyName>
                        <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
                        <EMailAddress>{{Destination.ContactEmail}}</EMailAddress>
                    </Contact>
                    <Address>
                        <StreetLines>{{Destination.Address}}</StreetLines>
                        <StreetLines>{{Destination.AddressAdditional}} {{Destination.AddressAdditional2}}</StreetLines>
                        <City>{{Destination.CityName}}</City>
                        <StateOrProvinceCode>{{Destination.StateCode}}</StateOrProvinceCode>
                        <PostalCode>{{Destination.PostalCode}}</PostalCode>
                        <CountryCode>{{Destination.CountryCode}}</CountryCode>
                    </Address>
                </Recipient>
                <RecipientLocationNumber>123456</RecipientLocationNumber>
                <ShippingChargesPayment>
                    <PaymentType>SENDER</PaymentType>
                    <Payor>
                        <ResponsibleParty>
                            <!-- Este numero cambia cuando sea Nacional o Internacional -->
                            <AccountNumber>${FDX_ACCOUNT_NUMBER}</AccountNumber>
                            <Contact>
                                <ContactId>12345</ContactId>
                                <PersonName>Dhillon</PersonName>
                            </Contact>
                        </ResponsibleParty>
                    </Payor>
                </ShippingChargesPayment>
                <CustomsClearanceDetail>
                    <DutiesPayment>
                        <PaymentType>RECIPIENT</PaymentType>
                    </DutiesPayment>
                    <DocumentContent>DOCUMENTS_ONLY</DocumentContent>
                    <CustomsValue>
                        <Currency>{{Shipments.Shipment.InsuranceCurrency}}</Currency>
                        <Amount>{{Shipments.Shipment.Insurance}}</Amount>
                    </CustomsValue>
                    <Commodities>
                        <NumberOfPieces>1</NumberOfPieces>
                        <Description>Correspondence</Description>
                        <CountryOfManufacture>US</CountryOfManufacture>
                        <Weight>
                            <Units>KG</Units>
                            <Value>0</Value>
                        </Weight>
                        <Quantity>1</Quantity>
                        <QuantityUnits>CM</QuantityUnits>
                        <UnitPrice>
                            <Currency>{{Shipments.Shipment.InsuranceCurrency}}</Currency>
                            <Amount>0</Amount>
                        </UnitPrice>
                        <CustomsValue>
                            <Currency>{{Shipments.Shipment.InsuranceCurrency}}</Currency>
                            <Amount>{{Shipments.Shipment.Insurance}}</Amount>
                        </CustomsValue>
                    </Commodities>
                </CustomsClearanceDetail>
                <LabelSpecification>
                    <LabelFormatType>COMMON2D</LabelFormatType>
                    <ImageType>PDF</ImageType>
                    <LabelStockType>PAPER_8.5X11_TOP_HALF_LABEL</LabelStockType>
                    <LabelPrintingOrientation>TOP_EDGE_OF_TEXT_FIRST</LabelPrintingOrientation>
                </LabelSpecification>
                <RateRequestTypes>LIST</RateRequestTypes>
                <PackageCount>{{Shipments.Shipment.PackQuantity}}</PackageCount>
                <RequestedPackageLineItems>
                    <SequenceNumber>1</SequenceNumber>
                    <InsuredValue>
                        <Currency>{{Shipments.Shipment.InsuranceCurrency}}</Currency>
                        <Amount>{{Shipments.Shipment.Insurance}}</Amount>
                    </InsuredValue>
                    <Weight>
                        <Units>{{Shipments.Shipment.WeightUnit}}</Units>
                        <Value>{{Shipments.Shipment.Weight}}</Value>
                    </Weight>
                    <Dimensions>
                        <Length>{{Shipments.Shipment.Length}}</Length>
                        <Width>{{Shipments.Shipment.Width}}</Width>
                        <Height>{{Shipments.Shipment.Height}}</Height>
                        <Units>{{Shipments.Shipment.DimUnit}}</Units>
                    </Dimensions>
                </RequestedPackageLineItems>
            </RequestedShipment>
        </ProcessShipmentRequest>
    </soapenv:Body>
</soapenv:Envelope>`;

const ShipXML_FDX = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://fedex.com/ws/ship/v28">
    <soapenv:Header/>
    <soapenv:Body>
        <ProcessShipmentRequest xmlns="http://fedex.com/ws/ship/v28">
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
                <CustomerTransactionId>PAKKI</CustomerTransactionId>
            </TransactionDetail>
            <Version>
                <ServiceId>ship</ServiceId>
                <Major>28</Major>
                <Intermediate>0</Intermediate>
                <Minor>0</Minor>
            </Version>
            <RequestedShipment>
                <ShipTimestamp>${fechaFormateada}</ShipTimestamp>
                <DropoffType>REGULAR_PICKUP</DropoffType>
                <ServiceType>{{Shipments.serviceType}}</ServiceType>
                <PackagingType>{{Shipments.packagingType}}</PackagingType>
                <TotalInsuredValue>
                    <Currency>USD</Currency>
                    <Amount>0.00</Amount>
                </TotalInsuredValue>
                <PreferredCurrency>USD</PreferredCurrency>
                <Shipper>
                    <Tins>
                        <TinType>BUSINESS_NATIONAL</TinType>
                        <Number/>
                    </Tins>
                    <Contact>
                        <PersonName>{{Origin.ContactName}}</PersonName>
                        <CompanyName>{{Origin.CompanyName}}</CompanyName>
                        <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
                        <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
                    </Contact>
                    <Address>
                        <StreetLines>{{Origin.Address}}</StreetLines>
                        <StreetLines>{{Origin.AddressAdditional}}</StreetLines>
                        <StreetLines>{{Origin.AddressAdditional2}}</StreetLines>
                        <City>{{Origin.CityName}}</City>
                        <StateOrProvinceCode>{{Origin.StateCode}}</StateOrProvinceCode>
                        <PostalCode>{{Origin.PostalCode}}</PostalCode>
                        <CountryCode>{{Origin.CountryCode}}</CountryCode>
                    </Address>
                </Shipper>
                <Recipient>
                    <Tins>
                        <TinType>BUSINESS_NATIONAL</TinType>
                        <Number/>
                    </Tins>
                    <Contact>
                        <PersonName>{{Destination.ContactName}}</PersonName>
                        <CompanyName>{{Destination.CompanyName}}</CompanyName>
                        <PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
                        <EMailAddress>{{Destination.ContactEmail}}</EMailAddress>
                    </Contact>
                    <Address>
                        <StreetLines>{{Destination.Address}}</StreetLines>
                        <StreetLines>{{Destination.AddressAdditional}}</StreetLines>
                        <StreetLines>{{Destination.AddressAdditional2}}</StreetLines>
                        <City>{{Destination.CityName}}</City>
                        <StateOrProvinceCode>{{Destination.StateCode}}</StateOrProvinceCode>
                        <PostalCode>{{Destination.PostalCode}}</PostalCode>
                        <CountryCode>{{Destination.CountryCode}}</CountryCode>
                    </Address>
                </Recipient>
                <RecipientLocationNumber>123456</RecipientLocationNumber>
                <ShippingChargesPayment>
                    <PaymentType>SENDER</PaymentType>
                    <Payor>
                        <ResponsibleParty>
                            <AccountNumber>${FDX_ACCOUNT_NUMBER}</AccountNumber>
                            <Contact>
                                <ContactId>12345</ContactId>
                                <PersonName>Dhillon</PersonName>
                            </Contact>
                        </ResponsibleParty>
                    </Payor>
                </ShippingChargesPayment>
                <CustomsClearanceDetail> </CustomsClearanceDetail>
                <LabelSpecification>
                    <LabelFormatType>COMMON2D</LabelFormatType>
                    <ImageType>PDF</ImageType>
                    <LabelStockType>PAPER_8.5X11_TOP_HALF_LABEL</LabelStockType>
                    <LabelPrintingOrientation>TOP_EDGE_OF_TEXT_FIRST</LabelPrintingOrientation>
                </LabelSpecification>
                <ShippingDocumentSpecification>
                    <ShippingDocumentTypes>PRO_FORMA_INVOICE</ShippingDocumentTypes>
                    <CommercialInvoiceDetail>
                        <Format>
                            <ImageType>PDF</ImageType>
                            <StockType>PAPER_LETTER</StockType>
                            <ProvideInstructions>1</ProvideInstructions>
                        </Format>
                    </CommercialInvoiceDetail>
                </ShippingDocumentSpecification>
                <RateRequestTypes>LIST</RateRequestTypes>
                <PackageCount>{{Shipments.Shipment.PackQuantity}}</PackageCount>
                <RequestedPackageLineItems>
                    <SequenceNumber>1</SequenceNumber>
                    <InsuredValue>
                        <Currency>{{Shipments.Shipment.InsuranceCurrency}}</Currency>
                        <Amount>{{Shipments.Shipment.Insurance}}</Amount>
                    </InsuredValue>
                    <Weight>
                        <Units>{{Shipments.Shipment.WeightUnit}}</Units>
                        <Value>{{Shipments.Shipment.Weight}}</Value>
                    </Weight>
                    <Dimensions>
                        <Length>{{Shipments.Shipment.Length}}</Length>
                        <Width>{{Shipments.Shipment.Width}}</Width>
                        <Height>{{Shipments.Shipment.Height}}</Height>
                        <Units>{{Shipments.Shipment.DimUnit}}</Units>
                    </Dimensions>
                </RequestedPackageLineItems>
            </RequestedShipment>
        </ProcessShipmentRequest>
    </soapenv:Body>
</soapenv:Envelope>`;

const ShipXML_FDX_PKG = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://fedex.com/ws/ship/v28">
    <soapenv:Header/>
    <soapenv:Body>
        <ProcessShipmentRequest>
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
                <CustomerTransactionId>PAKKI</CustomerTransactionId>
            </TransactionDetail>
            <Version>
                <ServiceId>ship</ServiceId>
                <Major>28</Major>
                <Intermediate>0</Intermediate>
                <Minor>0</Minor>
            </Version>
            <RequestedShipment>
                <ShipTimestamp>${fechaFormateada}</ShipTimestamp>
                <DropoffType>REGULAR_PICKUP</DropoffType>
                <ServiceType>{{Shipments.serviceType}}</ServiceType>
                <PackagingType>{{Shipments.packagingType}}</PackagingType>
                <PreferredCurrency>USD</PreferredCurrency>
                <Shipper>
                    <Contact>
                        <PersonName>{{Origin.ContactName}}</PersonName>
                        <CompanyName>{{Origin.CompanyName}}</CompanyName>
                        <PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
                        <EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
                    </Contact>
                    <Address>
                        <StreetLines>CALLE 9 # 78 A-31</StreetLines>
                        <StreetLines/>
                        <StreetLines/>
                        <City>Bogota</City>
                        <StateOrProvinceCode>DC</StateOrProvinceCode>
                        <PostalCode>110111</PostalCode>
                        <CountryCode>CO</CountryCode>
                    </Address>
                </Shipper>
                <Recipient>
                    <Tins>
                        <TinType>BUSINESS_NATIONAL</TinType>
                        <Number/>
                    </Tins>
                    <Contact>
                        <PersonName>VIVIANA PARRA BONILLA</PersonName>
                        <CompanyName>VIVIANA PARRA BONILLA</CompanyName>
                        <PhoneNumber>3107352684</PhoneNumber>
                        <EMailAddress>LUCESTEJIDOS.33@GMAI.COM</EMailAddress>
                    </Contact>
                    <Address>
                        <StreetLines>2215 UNIVERSITY BLVD E 204</StreetLines>
                        <StreetLines/>
                        <StreetLines/>
                        <City>Hyattsville</City>
                        <StateOrProvinceCode>MD</StateOrProvinceCode>
                        <PostalCode>20783</PostalCode>
                        <CountryCode>US</CountryCode>
                    </Address>
                </Recipient>
                <RecipientLocationNumber>123456</RecipientLocationNumber>
                <ShippingChargesPayment>
                    <PaymentType>SENDER</PaymentType>
                    <Payor>
                        <ResponsibleParty>
                            <AccountNumber>${FDX_ACCOUNT_NUMBER}</AccountNumber>
                            <Contact>
                                <ContactId>12345</ContactId>
                                <PersonName>Dhillon</PersonName>
                            </Contact>
                        </ResponsibleParty>
                    </Payor>
                </ShippingChargesPayment>
                <CustomsClearanceDetail>
                    <DutiesPayment>
                        <PaymentType>RECIPIENT</PaymentType>
                    </DutiesPayment>
                    <DocumentContent>NON_DOCUMENTS</DocumentContent>
                    <CustomsValue>
                        <Currency>USD</Currency>
                        <Amount>359.00</Amount>
                    </CustomsValue>
                    <CommercialInvoice>
                        <Comments>IMITATION JEWELRY . </Comments>
                        <SpecialInstructions/>
                        <Purpose>PERSONAL_EFFECTS</Purpose>
                        <CustomerReferences>
                            <CustomerReferenceType>INVOICE_NUMBER</CustomerReferenceType>
                            <Value/>
                        </CustomerReferences>
                    </CommercialInvoice>
                    <Commodities></Commodities>
                </CustomsClearanceDetail>
                <LabelSpecification>
                    <LabelFormatType>COMMON2D</LabelFormatType>
                    <ImageType>PDF</ImageType>
                    <LabelStockType>PAPER_8.5X11_TOP_HALF_LABEL</LabelStockType>
                    <LabelPrintingOrientation>TOP_EDGE_OF_TEXT_FIRST</LabelPrintingOrientation>
                </LabelSpecification>
                <ShippingDocumentSpecification>
                    <ShippingDocumentTypes>PRO_FORMA_INVOICE</ShippingDocumentTypes>
                    <CommercialInvoiceDetail>
                        <Format>
                            <ImageType>PDF</ImageType>
                            <StockType>PAPER_LETTER</StockType>
                            <ProvideInstructions>1</ProvideInstructions>
                        </Format>
                    </CommercialInvoiceDetail>
                </ShippingDocumentSpecification>
                <RateRequestTypes>LIST</RateRequestTypes>
                <PackageCount>1</PackageCount>
                <RequestedPackageLineItems>
                    <SequenceNumber>1</SequenceNumber>
                    <InsuredValue>
                        <Currency>USD</Currency>
                        <Amount>0.00</Amount>
                    </InsuredValue>
                    <Weight>
                        <Units>KG</Units>
                        <Value>9.00</Value>
                    </Weight>
                    <Dimensions>
                        <Length>28</Length>
                        <Width>15</Width>
                        <Height>43</Height>
                        <Units>CM</Units>
                    </Dimensions>
                </RequestedPackageLineItems>
            </RequestedShipment>
        </ProcessShipmentRequest>
    </soapenv:Body>
</soapenv:Envelope>`;


const ShipXSLT_FDX_PKG = 
`<CustomsClearanceDetail>
    <DutiesPayment>
        <PaymentType>{{Invoice.ReasonCode}}</PaymentType>
    </DutiesPayment>
    <DocumentContent>NON_DOCUMENTS</DocumentContent>
    <CustomsValue>
        <Currency>{{Invoice.InsuranceCurrency}}</Currency>
        <Amount>{{Invoice.TotalValue}}</Amount>
    </CustomsValue>
    <Commodities>
        <NumberOfPieces>{{Invoice.Items.Item.Pieces}}</NumberOfPieces>
        <Description>{{Invoice.Items.Item.ItemDescription}}</Description>
        <CountryOfManufacture>{{Invoice.CountryOfManufacture}}</CountryOfManufacture>
        <Weight>
            <Units>{{Invoice.WeightUnits}}</Units>
            <Value>{{Invoice.Items.Item.WeightPerUnit}}</Value>
        </Weight>
        <Quantity>{{Invoice.Items.Item.Pieces}}</Quantity>
        <QuantityUnits>IN</QuantityUnits>
        <UnitPrice>
            <Currency>{{Invoice.InsuranceCurrency}}</Currency>
            <Amount>{{Invoice.Items.Item.ValuePerUnit}}</Amount>
        </UnitPrice>
    </Commodities>
</CustomsClearanceDetail>`;

const PickupXML_FDX = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://fedex.com/ws/pickup/v23">
    <soapenv:Header/>
    <soapenv:Body>
        <CreatePickupRequest>
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
                <CustomerTransactionId>PAKKI</CustomerTransactionId>
            </TransactionDetail>
            <Version>
                <ServiceId>disp</ServiceId>
                <Major>23</Major>
                <Intermediate>0</Intermediate>
                <Minor>0</Minor>
            </Version>
            <AssociatedAccountNumber>
                <Type>FEDEX_EXPRESS</Type>
                <AccountNumber>${FDX_ACCOUNT_NUMBER}</AccountNumber>
            </AssociatedAccountNumber>
            <OriginDetail>
                <PickupLocation>
                    <Contact>
                        <PersonName>{{Pickup.ContactName}}</PersonName>
                        <CompanyName>{{Pickup.CompanyName}}</CompanyName>
                        <PhoneNumber>{{Pickup.ContactPhone}}</PhoneNumber>
                        <EMailAddress>{{Pickup.EmailAddress}}</EMailAddress>
                    </Contact>
                    <Address>
                        <StreetLines>{{Pickup.Address}} {{Pickup.AddressAdditional}} {{Pickup.AddressAdditional1}}</StreetLines>
                        <City>{{Pickup.City}}</City>
                        <StateOrProvinceCode>{{Pickup.StateOrProvinceCode}}</StateOrProvinceCode>
                        <PostalCode>{{Pickup.PostalCode}}</PostalCode>
                        <CountryCode>{{Pickup.CountryCode}}</CountryCode>
                    </Address>
                </PickupLocation>
                <ReadyTimestamp>{{Pickup.DateTime}}</ReadyTimestamp>
                <CompanyCloseTime>{{Pickup.TimeEnd}}:00</CompanyCloseTime>
            </OriginDetail>
            <PackageCount>{{Shipments.Shipment.PackQuantity}}</PackageCount>
            <TotalWeight>
                <Units>KG</Units>
                <Value>{{Shipments.Shipment.Weight}}</Value>
            </TotalWeight>
            <CarrierCode>FDXE</CarrierCode>
            <OversizePackageCount>0</OversizePackageCount>
            <Remarks/>
            <CommodityDescription>IMITATION JEWELRY</CommodityDescription>
            <CountryRelationship>DOMESTIC</CountryRelationship>
        </CreatePickupRequest>
    </soapenv:Body>
</soapenv:Envelope>`;

function ShipmentDBFDX(fdxcoId, dat, ShipmentCode, label, package, resp,SurchargePakki) {
    return {
        ShipmentID: fdxcoId,
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
            packagingType: dat.Shipments.packagingTypefdx,
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
            package: package , // Este es para almacenar los objetos de paquetes cuando sean 1 o mas
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
            ConversionRate: SurchargePakki.exchangeRate.Rate,
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
        alerts: resp.Notifications,
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
function resProFDX(resp,dat) {
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
    ShipXML_FDX_DOC,
    ShipXML_FDX,
    ShipXML_FDX_PKG,
    ShipXSLT_FDX_PKG,
    PickupXML_FDX,
    ShipmentDBFDX,
    resProFDX,
};
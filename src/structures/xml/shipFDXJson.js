const dotenv = require('dotenv');
const { DateTime } = require('luxon');

// Creating a date time object
const date = DateTime.local();
const fechaHoraActualConOffset = date.toISO({ includeOffset: true });

const XMLShipFDX_DOC_IE = 
`<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v28="http://fedex.com/ws/ship/v28">
	<soapenv:Header/>
	<soapenv:Body>
		<ProcessShipmentRequest xmlns="http://fedex.com/ws/ship/v28">
			<WebAuthenticationDetail>
				<ParentCredential>
					<Key>kdBYw7jROlAa5GnA</Key>
					<Password>jCWYtaXuy003QuZcQXiGtQYZO</Password>
				</ParentCredential>
				<UserCredential>
					<Key>kdBYw7jROlAa5GnA</Key>
					<Password>jCWYtaXuy003QuZcQXiGtQYZO</Password>
				</UserCredential>
			</WebAuthenticationDetail>
			<ClientDetail>
				<AccountNumber></AccountNumber>
				<MeterNumber>251581259</MeterNumber>
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
				<ShipTimestamp>{{Pickup.DateTime}}</ShipTimestamp>
				<DropoffType>REGULAR_PICKUP</DropoffType>
				<ServiceType>INTERNATIONAL_ECONOMY</ServiceType>
				<PackagingType>{{shipment.packagingTypefdx}}</PackagingType>
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
						<StreetLines/>
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
						<StreetLines/>
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
								<AccountNumber>855651050</AccountNumber>
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
						<Currency>USD</Currency>
						<Amount>0</Amount>
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
							<Currency>USD</Currency>
							<Amount>0</Amount>
						</UnitPrice>
						<CustomsValue>
							<Currency>USD</Currency>
							<Amount>0</Amount>
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
				<PackageCount>1</PackageCount>
				<RequestedPackageLineItems>
					<SequenceNumber>1</SequenceNumber>
					<InsuredValue>
						<Currency>USD</Currency>
						<Amount>0</Amount>
					</InsuredValue>
					<Weight>
						<Units>KG</Units>
						<Value>0.5</Value>
					</Weight>
					<Dimensions>
						<Length>20</Length>
						<Width>10</Width>
						<Height>1</Height>
						<Units>CM</Units>
					</Dimensions>
				</RequestedPackageLineItems>
			</RequestedShipment>
		</ProcessShipmentRequest>
	</soapenv:Body>
</soapenv:Envelope>
`;
// const XMLShipFDX_DOC_IP = 
// `<?xml version="1.0"?>
// <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v28="http://fedex.com/ws/ship/v28">
// 	<soapenv:Header/>
// 	<soapenv:Body>
// 		<ProcessShipmentRequest xmlns="http://fedex.com/ws/ship/v28">
// 			<WebAuthenticationDetail>
// 				<ParentCredential>
// 					<Key>kdBYw7jROlAa5GnA</Key>
// 					<Password>jCWYtaXuy003QuZcQXiGtQYZO</Password>
// 				</ParentCredential>
// 				<UserCredential>
// 					<Key>kdBYw7jROlAa5GnA</Key>
// 					<Password>jCWYtaXuy003QuZcQXiGtQYZO</Password>
// 				</UserCredential>
// 			</WebAuthenticationDetail>
// 			<ClientDetail>
// 				<AccountNumber>855651050</AccountNumber>
// 				<MeterNumber>251581259</MeterNumber>
// 			</ClientDetail>
// 			<TransactionDetail>
// 				<CustomerTransactionId>PAKKI</CustomerTransactionId>
// 			</TransactionDetail>
// 			<Version>
// 				<ServiceId>ship</ServiceId>
// 				<Major>28</Major>
// 				<Intermediate>0</Intermediate>
// 				<Minor>0</Minor>
// 			</Version>
// 			<RequestedShipment>
// 				<ShipTimestamp>{{Pickup.DateTime}}</ShipTimestamp>
// 				<DropoffType>REGULAR_PICKUP</DropoffType>
// 				<ServiceType>INTERNATIONAL_PRIORITY</ServiceType>
// 				<PackagingType>{{}}</PackagingType>
// 				<PreferredCurrency>USD</PreferredCurrency>
// 				<Shipper>
// 					<Contact>
// 						<PersonName>{{Origin.ContactName}}</PersonName>
// 						<CompanyName>{{Origin.CompanyName}}</CompanyName>
// 						<PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
// 						<EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
// 					</Contact>
// 					<Address>
// 						<StreetLines>{{Origin.Address}}</StreetLines>
// 						<StreetLines>{{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</StreetLines>
// 						<StreetLines/>
// 						<City>{{Origin.CityName}}</City>
// 						<StateOrProvinceCode>{{Origin.StateCode}}</StateOrProvinceCode>
// 						<PostalCode>{{Origin.PostalCode}}</PostalCode>
// 						<CountryCode>{{Origin.CountryCode}}</CountryCode>
// 					</Address>
// 				</Shipper>
// 				<Recipient>
// 					<Contact>
// 						<PersonName>{{Destination.ContactName}}</PersonName>
// 						<CompanyName>{{Destination.CompanyName}}</CompanyName>
// 						<PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
// 						<EMailAddress>{{Destination.ContactEmail}}</EMailAddress>
// 					</Contact>
// 					<Address>
// 						<StreetLines>{{Destination.Address}}</StreetLines>
// 						<StreetLines>{{Destination.AddressAdditional}} {{Destination.AddressAdditional2}}</StreetLines>
// 						<StreetLines/>
// 						<City>{{Destination.CityName}}</City>
// 						<StateOrProvinceCode>{{Destination.StateCode}}</StateOrProvinceCode>
// 						<PostalCode>{{Destination.PostalCode}}</PostalCode>
// 						<CountryCode>{{Destination.CountryCode}}</CountryCode>
// 					</Address>
// 				</Recipient>
// 				<RecipientLocationNumber>123456</RecipientLocationNumber>
// 				<ShippingChargesPayment>
// 					<PaymentType>SENDER</PaymentType>
// 					<Payor>
// 						<ResponsibleParty>
// 						<!-- Este numero cambia cuando sea Nacional o Internacional -->
// 							<AccountNumber>855651050</AccountNumber>
// 							<Contact>
// 								<ContactId>12345</ContactId>
// 								<PersonName>Dhillon</PersonName>
// 							</Contact>
// 						</ResponsibleParty>
// 					</Payor>
// 				</ShippingChargesPayment>
// 				<CustomsClearanceDetail>
// 					<DutiesPayment>
// 						<PaymentType>RECIPIENT</PaymentType>
// 					</DutiesPayment>
// 					<DocumentContent>DOCUMENTS_ONLY</DocumentContent>
// 					<CustomsValue>
// 						<Currency>USD</Currency>
// 						<Amount>0</Amount>
// 					</CustomsValue>
// 					<Commodities>
// 						<NumberOfPieces>1</NumberOfPieces>
// 						<Description>Correspondence</Description>
// 						<CountryOfManufacture>US</CountryOfManufacture>
// 						<Weight>
// 							<Units>KG</Units>
// 							<Value>0</Value>
// 						</Weight>
// 						<Quantity>1</Quantity>
// 						<QuantityUnits>CM</QuantityUnits>
// 						<UnitPrice>
// 							<Currency>USD</Currency>
// 							<Amount>0</Amount>
// 						</UnitPrice>
// 						<CustomsValue>
// 							<Currency>USD</Currency>
// 							<Amount>0</Amount>
// 						</CustomsValue>
// 					</Commodities>
// 				</CustomsClearanceDetail>
// 				<LabelSpecification>
// 					<LabelFormatType>COMMON2D</LabelFormatType>
// 					<ImageType>PDF</ImageType>
// 					<LabelStockType>PAPER_8.5X11_TOP_HALF_LABEL</LabelStockType>
// 					<LabelPrintingOrientation>TOP_EDGE_OF_TEXT_FIRST</LabelPrintingOrientation>
// 				</LabelSpecification>
// 				<RateRequestTypes>LIST</RateRequestTypes>
// 				<PackageCount>1</PackageCount>
// 				<RequestedPackageLineItems>
// 					<SequenceNumber>1</SequenceNumber>
// 					<InsuredValue>
// 						<Currency>USD</Currency>
// 						<Amount>0</Amount>
// 					</InsuredValue>
// 					<Weight>
// 						<Units>KG</Units>
// 						<Value>0.5</Value>
// 					</Weight>
// 					<Dimensions>
// 						<Length>20</Length>
// 						<Width>10</Width>
// 						<Height>1</Height>
// 						<Units>CM</Units>
// 					</Dimensions>
// 				</RequestedPackageLineItems>
// 			</RequestedShipment>
// 		</ProcessShipmentRequest>
// 	</soapenv:Body>
// </soapenv:Envelope>
// `;
// const XMLShipFDX_PKS_IE = 
// `<?xml version="1.0"?>
// <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v28="http://fedex.com/ws/ship/v28">
// 	<soapenv:Header/>
// 	<soapenv:Body>
// 		<ProcessShipmentRequest xmlns="http://fedex.com/ws/ship/v28">
// 			<WebAuthenticationDetail>
// 				<ParentCredential>
// 					<Key>kdBYw7jROlAa5GnA</Key>
// 					<Password>jCWYtaXuy003QuZcQXiGtQYZO</Password>
// 				</ParentCredential>
// 				<UserCredential>
// 					<Key>kdBYw7jROlAa5GnA</Key>
// 					<Password>jCWYtaXuy003QuZcQXiGtQYZO</Password>
// 				</UserCredential>
// 			</WebAuthenticationDetail>
// 			<ClientDetail>
// 				<AccountNumber>855651050</AccountNumber>
// 				<MeterNumber>251581259</MeterNumber>
// 			</ClientDetail>
// 			<TransactionDetail>
// 				<CustomerTransactionId>PAKKI</CustomerTransactionId>
// 			</TransactionDetail>
// 			<Version>
// 				<ServiceId>ship</ServiceId>
// 				<Major>28</Major>
// 				<Intermediate>0</Intermediate>
// 				<Minor>0</Minor>
// 			</Version>
// 			<RequestedShipment>
// 				<ShipTimestamp>{{Pickup.DateTime}}</ShipTimestamp>
// 				<DropoffType>REGULAR_PICKUP</DropoffType>
// 				<ServiceType>INTERNATIONAL_ECONOMY</ServiceType>
// 				<PackagingType>{{}}</PackagingType>
// 				<PreferredCurrency>USD</PreferredCurrency>
// 				<Shipper>
// 					<Contact>
// 						<PersonName>{{Origin.ContactName}}</PersonName>
// 						<CompanyName>{{Origin.CompanyName}}</CompanyName>
// 						<PhoneNumber>{{Origin.ContactPhone}}</PhoneNumber>
// 						<EMailAddress>{{Origin.ContactEmail}}</EMailAddress>
// 					</Contact>
// 					<Address>
// 						<StreetLines>{{Origin.Address}}</StreetLines>
// 						<StreetLines>{{Origin.AddressAdditional}} {{Origin.AddressAdditional2}}</StreetLines>
// 						<StreetLines/>
// 						<City>{{Origin.CityName}}</City>
// 						<StateOrProvinceCode>{{Origin.StateCode}}</StateOrProvinceCode>
// 						<PostalCode>{{Origin.PostalCode}}</PostalCode>
// 						<CountryCode>{{Origin.CountryCode}}</CountryCode>
// 					</Address>
// 				</Shipper>
// 				<Recipient>
// 					<Contact>
// 						<PersonName>{{Destination.ContactName}}</PersonName>
// 						<CompanyName>{{Destination.CompanyName}}</CompanyName>
// 						<PhoneNumber>{{Destination.ContactPhone}}</PhoneNumber>
// 						<EMailAddress>{{Destination.ContactEmail}}</EMailAddress>
// 					</Contact>
// 					<Address>
// 						<StreetLines>{{Destination.Address}}</StreetLines>
// 						<StreetLines>{{Destination.AddressAdditional}} {{Destination.AddressAdditional2}}</StreetLines>
// 						<StreetLines/>
// 						<City>{{Destination.CityName}}</City>
// 						<StateOrProvinceCode>{{Destination.StateCode}}</StateOrProvinceCode>
// 						<PostalCode>{{Destination.PostalCode}}</PostalCode>
// 						<CountryCode>{{Destination.CountryCode}}</CountryCode>
// 					</Address>
// 				</Recipient>
// 				<RecipientLocationNumber>123456</RecipientLocationNumber>
// 				<ShippingChargesPayment>
// 					<PaymentType>SENDER</PaymentType>
// 					<Payor>
// 						<ResponsibleParty>
// 						<!-- Este numero cambia cuando sea Nacional o Internacional -->
// 							<AccountNumber>855651050</AccountNumber>
// 							<Contact>
// 								<ContactId>12345</ContactId>
// 								<PersonName>Dhillon</PersonName>
// 							</Contact>
// 						</ResponsibleParty>
// 					</Payor>
// 				</ShippingChargesPayment>
// 				<CustomsClearanceDetail>
// 					<DutiesPayment>
// 						<PaymentType>RECIPIENT</PaymentType>
// 					</DutiesPayment>
// 					<DocumentContent>DOCUMENTS_ONLY</DocumentContent>
// 					<CustomsValue>
// 						<Currency>USD</Currency>
// 						<Amount>0</Amount>
// 					</CustomsValue>
// 					<Commodities>
// 						<NumberOfPieces>1</NumberOfPieces>
// 						<Description>Correspondence</Description>
// 						<CountryOfManufacture>US</CountryOfManufacture>
// 						<Weight>
// 							<Units>KG</Units>
// 							<Value>0</Value>
// 						</Weight>
// 						<Quantity>1</Quantity>
// 						<QuantityUnits>CM</QuantityUnits>
// 						<UnitPrice>
// 							<Currency>USD</Currency>
// 							<Amount>0</Amount>
// 						</UnitPrice>
// 						<CustomsValue>
// 							<Currency>USD</Currency>
// 							<Amount>0</Amount>
// 						</CustomsValue>
// 					</Commodities>
// 				</CustomsClearanceDetail>
// 				<LabelSpecification>
// 					<LabelFormatType>COMMON2D</LabelFormatType>
// 					<ImageType>PDF</ImageType>
// 					<LabelStockType>PAPER_8.5X11_TOP_HALF_LABEL</LabelStockType>
// 					<LabelPrintingOrientation>TOP_EDGE_OF_TEXT_FIRST</LabelPrintingOrientation>
// 				</LabelSpecification>
// 				<RateRequestTypes>LIST</RateRequestTypes>
// 				<PackageCount>1</PackageCount>
// 				<RequestedPackageLineItems>
// 					<SequenceNumber>1</SequenceNumber>
// 					<InsuredValue>
// 						<Currency>USD</Currency>
// 						<Amount>0</Amount>
// 					</InsuredValue>
// 					<Weight>
// 						<Units>KG</Units>
// 						<Value>0.5</Value>
// 					</Weight>
// 					<Dimensions>
// 						<Length>20</Length>
// 						<Width>10</Width>
// 						<Height>1</Height>
// 						<Units>CM</Units>
// 					</Dimensions>
// 				</RequestedPackageLineItems>
// 			</RequestedShipment>
// 		</ProcessShipmentRequest>
// 	</soapenv:Body>
// </soapenv:Envelope>
// `;



// const XMLShipFDX_IP = `
//     <?xml version="1.0"?>
// <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://fedex.com/ws/rate/v26">
// 	<soapenv:Header/>
// 	<soapenv:Body>
// 		<RateRequest>
// 			<WebAuthenticationDetail>
// 				<ParentCredential>
// 					<Key>kdBYw7jROlAa5GnA</Key>
// 					<Password>jCWYtaXuy003QuZcQXiGtQYZO</Password>
// 				</ParentCredential>
// 				<UserCredential>
// 					<Key>kdBYw7jROlAa5GnA</Key>
// 					<Password>jCWYtaXuy003QuZcQXiGtQYZO</Password>
// 				</UserCredential>
// 			</WebAuthenticationDetail>
// 			<ClientDetail>
// 				<AccountNumber>855651050</AccountNumber>
// 				<MeterNumber>251581259</MeterNumber>
// 			</ClientDetail>
// 			<TransactionDetail>
// 				<CustomerTransactionId>***Rate Request using PAKKI***</CustomerTransactionId>
// 			</TransactionDetail>
// 			<Version>
// 				<ServiceId>crs</ServiceId>
// 				<Major>26</Major>
// 				<Intermediate>0</Intermediate>
// 				<Minor>0</Minor>
// 			</Version>
// 			<ReturnTransitAndCommit>true</ReturnTransitAndCommit>
// 			<RequestedShipment>
// 				<ShipTimestamp>${date}</ShipTimestamp>
// 				<ServiceType>INTERNATIONAL_PRIORITY</ServiceType>
// 				<PackagingType>{{packType}}</PackagingType>
// 				<TotalInsuredValue>
// 					<Currency>{{Shipments.Shipment.InsuranceCurrency}}</Currency>
// 					<Amount>{{Shipments.Shipment.Insurance}}</Amount>
// 				</TotalInsuredValue>
// 				<Shipper>
// 					<Address>
// 						<StreetLines>{{Origin.Address}}</StreetLines>
// 						<AddressAdditional>{{Origin.Address.AddressAdditional}}</AddressAdditional>
// 						<AddressAdditional2>{{Origin.Address.AddressAdditional2}}</AddressAdditional2>
// 						<City>{{Origin.CityName}}</City>
// 						<StateOrProvinceCode>{{Origin.StateCode}}</StateOrProvinceCode>
// 						<PostalCode>{{Origin.PostalCode}}</PostalCode>
// 						<CountryCode>{{Origin.CountryCode}}</CountryCode>
// 					</Address>
// 				</Shipper>
// 				<Recipient>
// 					<Address>
// 						<StreetLines>{{Destination.Address}}</StreetLines>
// 						<AddressAdditional>{{Destination.Address.AddressAdditional}}</AddressAdditional>
// 						<AddressAdditional2>{{Destination.Address.AddressAdditional2}</AddressAdditional2>
// 						<City>{{Destination.CityName}}</City>
// 						<StateOrProvinceCode>{{Destination.StateCode}}</StateOrProvinceCode>
// 						<PostalCode>{{Destination.PostalCode}}</PostalCode>
// 						<CountryCode>{{Destination.CountryCode}}</CountryCode>
// 					</Address>
// 				</Recipient>
// 				<RateRequestTypes>LIST</RateRequestTypes>
// 				<PackageCount>1</PackageCount>
// 				<RequestedPackageLineItems>
// 					<SequenceNumber>1</SequenceNumber>
// 					<GroupPackageCount>1</GroupPackageCount>
// 					<InsuredValue>
// 						<Currency>{{Shipments.Shipment.InsuranceCurrency}}</Currency>
// 						<Amount>{{Shipments.Shipment.Insurance}}</Amount>
// 					</InsuredValue>
// 					<Weight>
// 						<Units>{{Shipments.Shipment.WeightUnit}}</Units>
// 						<Value>{{Shipments.Shipment.Weight}}</Value>
// 					</Weight>
// 					<Dimensions>
// 						<Length>{{Shipments.Shipment.Length}}</Length>
// 						<Width>{{Shipments.Shipment.Width}}</Width>
// 						<Height>{{Shipments.Shipment.Height}}</Height>
// 						<Units>{{Shipments.Shipment.DimUnit}}</Units>
// 					</Dimensions>
// 				</RequestedPackageLineItems>
// 			</RequestedShipment>
// 		</RateRequest>
// 	</soapenv:Body>
// </soapenv:Envelope>`;

module.exports = {
    XMLShipFDX_DOC_IE,
	// XMLShipFDX_DOC_IP,
	// XMLShipFDX_PKS_IE,
	// XMLShipFDX_PKS_IP,
};
const { DateTime } = require('luxon');
const date = DateTime.local().toISODate();
const fechaHoraActual = DateTime.local();
const fchActual = fechaHoraActual.toISO({ includeOffset: true });


function getShipmentDocumentFDX(accountNumber, shipper, recipient, shipment ) {
    return {
        "labelResponseOptions": "LABEL",
        "requestedShipment": {
            "shipper": {
                "contact": {
                    "personName": shipper.ContactName,
                    "companyName": shipper.CompanyName,
                    "phoneNumber": shipper.ContactPhone,
                    "emailAddress": shipper.ContactEmail,
                },
                "address": {
                    "streetLines": [
                        shipper.Address,
                        shipper.AddressAdditional,
                        shipper.AddressAdditional2
                    ],
                    "city": shipper.city,
                    "stateOrProvinceCode": shipper.stateOrProvinceCode,
                    "postalCode": shipper.postalCode,
                    "countryCode": shipper.countryCode
                }
            },
            "recipients": [
                {
                    "contact": {
                        "personName": recipient.ContactName,
                        "companyName": recipient.CompanyName,
                        "phoneNumber": recipient.ContactPhone,
                        "emailAddress": recipient.ContactEmail,
                    },
                    "address": {
                        "streetLines": [
                            recipient.Address,
                            recipient.AddressAdditional,
                            recipient.AddressAdditional2
                        ],
                        "city": recipient.city,
                        "stateOrProvinceCode": recipient.stateOrProvinceCode,
                        "postalCode": recipient.postalCode,
                        "countryCode": recipient.countryCode,
                    }
                }
            ],
            "shipDatestamp": date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
            "serviceType": shipment.serviceType,
            "packagingType": shipment.packagingType,
            "pickupType": "USE_SCHEDULED_PICKUP",
            "blockInsightVisibility": false,
            "preferredCurrency": shipment.insuranceCurrency,
            "shippingChargesPayment": {
                "paymentType": "SENDER"
            },
            "labelSpecification": {
                "imageType": "PDF",
                "labelStockType": "PAPER_85X11_TOP_HALF_LABEL"
            },
            "customsClearanceDetail": {
                "dutiesPayment": {
                    "paymentType": "SENDER"
                },
                "isDocumentOnly": shipment.documentShipment,
                "commodities": []
            },
            "shippingDocumentSpecification": {
                "shippingDocumentTypes": [],
                "commercialInvoiceDetail": {
                    "documentFormat": {
                        "docType": "PDF",
                        "stockType": "PAPER_LETTER"
                    }
                }
            },
            "requestedPackageLineItems": [
                {
                    "groupPackageCount": 1,
                    "weight": {
                        "value": shipment.weight,
                        "units": shipment.weightUnit
                    },
                    "declaredValue": {
                        "amount": shipment.declaredValue,
                        "currency": shipment.insuranceCurrency
                    }
                },
                {
                    "groupPackageCount": 1,
                    "weight": {
                        "value": shipment.weight,
                        "units": shipment.weightUnit
                    }
                }
            ]
        },
        "accountNumber": {
            "value": accountNumber
        }
    };
}

function getShipmentFDX(accountNumber, shipper, recipient, shipment ) {
    return {
        "labelResponseOptions": "LABEL",
        "requestedShipment": {
            "shipper": {
                "contact": {
                    "personName": shipper.ContactName,
                    "companyName": shipper.CompanyName,
                    "phoneNumber": shipper.ContactPhone,
                    "emailAddress": shipper.ContactEmail,
                },
                "address": {
                    "streetLines": [
                        shipper.Address,
                        shipper.AddressAdditional,
                        shipper.AddressAdditional2
                    ],
                    "city": shipper.city,
                    "stateOrProvinceCode": shipper.stateOrProvinceCode,
                    "postalCode": shipper.postalCode,
                    "countryCode": shipper.countryCode
                }
            },
            "recipients": [{
                "contact": {
                    "personName": recipient.ContactName,
                    "companyName": recipient.CompanyName,
                    "phoneNumber": recipient.ContactPhone,
                    "emailAddress": recipient.ContactEmail,
                },
                "address": {
                    "streetLines": [
                        recipient.Address,
                        recipient.AddressAdditional,
                        recipient.AddressAdditional2
                    ],
                    "city": recipient.city,
                    "stateOrProvinceCode": recipient.stateOrProvinceCode,
                    "postalCode": recipient.postalCode,
                    "countryCode": recipient.countryCode
                }
            }],
            "shipDatestamp": date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
            "serviceType": shipment.serviceType,
            "packagingType": shipment.packagingType,
            "pickupType": "USE_SCHEDULED_PICKUP",
            "blockInsightVisibility": false,
            "preferredCurrency": shipment.insuranceCurrency,
            "shippingChargesPayment": {
                "paymentType": "SENDER"
            },
            "labelSpecification": {
                "imageType": "PDF",
                "labelStockType": "PAPER_85X11_TOP_HALF_LABEL"
            },
            "customsClearanceDetail": {
                "dutiesPayment": {
                    "paymentType": "SENDER"
                },
                "isDocumentOnly": shipment.documentShipment,
                "commodities": [{
                    "description": shipment.description,
                    "countryOfManufacture": "US",
                    "quantity": 1,
                    "quantityUnits": "PCS",
                    "unitPrice": {
                        "amount": shipment.insurance,
                        "currency": shipment.insuranceCurrency
                    },
                    "customsValue": {
                        "amount": shipment.insurance,
                        "currency": shipment.insuranceCurrency
                    },
                    "weight": {
                        "units": shipment.weightUnit,
                        "value": shipment.weight
                    }
                }]
            },
            "shippingDocumentSpecification": {
                "shippingDocumentTypes": [
                    "COMMERCIAL_INVOICE"
                ],
                "commercialInvoiceDetail": {
                    "documentFormat": {
                        "stockType": "PAPER_LETTER",
                        "docType": "PDF"
                    }
                }
            },
            "requestedPackageLineItems": [{
                "weight": {
                    "units": shipment.weightUnit,
                    "value": shipment.weight
                }
            }]
        },
        "accountNumber": {
            "value": accountNumber
        }
    };
}

function getPickupsFDX(accountNumber, Pickup, shipment, ShipmentCode) {
    return {
        "associatedAccountNumber": {
            "value": accountNumber
        },
        "originDetail": {
            "pickupLocation": {
                "contact": {
                    "companyName": Pickup.CompanyName,
                    "personName": Pickup.ContactName,
                    "phoneNumber": Pickup.ContactPhone
                },
                "address": {
                    "streetLines": [
                        Pickup.Address,
                        Pickup.AddressAdditional,
                        Pickup.AddressAdditional1
                    ],
                    "city": Pickup.City,
                    "stateOrProvinceCode": Pickup.StateOrProvinceCode,
                    "postalCode": Pickup.PostalCode,
                    "countryCode": Pickup.CountryCode,
                    "residential": true
                }
            },
            "readyDateTimestamp": Pickup.DateTime,
            "customerCloseTime": Pickup.TimeEnd + ':00'
        },
        "carrierCode": "FDXE",
        "expressFreightDetail": {
            "truckType": "DROP_TRAILER_AGREEMENT",
            "service": shipment.serviceType,
            "trailerLength": "TRAILER_28_FT",
            "bookingNumber": ShipmentCode,
            "dimensions": {
                "length": shipment.length,
                "width": shipment.width,
                "height": shipment.height,
                "units": shipment.dimUnit
            }
        }
    }
}


function preShipmentDBFDX(fdxcoId, shipper, recipient, shipment, Pickup, Provider, company, dat, ShipmentCode,contentType,resp) {
    return {
        ShipmentID: fdxcoId,
        business: {
            business: company.CompanyID,
            brachOffice: company.branchoffices,
            collaborator: company.Collaborator,
        },
        origin: {
            cityOrigin: {
                cityName: shipper.city,
                stateOrProvinceCode: shipper.stateOrProvinceCode,
                postalCode: shipper.postalCode,
                countryCode: shipper.countryCode,
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
                cityName: recipient.city,
                stateOrProvinceCode: recipient.stateOrProvinceCode,
                postalCode: recipient.postalCode,
                countryCode: recipient.countryCode,
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
            IsDocument: shipment.documentShipment,
            packagingType: shipment.packagingTypefdx,
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
            packageLabels: contentType, 
            package: contentType, // Este es para almacenar los objetos de paquetes cuando sean 1 o mas
        },
        Provider: {
            partner: "FDX",
            service: resp.serviceType,
            arrivalDate: Provider.arrivalDate,
            shippingValue: Provider.shippingValue,
        },
        shippingValue: {
            ProviderAmount: dat.Provider.shippingValue,
            FinalUserAmount: dat.Provider.shippingValue,
            ConversionRate: "TRM",
            PublicAmount: "VALOR PUBLICo",
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
        alerts: resp.alerts,
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



module.exports = {
    getShipmentDocumentFDX,
    getShipmentFDX,
    preShipmentDBFDX,
    getPickupsFDX
};
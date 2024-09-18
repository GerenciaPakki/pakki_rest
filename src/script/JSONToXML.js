const xml2js = require('xml2js');
const builder = new xml2js.Builder({ headless: true });
const axios = require('axios');

const jsonData = {
  ConfirmationRQ: {
    ServiceCode: '-',
    Origin: {
      ContactName: 'Sutherland Americas',
      CompanyName: 'CAPITAL ONE',
      Address: 'CARRERA 56 #09 - 31',
      AddressAdditional: 'Torre Central',
      AddressAdditional2: null,
      ContactPhone: '3174250144',
      ContactEmail: 'INFO@PAKKI.CO',
      CountryCode: 'CO',
      StateCode: 'DC',
      CityName: 'Bogota',
      PostalCode: '110111',
      DANECode: '11001000'
    },
    Destination: {
      ContactName: 'JUAN CARRANZA',
      CompanyName: 'JUAN CARRANZA',
      Address: 'CRA 25 6-260 SUR',
      AddressAdditional: 'T2 APTO104',
      AddressAdditional2: null,
      ContactPhone: '3197025674',
      ContactEmail: 'INFO@PAKKI.CO',
      CountryCode: 'CO',
      StateCode: 'CU',
      CityName: 'Madrid',
      PostalCode: '250030',
      DANECode: '25430000'
    },
    Shipments: {
      Shipment: {
        WeightUnit: 'KGS',
        Weight: '1.00',
        DimUnit: 'CM',
        Length: '1',
        Width: '1',
        Height: '1',
        Insurance: '70000.00',
        InsuranceCurrency: 'COP',
        DeclaredValue: '0.00',
        Content: 'WEB CAM DELICADO',
        Reference: 'WEB CAM',
        Invoice: {
          TotalValue: '0.00',
          Items: null
        }
      }
    },
    Pickup: {
      AddressAdditional: null,
      AddressAdditional2: null,
      DateTime: '2023-02-01T00:00:00',
      TimeStart: '09:00',
      TimeEnd: '18:00',
      Comments: null
    },
    company: {
      CompanyID: '15',
      UserID: '6'
    },
    Token: null
  }
};

const xmlData = builder.buildObject(jsonData);

axios.post('https://ejemplo.com/coordinadora', xmlData, {
  headers: { 'Content-Type': 'application/xml' }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

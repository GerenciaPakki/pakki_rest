const { marcaDeTiempo } = require('../helpers/pakkiDateTime');
const shipments = require("../models/shipments");

async function PayShipment(payGateway) {

    try {
        const { ShipmentID, ShipmentCode, PaymentType, ReferenceCodePay, PaymentMethod, Payment, PaymentConfirmation, shippingValue } = payGateway;
    
        const options = { upsert: true, returnOriginal: false };
        
        // TODO: QUE EL SHIPMENTID SEAN EXACTAMENTE LOS MISMOS DEL PAGO Y EL ENVIO,
        
        // TODO: QUE LOS VALORES SEAN EXACTAMENTE LOS MISMOS,       
        
        
        
        if (PaymentType === "PayGateway") {
        // TODO: QUE LA CONFIRMACION DEL PAGO SEA EXITOSO, CONFIRMACION DE LA PASARELA
        
            const transaction = true;
    
            if (transaction === true) {
    
                const updatedValuesPayGateway = {
                    $set: {
                        billPayment: {
                            paymentType: PaymentType,
                            ShipmentCode: ShipmentCode,
                            Payment: Payment,
                            PaymentConfirmation: PaymentConfirmation,
                            PaymentReference: ShipmentID,                        
                            dateCreate: marcaDeTiempo,
                        },
                        statusBill:true
                    }
                };
                const ShipUpdate = await shipments.findOneAndUpdate({ ShipmentID: ShipmentID }, updatedValuesPayGateway, options);
                // console.log(ShipUpdate);
                return ShipUpdate;
            } else {
                return 'Pay Gateway transaction error';            
            }        
        } else if (PaymentType === "PaymentCash") {
    
            const updatedValuesPayCash = {
                $set: {
                    statusCompany: {
                        paymentCash: true,
                        Currency: "COP",
                        valuePaid: shippingValue,
                        Reference: ShipmentID,
                        PaymentType: PaymentType,
                        ReferenceCodePay: ReferenceCodePay,
                        PaymentMethod: PaymentMethod,
                        paymentToPakki: true,
                        status: true,
                        dateCreate: marcaDeTiempo,
                    },
                    statusComp: true      
                }
            };
            const ShipUpdate = await shipments.findOneAndUpdate({ ShipmentID: ShipmentID },updatedValuesPayCash,options);
            return ShipUpdate;       
            
        } else {
            return 'Global Transaction Error';
        }
        
    } catch (error) {
        return error
    }

}

module.exports = {
    PayShipment,
};
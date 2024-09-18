const { default: axios } = require('axios');
const { response } = require('express');
const { DateTime } = require("luxon");
const { applogger } = require('../utils/logger');



let date = DateTime.local();
const now = date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);


const getPaymentReferenceePayco = async (req, res = response) => { 
    const { PayRef } = req.body;
    try {
        const urlePayco = 'https://secure.epayco.co/validation/v1/reference/'
    
        const response = await axios.get(`${urlePayco}${PayRef}`);
        const ePayco = formatResponseePayco(response.data);
    
        res.status(200).json({
            ok: true,
            ePayco
        });
    } catch (error) {
        applogger.error(`Error en PAYCL-4O1 > getPaymentReferenceePayco: Error al Crear el MEtodo de pago ePayco, PayRef: ${PayRef}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: error.message
        });
    }
};

function formatResponseePayco(data) {
    const formattedData = {
        success: data.success,
        title_response: data.title_response,
        text_response: data.text_response,
        last_action: data.last_action,
        data: {
            x_cust_id_cliente: data.data.x_cust_id_cliente,
            x_ref_payco: data.data.x_ref_payco,
            x_id_invoice: data.data.x_id_invoice,
            x_description: data.data.x_description,
            x_amount: data.data.x_amount,
            x_amount_country: data.data.x_amount_country,
            x_amount_ok: data.data.x_amount_ok,
            x_tax: data.data.x_tax,
            x_tax_ico: data.data.x_tax_ico,
            x_amount_base: data.data.x_amount_base,
            x_currency_code: data.data.x_currency_code,
            x_bank_name: data.data.x_bank_name,
            x_cardnumber: data.data.x_cardnumber,
            x_quotas: data.data.x_quotas,
            x_response: data.data.x_response,
            x_approval_code: data.data.x_approval_code,
            x_transaction_id: data.data.x_transaction_id,
            x_transaction_date: data.data.x_transaction_date,
            x_cod_response: data.data.x_cod_response,
            x_response_reason_text: data.data.x_response_reason_text,
            x_cod_transaction_state: data.data.x_cod_transaction_state,
            x_errorcode: data.data.x_errorcode,
            x_franchise: data.data.x_franchise,
            x_business: data.data.x_business,
            x_customer_email: data.data.x_customer_email,
            x_customer_ip: data.data.x_customer_ip,
            x_signature: data.data.x_signature,
            x_test_request: data.data.x_test_request,
            x_type_payment: data.data.x_type_payment
        }
    };

    return formattedData;
}



module.exports = {
    getPaymentReferenceePayco,
};
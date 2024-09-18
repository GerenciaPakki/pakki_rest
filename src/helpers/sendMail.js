const { crearHTMLCustomer } = require("../structures/html/shippingCustomerMail");
const { createTransporter } = require("./nodeMailer");
const fs = require('fs');
const { mailOriginPkg, mailDestinationDoc, mailOriginDoc, mailDestinationPkg, mailOriginDocUPS } = require("./sendMailCustomers");

async function SendMails(mailData, guia) { 
    const mailerOrigin = await mailOriginDoc( mailData, guia )
    const mailerDestination = await mailDestinationDoc( mailData, guia )
    
    return mailerOrigin   
}

async function SendMailsPkg(mailData, guia, proforma, carta) {
    console.log('Entramos a SendMailsPkg')

    let mailerOrigin = ''
    let mailerDestination = ''
   
    mailerOrigin = await mailOriginPkg( mailData, guia, proforma, carta )
    mailerDestination = await mailDestinationPkg(mailData, guia, proforma)
    
    return mailerOrigin
}

async function SendMails_UPS(mailData, guia) { 

    const mailerOrigin = await mailOriginDocUPS( mailData, guia )
    const mailerDestination = await mailDestinationDoc( mailData, guia )
    
    return mailerOrigin
}

async function SendMailsPkg_UPS(mailData,guia,proforma, carta) { 
    // console.log('Mail UPS. ',mailData)

    const mailerOrigin = await mailOriginPkg( mailData, guia, proforma, carta )
    const mailerDestination = await mailDestinationPkg( mailData, guia )
    
    return mailerOrigin
}

module.exports = {
    SendMails,
    SendMailsPkg,
    SendMails_UPS,
    SendMailsPkg_UPS,
};
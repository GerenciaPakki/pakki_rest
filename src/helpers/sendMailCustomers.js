const { crearHTMLCustomer, crearHTMLCustomerDestination } = require("../structures/html/shippingCustomerMail");
const { createTransporter } = require("./nodeMailer");


async function mailOriginDoc(mailData, guia) {
    let htmlToSend = ''
    let OriginMail = ''
    let ShipmentCode = ''

    OriginMail = mailData.origin.email
    ShipmentCode = mailData.ShipmentCode

    htmlToSend = await crearHTMLCustomer(mailData);

    async function enviarCorreo() {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: "tecnologia@yotraigo.com",
            to: OriginMail,
            // cc: MailOrigin,
            // cc: 'lamed.saenz@hotmail.com',
            //bcc: 'gerencia@yotraigo.com',
            subject: `Su Orden ha sido Creada: ${ShipmentCode}`,
            html: htmlToSend,
            attachments: [
                {
                    filename: `Guia_${ShipmentCode}.pdf`,
                    content: guia
                },
            ]
        });
        return info.envelope;
    };
    return enviarCorreo()
} 


async function mailOriginDocUPS(mailData, guia) {
    let htmlToSend = ''
    let OriginMail = ''
    let ShipmentCode = ''

    OriginMail = mailData.origin.email
    ShipmentCode = mailData.ShipmentCode

    htmlToSend = await crearHTMLCustomer(mailData);
    
    async function enviarCorreo() {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: "'Pakki Online' <tecnologia@yotraigo.com>",
            to: OriginMail,
            // cc: MailOrigin,
            // cc: 'lamed.saenz@hotmail.com',
            //bcc: 'gerencia@yotraigo.com',
            subject: `Su Orden ha sido Creada: ${ShipmentCode}`,
            html: htmlToSend,
            attachments: [
                {
                    filename: `Guia_${ShipmentCode}.pdf`,
                    content: guia
                },
            ]
        });
        return info.envelope;
    };
    return enviarCorreo()
} 

async function mailDestinationDoc(mailData, guia) {
    let htmlToSend = ''
    let OriginMail = ''
    let ShipmentCode = ''

    OriginMail = mailData.destination.email
    ShipmentCode = mailData.ShipmentCode

    htmlToSend = await crearHTMLCustomerDestination(mailData);

    async function enviarCorreo() {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: "'Pakki Online' <tecnologia@yotraigo.com>",
            to: OriginMail,
            // cc: MailOrigin,
            // cc: 'lamed.saenz@hotmail.com',
            // bcc: 'gerencia@yotraigo.com',
            subject: `Su Orden ha sido Creada: ${ShipmentCode}`,
            html: htmlToSend,
            attachments: [
                {
                    filename: `Guia_${ShipmentCode}.pdf`,
                    content: guia
                },
            ]
        });
        return info.envelope;
    };
    return enviarCorreo()
} 


async function mailOriginPkg(mailData, guia, proforma, carta) {
    let htmlToSend = ''
    let OriginMail = ''
    let ShipmentCode = ''

    OriginMail = mailData.origin.email
    ShipmentCode = mailData.ShipmentCode

    htmlToSend = await crearHTMLCustomer(mailData);
    async function enviarCorreo() {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: "'Pakki Online' <tecnologia@yotraigo.com>",
            to: OriginMail,
            // cc: MailOrigin,
            // cc: 'lamed.saenz@hotmail.com',
            // bcc: 'gerencia@yotraigo.com',
            subject: `Su Orden ha sido Creada: ${ShipmentCode}`,
            html: htmlToSend,
            attachments: [{
                    filename: `Guia_${ShipmentCode}.pdf`,
                    content: guia
                },
                {
                    filename: `Proforma_${ShipmentCode}.pdf`,
                    content: proforma
                },
                {
                    filename: 'Carta_de_Responsabilidad.pdf',
                    content: carta
                },
            ]
        });
        return info.envelope;
    };
    return enviarCorreo()
}


async function mailDestinationPkg(mailData, guia, proforma) {
    let htmlToSend = ''
    let OriginMail = ''
    let ShipmentCode = ''

    OriginMail = mailData.destination.email
    ShipmentCode = mailData.ShipmentCode

    htmlToSend = await crearHTMLCustomerDestination(mailData);
    async function enviarCorreo() {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: "'Pakki Online' <tecnologia@yotraigo.com>",
            to: OriginMail,
            // cc: MailOrigin,
            // cc: 'lamed.saenz@hotmail.com',
            // bcc: 'gerencia@yotraigo.com',
            subject: `Su Orden ha sido Creada: ${ShipmentCode}`,
            html: htmlToSend,
            attachments: [
                {
                    filename: `Guia_${ShipmentCode}.pdf`,
                    content: guia
                },
                {
                    filename: `Proforma_${ShipmentCode}.pdf`,
                    content: proforma
                },
            ]
        });
        return info.envelope;
    };
    return enviarCorreo()
} 

module.exports = {
    mailOriginDoc,
    mailDestinationDoc,
    mailOriginPkg,
    mailDestinationPkg,
    mailOriginDocUPS,
};
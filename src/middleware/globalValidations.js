const { response } = require("express");
mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const { validationResult, Result } = require('express-validator');
const { JWT_SECRET } = require("../utils/config");
const { DateTime } = require("luxon");

const users = require('../models/user');
const collaborator = require('../models/collaborator');
const business = require("../models/business");
const businessUsers = require("../models/businessUsers");
const { CompararFecha, sameDate, afterTwoInTheAfternoon, weekendDay, holiDay, itIsEaster } = require("../helpers/pakkiDateTime");
const weekend = require("../models/weekend");
const Holidays = require("../models/Holidays");
const role = require("../models/role");
const profile = require("../models/profile");
const user = require("../models/user");
const { applogger } = require("../utils/logger");

const validateJWT = (req, res = response, next) => {
    
    const token = req.header('x-token');
    try {
        if (!token) {
            return res.status(418).json({
                ok: false,
                msg: 'No hay Token en la Peticion'
            });
        }
    
        // const { uid, bus } = jwt.verify(token, process.env.JWT_SECRET);
        const { uid, bus } = jwt.verify(token, JWT_SECRET);
        // pasamos el UID a la Request para que desde alli podamos validar el usuario.
        req.uid = uid;
        req.bus = bus;
        next();
    } catch (error) {
        // ERROR AL GENERAR EL CODIGO DE VALIDACION DE EMAIL AL REGISTRARSE
        applogger.error(`Error en MDGV > viewOneBus: Error al Validar el Token al usuario token: ${token} error: ${error}`);
        return res.status(401).json({
            ok: false,
            msg: 'MWGV-1.1: Error con El Registro TK: ' + error
        });
    }
};

const acceptTerms = (req, res = response, next) => {

    
    const terminosUsu = req.body.terms;
    // DEBE ACEPTAR LOS TERMINOS Y CONDICIONES DEL APLICATIVO
    if (terminosUsu === 'Acepto') {
        next();
    } else {
        return res.status(400).json({
            ok: false,
            msg: 'MWGV-2'
        });
    }
};

const isEmail = (req, res = response, next) => {

    const email = req.body.email;
    const emailValido = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{3,63}\.){1,125}[A-Z]{2,63}$/i;

    // EL EMAIL NO TIENE LA FORMA REQUERIDA
    if (emailValido.test(email)) {
        next();
    } else {
        return res.status(400).json({
            ok: false,
            msg: 'MWGV-3'
        });
    }
};
const validateFields = (req, res = response, next) => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errors: errores.mapped()
        });
    }
    next();
};

const validatepassword = (req, res = response, next) => {
    const { pass, validatepassword } = req.body;
    // LA CONTRASEÑA NO COINCIDE
    if (pass != validatepassword) {
        return res.status(404).json({
            ok: false,
            msg: 'MWGV-5'
        });
    }
    next();
};

// VALIDA SI EXISTE EL COLLABORATOR EN EL DOCUMENTO DE COLLABORATOR 
const validateCollaNoExist = async (req, res = response, next) => { 
    
    const colla = req.body.collaborator;

    const collaDB = await collaborator.findById(colla)
        .where("status").equals(true);
    
    if (collaDB === null) {
        next();      
    } else {
        // NO EXISTE EL COLABORADOR EN LA COLECCION COLLABORATORS PARA PODER CREARLO
        return res.status(418).json({
            ok: false,
            msg: 'MWGV-6: validateCollaNoExist'
        });
    }
};

// VALIDA SI EXISTE EL COLLABORATOR EN LA COMPAÑIA EN LA COLECCION 
const validateCollaAndBusiness = async (req, res = response, next) => { 
    const colla = req.body.collaborators;
    const bus = req.body.irs_nit;

    const collaDB = await business.findById(bus)
        .where("collaborators.user").in(colla)
        .where("status").equals(true);
    
    if (collaDB === null) {
        next();
    } else {
        // YA EXISTE EL COLABORADOR EN LA COMPAÑIA
        return res.status(418).json({
            ok: false,
            msg: 'MWGV-6.6: YA EXISTE EL COLABORADOR EN LA COMPAÑIA'
        });
    }
};

// VALIDA SI EXISTE LA COMPAÑIA EN LA COLECCION 
const validateBusiness = async (req, res = response, next) => { 
    const user = req.body.collaborators;
    const bus = req.body.business;

    const collaDB = await collaborator.findOne({"colla.collaborator": user})
        .where("status").equals(true)
        .where("business.business").equals(bus);
    
        if (collaDB) {
            // YA EXISTE EL COLLABORATOR
            return res.status(418).json({
                ok: false,
                msg: 'MWGV-6: validateBusiness'
        });
    }
    next();
};

const validateColla = async (req, res = response, next) => { 
    
    const colla = req.body.collaborators;

    const collaDB = await collaborator.findById(colla,{"colla.collaborator":1,_id:0})
        .where("status").equals(true);
    
    if (collaDB === null) {
        // NO EXISTE EL COLABORADOR EN LA COLECCION COLLABORATORS PARA AGREGARLO A UN BUSINESS
        return res.status(404).json({
            ok: false,
            msg: 'MWGV-6: validateColla'
        });     
    } else {
        next();
    }
};

const validateUser = async (req, res = response, next) => { 
    
    const usrs = req.body.collaborator;

    const userDB = await user.findById({_id:usrs},{docu:1,_id:0})
        .where("status").equals(true);
    
    if (userDB === null) {
        // NO EXISTE EL USUARIO EN LA COLECCION USERS PARA AGREGARLO A UN ALIADO
        return res.status(404).json({
            ok: false,
            msg: 'MWGV-6.1: NO EXISTE EL USUARIO EN LA COLECCION USERS PARA AGREGARLO A UN ALIADO'
        });     
    } else {
        next();
    }
};

const validateProfile = async (req, res = response, next) => {

    const userId = req.uid
    const bus = req.bus
    // Obtener la parte de la URL que necesitas
    const originalUrl = req.originalUrl
    const parts = originalUrl.split('/')
    const URLdestination = parts[3]

    if (URLdestination === 'mn') {
        // valida que destination es para solicitar en menu e ignora la validacion general
        next();
    } else {
        // Obtener el perfil del usuario
        const user = await businessUsers.findOne(
          { _id: userId, 'business.business': bus, status: true },
          { profile: 1 }
        )
        
        if (!user) {
          // El usuario no existe en la colección de businessUsers
          return res.status(418).json({
            ok: false,
            msg: 'MWGV-7'
          })
        }
    
        const profileId = user.profile;
    
        // Realiza la consulta para obtener el perfil y sus roles
        const profileDB = await profile.findById(profileId,{role:1, name: 1, _id:0})
            .populate('role', 'name destination -_id')
    
        if (!profileDB) {
        // El perfil no existe
            return res.status(418).json({
                ok: false,
                msg: 'MWGV-8'
            })
        }
    
        // Verifica si el perfil tiene al menos un role asignado
        if (!profileDB.role || profileDB.role.length === 0) {
            // El perfil no tiene un role asignado
            return res.status(418).json({
                ok: false,
                msg: 'MWGV-9'
            })
        }
    
        // Verifica si el destination de al menos uno de los roles coincide con el perfil
        const roleDestinations = profileDB.role.map((role) => role.destination);
    
        if (roleDestinations.includes(URLdestination)) {
            // Realiza las acciones que necesites si URLdestination está en roleDestinations
            // console.log(`URLdestination ${URLdestination} está en roleDestinations`);
            next();
        } else {
            // El perfil no tiene un role asignado para esta ruta y actividad
            return res.status(418).json({
                ok: false,
                msg: 'MWGV-10: No tiene permisos para realizar este Proceso'
            })
        }
    }

};

const validateBusBrach = async (req, res = response, next) => { 

    const bus = req.params.id;
    const tradename = req.body.tradename;

    try {
        const BusinessBrachDB = await business.findById(bus, { branchoffices: 1, _id: 0 })
            .where("branchoffices.tradename").in([tradename]);
        
        if (BusinessBrachDB === null) {
            next();
        } else {
            // YA EXISTE EL BRACH EN EL DOCUMENTO BUSINESS, COMO SUCURSAL
            return res.status(418).json({
                ok: false,
                msg: 'MWGV-8: YA EXISTE EL BRACH EN EL DOCUMENTO BUSINESS, COMO SUCURSAL'
            }); 
        }        
    } catch (error) {
        // ERROR AL CREAR EL BRACH EN EL DOCUMENTO BUSINESS, COMO SUCURSAL
            return res.status(418).json({
                ok: false,
                msg: 'MWGV-9'
            }); 
    }

};

const validateCEI = (req, res = response, next) => { 

    const uid = req.uid;
    const bus = req.bus;

};

const validateFileName = (req, res, next) => {
    const archivo = req.file;
    if (!archivo) {
        return res.status(400).json({ message: 'Archivo no encontrado' });
    }
    next();
};

// VALIDA QUE LA FECHA DE RECOLECCION NO SEA SUPERIOR A 4 DIAS 
const validateDatePickup = async (req, res = response, next) => { 
    // console.log("Peticion desde el front: -> ", req);    
    const datePickup1 = req.body.Pickup.DateTime;
    // const datePickup2 = req.body.Pickup.DateTime1;

    // const date1 = CompararFecha(datePickup1);
    // const date2 = CompararFecha(datePickup2);

    // console.log("Fecha1 (DateTime): ", date1);
    // console.log("Fecha2 (DateTime1): ", date2);

    // const hoy = new Date();

    const fecha1 = DateTime.fromISO(datePickup1);    
    // Obtén la fecha y hora actual
    const hoy = new Date().toISOString();
    const fecha2 = DateTime.fromISO(hoy);

    const diferenciaEnDias = fecha1.diff(fecha2, 'days').toObject().days;

    if(diferenciaEnDias <= 4) 
    {
        next();
    } else {
        return res.status(418).json({
            ok: false,
            cod: 'MWGV-10',
            msg: 'La Fecha de Recoleccion Supera 4 Días'
        });
    }
};
// VALIDA QUE LA FECHA DE RECOLECCION NO SEA SUPERIOR A 4 DIAS 
const validateDatePickupQuotation = async (req, res = response, next) => { 
    const datePickup1 = req.body.Shipments.DateTime;
    const datePickup2 = req.body.Shipments.DateTimeDHL;

    const date1 = CompararFecha(datePickup1);
    const date2 = CompararFecha(datePickup2);

    // Valida que ambas fechas no superen el límite superior
    if ( date1 === true && date2 === true ) {
        next();
    } else {
        return res.status(418).json({
            ok: false,
            cod: 'MWGV-10',
            msg: 'La Fecha de Recoleccion Supera 4 Días'
        });
    }
};

// VALIDA QUE LA FECHA DE RECOLECCION NO SEA FIN DE SEMANA 
const validateDateWeekend = async (req, res = response, next) => { 
    const datePickup1 = req.body.Pickup.DateTime;
    const datePickup2 = req.body.Pickup.DateTime1;

    const date1 = sameDate(datePickup1);
    const date2 = sameDate(datePickup2);

    const hd1 = await isWeekend(date1);
    const hd2 = await isWeekend(date2);

    // Valida que ambas fechas no superen el límite superior
    if (hd1 || hd2) {
        return res.status(418).json({
            ok: false,
            cod: 'MWGV-11',
            msg: 'La fecha de Recoleccion No puede ser en Fin de Semana'
        });
    } else {
        next();        
    }
};

// VALIDA QUE LA FECHA DE RECOLECCION NO SEA FESTIVO 
const validateDateHolidays = async (req, res = response, next) => { 
    const datePickup1 = req.body.Pickup.DateTime;
    const datePickup2 = req.body.Pickup.DateTime1;

    const date1 = sameDate(datePickup1);
    const date2 = sameDate(datePickup2);

    const wk1 = await isHoliday(date1);
    const wk2 = await isHoliday(date2);
    // Valida que ambas fechas no superen el límite superior
    if (wk1 || wk2) {
        return res.status(418).json({
            ok: false,
            cod: 'MWGV-12',
            msg: 'La fecha de Recoleccion No puede ser un día Festivo'
        });
    } else {
        next();        
    }
};

// VAlida que el tipo de envio Documento NO supere 0.5 Kg
const packagingType = async (req, res = response, next) => { 
    const documentShipment = req.body.Shipments.documentShipment
    const Weight = req.body.Shipments.Shipment.Weight

    if (documentShipment === true && Weight > 2 ) {
        return res.status(418).json({
            ok: false,
            cod: 'MWGV-13',
            msg: 'El Peso Supera para el Tipo Documento'
        });
    }    
    next();
};
// Calida que el dia de creacion No sea Fin de Semana y de ser asi lo pasa al siguiente dia habil
const validateDay = async (req, res = response, next) => { 
    const date = req.body.Shipments.DateTime
    const fechaHora = DateTime.fromISO(date);

    // Verificar si la hora es mayor a las 14:00
    if (fechaHora.hour >= 14) {

        // Si es mas de las 14:00 pasa al siguiente dia
        const dateHour = await afterTwoInTheAfternoon(date)
        // Si la fecha anterior es fin de semana la pasa al siguiente dia habil
        const dateWeekend = await weekendDay(dateHour)
        // Si la fecha anterior es Festivo lo pasa al siguiente dia habil
        const dateHoliDay = await holiDay(dateWeekend)
        // Valida que la fecha anterior No sea Semana Santa
        const dateIsEaster = await itIsEaster(dateHoliDay)

        req.dat.Shipments.DateTime = dateIsEaster.toFormat('yyyy-MM-dd\'T\'HH:mm:ss')
        req.dat.Shipments.DateTimeDHL = dateIsEaster.toFormat('yyyy-MM-dd')
      
       next();
    } else {
        // Si la fecha anterior es fin de semana la pasa al siguiente dia habil
        const dateWeekend = await weekendDay(dateHour)
        // Si la fecha anterior es Festivo lo pasa al siguiente dia habil
        const dateHoliDay = await holiDay(dateWeekend)
        // Valida que la fecha anterior No sea Semana Santa
        const dateIsEaster = await itIsEaster(dateHoliDay)
      
       next();
    }
};

// Función que valida si una fecha está en la colección de feriados
async function isHoliday(date) {    
    const hd = await Holidays.find({ Date: date });
  return hd === '';
}
async function isWeekend(date) { 
    // console.log(date);
    const wk = await weekend.find({ Date: date });
    return wk === '';
}

const ShowTokenInComponents = async (token) => {
    // LEER EL TOKEN
    const decodedToken = jwt.verify(token, JWT_SECRET);
    try {
        return {
            ok: true,
            msg: decodedToken,
        };
    } catch (error) {
        applogger.error(`Error en VALUSTKNDAO > ShowTokenInComponentsDAO: UserId: ${decodedToken.uid} error: ${error}`);
        return {
            ok: false,
            msg: 'CREUSD4O-07: ' + error.code
        }
    }
}

module.exports = {
    validateJWT,
    acceptTerms,
    isEmail,
    validateFields,
    validatepassword,
    validateCollaNoExist,
    validateBusiness,
    validateCollaAndBusiness,
    validateColla,
    validateProfile,
    validateBusBrach,
    validateCEI,
    validateFileName,
    validateDatePickup,
    validateDateWeekend,
    validateDateHolidays,
    packagingType,
    validateDatePickupQuotation,
    validateUser,
    ShowTokenInComponents,
};


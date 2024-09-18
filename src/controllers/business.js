const { response } = require('express');
const mongoose = require('mongoose');
 const jwt = require('jsonwebtoken');
const { DateTime } = require("luxon");
const collaborator = require('../models/collaborator');
const business = require('../models/business');
const user = require('../models/user');
const { cargueprofile } = require('../middleware/globalProcess');
const { RoleProfile } = require('../helpers/roleProfile');
const profile = require('../models/profile');
const { marcaDeTiempoInter } = require('../helpers/pakkiDateTime');
const { applogger } = require('../utils/logger');
const businessUsers = require('../models/businessUsers');


let date = DateTime.local();
const now = date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);

const RolePakki = 'Pakki'
const CRUDRole = 'CD Business'
const RURole = 'RU Business'


const viewOneBus = async (req, res = response) => {

    const uid = req.uid
    const bus = req.bus
    const busNit = req.body.BusinessNit
    const roleProfile = await RoleProfile(uid)

    // TODO: PARA ESTE CASO SE DEBE AGREGAR SI ES PAKKI Y ADICIONAR EL ROLE DE RURole PARA QUE PAKKI
    // TODO: PUEDA UTILIZAR ESTE MISMA FUNCION PARA VISUALIZAR EL BUSINESS.
    if ((roleProfile.roleDestinations.includes(CRUDRole) || roleProfile.roleDestinations.includes(RURole)) 
    && roleProfile.roleDestinations.includes(RolePakki) )
     {

        const ViewOneBusiness = await business.find(
            {
                "business.irs_nit": busNit,
                status: true
            }
        ).sort({
            dateCreate: -1
        });
        if (ViewOneBusiness) {
            const businessData = ViewOneBusiness[0].business;
            const managerData = ViewOneBusiness[0].manager;
            const negotiationData = ViewOneBusiness[0].negotiation;
            const collaboratorsData = ViewOneBusiness[0].collaborators;
            const branchOfficeData = ViewOneBusiness[0].branchoffices[0];

            const businessFields = {
                irs_nit: businessData.irs_nit,
                tradename: businessData.tradename,
                businessname: businessData.businessname,
                companytype: businessData.companytype,
                mainaddress: businessData.mainaddress,
                email: businessData.email,
                branchoffices: businessData.branchoffices,
                city: businessData.city,
                citycode: businessData.citycode,
                country: businessData.country,
                countrycode: businessData.countrycode,
                state: businessData.state,
            };

            const managerFields = {
                cellphone: managerData.cellphone,
                user: managerData.user,
                name: managerData.name,
                lastname: managerData.lastname,
                email: managerData.email,
            };

            const negotiationFields = {
                discount: negotiationData.discount,
            };

            const collaborators = collaboratorsData.map((collaborator) => ({
                name: collaborator.name,
                lastname: collaborator.lastname,
                docu: collaborator.docu,
                profile: collaborator.profile.name,
            }));

            const branchOfficeFields = {
                phone: branchOfficeData.phone,
                cellphone: branchOfficeData.cellphone,
                tradename: branchOfficeData.tradename,
                mainaddress: branchOfficeData.mainaddress,
                email: branchOfficeData.email,
                city: branchOfficeData.city,
                country: branchOfficeData.country,
                start: branchOfficeData.start,
                end: branchOfficeData.end,
                serviceday: branchOfficeData.serviceday,
            };

            const businessDB = {
                businessFields,
                managerFields,
                negotiationFields,
                collaborators,
                branchOfficeFields
            }
            res.json({
                ok: true,
                businessDB
            });
        }

    } else if (roleProfile.roleDestinations.includes(RURole)) {
        
        const ViewOneBusiness = await business.findById(bus,)
            .where("status").equals(true)
            .populate("collaborators.profile")
        
        if (ViewOneBusiness.ok) {
            const businessData = ViewOneBusiness.ViewAllBusiness.business;
            const managerData = ViewOneBusiness.ViewAllBusiness.manager;
            const negotiationData = ViewOneBusiness.ViewAllBusiness.negotiation;
            const collaboratorsData = ViewOneBusiness.ViewAllBusiness.collaborators;
            const branchOfficeData = ViewOneBusiness.ViewAllBusiness.branchoffices[0];

            const businessFields = {
                irs_nit: businessData.irs_nit,
                tradename: businessData.tradename,
                businessname: businessData.businessname,
                companytype: businessData.companytype,
                mainaddress: businessData.mainaddress,
                email: businessData.email,
                branchoffices: businessData.branchoffices,
                city: businessData.city,
                citycode: businessData.citycode,
                country: businessData.country,
                countrycode: businessData.countrycode,
                state: businessData.state,
            };

            const managerFields = {
                cellphone: managerData.cellphone,
                user: managerData.user,
                name: managerData.name,
                lastname: managerData.lastname,
                email: managerData.email,
            };

            const negotiationFields = {
                discount: negotiationData.discount,
            };

            const collaborators = collaboratorsData.map((collaborator) => ({
                name: collaborator.name,
                lastname: collaborator.lastname,
                docu: collaborator.docu,
                profile: collaborator.profile.name,
            }));

            const branchOfficeFields = {
                phone: branchOfficeData.phone,
                cellphone: branchOfficeData.cellphone,
                tradename: branchOfficeData.tradename,
                mainaddress: branchOfficeData.mainaddress,
                email: branchOfficeData.email,
                city: branchOfficeData.city,
                country: branchOfficeData.country,
                start: branchOfficeData.start,
                end: branchOfficeData.end,
                serviceday: branchOfficeData.serviceday,
            };

            const businessDB = {
                businessFields,
                managerFields,
                negotiationFields,
                collaborators,
                branchOfficeFields
            }
            res.json({
                ok: true,
                businessDB
            });
        }
    } else {
         console.log(error);
        // ERROR AL GUARDAR EL REGISTRO NUEVO NO TIENE EL ROLE REQUERIDO
        applogger.error(`Error en BUSCL-401 > viewOneBus: ERROR AL GUARDAR EL REGISTRO NUEVO NO TIENE EL ROLE REQUERIDO UserID: ${uid}`);
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-401: ',error
        });
    }
    try {

    
        
    } catch (error) {
        applogger.error(`Error en BUSCL-402 > viewOneBus: ERROR AL GUARDAR EL REGISTRO NUEVO NO TIENE EL ROLE REQUERIDO UserID: ${uid} error: ${error}`);
        res.status(418).json({
                ok: false,
                msg: 'BUSCL-402: ' + error
            });
    }



};

const viewOneBusForNit = async (req, res = response) => { 
    const uid = req.uid
    const busNit = req.body.BusinessNit
    try {
    
        const busDB = await business.find(
            { 'business.irs_nit': busNit, status: true },
            {  _id: 1, business: 1, status: 1, observation: 1 }
        )
    
        const busDataDB = {
            id: busDB[0]._id,
            business: busDB[0].business,
            status: busDB[0].status ,
            observation: busDB[0].observation
        }
    
        if (!busDB) {
            // No existe el business
            res.status(418).json({
                ok: false,
                msg: 'CLLBS-01: Business not found '
            });          
        }
        
        res.status(200).json({
            ok: true,
            busDataDB
        })

    } catch (error) {
        applogger.error(`Error en BUSCL-403 > viewOneBusForNit: ERROR Business not found BusinessID: ${busNit} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-403: Business not found '
        });     
    }
}

const viewOneBusBranchForNit = async (req, res = response) => { 
    try {
        const uid = req.uid
        const busNit = req.body.BusinessNit

        const busDB = await business.find(
            { 'business.irs_nit': busNit, status: true },
            { branchoffices: 1, _id: 1 }
        )

        if (!busDB) {
            // No existe el business
            res.status(418).json({
                ok: false,
                msg: 'CLLBS-02: Business not found '
            });          
        }

        res.status(200).json({
            ok: true,
            msg: busDB
        })

    } catch (error) {
        applogger.error(`Error en BUSCL-403 > viewOneBusBranchForNit: ERROR Business not found BusinessID: ${busNit} error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-403: Business not found '
        });
    }
}

const viewAllBus = async (req, res = response) => { 

    const uid = req.uid  
    const bus = req.bus
    try {
        const roleProfile = await RoleProfile(uid)
    
    
        if ((roleProfile.roleDestinations.includes(CRUDRole)
            || roleProfile.roleDestinations.includes(RURole))
            && roleProfile.roleDestinations.includes(RolePakki)) {
    
            const ViewAllBusiness = await business.find(
                {
                    status: true
                }
            ).sort({
                dateCreate: -1
            });
            
            
            res.json({
                ok: true,
                ViewAllBusiness
            });          
    
    
        } else if (roleProfile.roleDestinations.includes(RURole)) {
            
            const ViewAllBusiness = await business.findById(bus, )
                .where("status").equals(true)
                .populate("collaborators.profile")
            
            
            res.json({
                ok: true,
                ViewAllBusiness
            });
            
        } else {
             console.log(error);
            // ERROR AL GUARDAR EL REGISTRO NUEVO NO TIENE EL ROLE REQUERIDO
            applogger.error(`Error en BUSCL-404 > viewOneBusBranchForNit: ERROR AL GUARDAR EL REGISTRO NUEVO NO TIENE EL ROLE REQUERIDO BusinessID: ${bus}`)
            res.status(418).json({
                ok: false,
                msg: 'BUSCL-404'
            });
        }
        
    } catch (error) {
        applogger.error(`Error en BUSCL-405 > viewAllBus: ERROR AL GUARDAR EL REGISTRO NUEVO NO TIENE EL ROLE REQUERIDO BusinessID: ${bus} error: ${error}`)
        res.status(418).json({
                ok: false,
                msg: 'BUSCL-405: ', error
            });
    }
};

const createBus = async (req, res = response) => {

    const uid = req.uid
    const users = req.body.manager;
    const data = req.body;
    const nit = data.irs_nit;
    const roleProfile = await RoleProfile(uid)

    try {
        if (roleProfile.roleDestinations.includes(RolePakki)) {
    
            const busiDB = await business.find({
                "business.irs_nit": nit
            });
            const profileDB = await profile.find({name: "Owner"},{_id:1})
    
            if (busiDB.length === 0) {
    
                const userDB = await user.findById(users, {
                    pass: 0
                });
    
                if (!userDB) {
                    res.status(418).json({
                        ok: false,
                        msg: 'CLLBS-1: Error el Manager No existe.'
                    });
                } else {
                    data.tradename = 'date'
                    data.branchoffices = 1
                    const busDB = new business({
                        "business.irs_nit": data.irs_nit,
                        "business.tradename": data.tradename,
                        "business.businessname": data.businessname,
                        "business.companytype": data.companytype,
                        "business.mainaddress": data.mainaddress,
                        "business.phone.number": data.phoneNumber,
                        "business.phone.description": data.phoneDescription,
                        "business.cellphone.number": data.cellphoneNumber,
                        "business.cellphone.description": data.cellphoneDescription,
                        "business.email": data.email,
                        "business.branchoffices": data.branchoffices,
                        "business.city": data.city,
                        "business.citycode": data.citycode,
                        "business.country": data.country,
                        "business.countrycode": data.countrycode,
                        "business.state": data.state,
                        "manager.user": users,
                        "manager.name": userDB.name,
                        "manager.lastname": userDB.lastName,
                        "manager.phone": {
                            number: userDB.mobil
                        },
                        "manager.cellphone": {
                            number: userDB.mobil
                        },
                        "manager.email": userDB.email,
                        "manager.profile": profileDB,
                        "manager.creatorUser": uid,
                        "manager.dateCreate": marcaDeTiempoInter,
                        negotiation: data.negotiationDiscount,
                        observation: data.observation,
                        businessunique: data.irs_nit + '_' + data.businessname,
                        creatorUser: uid,
                        dateCreate: marcaDeTiempoInter,
                        dateUpdate: now,
                    });
    
                    const createBusDB = await busDB.save();
    
                    res.json({
                        ok: true,
                        msg: 'Se creó correctamente la Compañía'
                    });
                }
    
    
            } else {
                // El negocio ya existe
                applogger.error(`Error en BUSCL-406 > createBus: ERROR AL GUARDAR EL REGISTRO, LA COMPAÑÍA YA EXISTE BusinessID: ${nit}`)
                res.status(400).json({
                    ok: false,
                    msg: `El negocio con NIT ${nit} ya está registrado.`
                });
            }
    
        } else {
            // No tiene el perfil adecuado para realizar esta actividad
            applogger.error(`Error en BUSCL-407 > createBus: NO TIENE EL PERFIL PARA REALIZAR ESTA ACTIVIDAD UserID: ${uid}`)
            res.status(403).json({
                ok: false,
                msg: 'No tiene permisos para realizar esta acción.'
            });
        }
    } catch (error) {
        applogger.error(`Error en BUSCL-408 > createBus: Error al guardar el registro del negocio, ${nit}, Error: ${error}`)
        res.status(500).json({
            ok: false,
            msg: 'Ocurrió un error al guardar el registro del negocio.'
        });
    }
};


const updateBus = async (req, res = response) => { 

    // TODO: las validaciones se realizaran en el MW,:
    // Validar que el Business exista
    // Validar que el Owner exista, como usuario
    // Validar que el Collaborator exista, como usuario
    
    // TODO: LAS ACTUALIZACIONES QUE SE DEBEN HACER SON: COLLABORATOR,BUSINESSUSERS, USERS, 
    // TODO: Y EN CASO DE SER OWNER EN ESA COLECCION TAMBIEN
    try {  
        const uid = req.uid;
        const busId = req.body.irs_nit
        const colla = req.body.collaborators;
        
        const busDB = await business.findById(busId)
        .where("status").equals(true)
        
        const CollaDB = await collaborator.findById({ _id: colla }, { colla: 1, profile: 1 })
            .where("status").equals(true);
        
        const UpBusCollaDB = {
            $push: {
                collaborators: {
                name: CollaDB.colla.name,
                lastname: CollaDB.colla.lastName,
                docu: CollaDB.colla.docu,
                creatorUser: uid,
                dateCreate: now
                }
            }
        };
        const UpdateBusCollaDB = await business.findByIdAndUpdate(busId, UpBusCollaDB,{ new: true});
    
        await cargueprofile(busId,CollaDB.profile.profile);
    
        res.status(200).json({
            ok: true,
            UpdateBusCollaDB,
        });
    } catch (error) {
        // ERROR AL ACTUALIZAR EL REGISTRO
        applogger.error(`Error en BUSCL-408 > updateBus: ERROR AL ACTUALIZAR EL REGISTRO BusinessID: ${bus} error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: `CLLBS-3.1: ${error}`
        });
    }
};

const updateBusbrach = async (req, res = response) => { 

    // TODO: las validaciones se realizaran en el MW,:
    // Validar que el Business exista
    // Validar que el Owner exista, como usuario
    // Validar que el Collaborator exista, como usuario    
    const bus = req.params.id;
    const uid = req.uid;    
    const businessname = req.body.businessname;
    const tradename = req.body.tradename;
    const mainaddress = req.body.mainaddress;
    const phonenumber = req.body.phonenumber;
    const phonedescription = req.body.phonedescription;
    const cellphonenumber = req.body.cellphonenumber;
    const cellphonedescription = req.body.cellphonedescription;
    const email = req.body.email;
    const city = req.body.city;
    const CityCode = req.body.CityCode;
    const country = req.body.country;
    const CountryCode = req.body.CountryCode;
    const WorkdayTomorrow = {
        start: req.body.WorkdayTomorrow.start,
        end: req.body.WorkdayTomorrow.end,            
    }
    const WorkdayLate = {
        start: req.body.WorkdayLate.start,
        end: req.body.WorkdayLate.end,            
    }
    const state = req.body.state;
    const serviceday = req.body.serviceday;    
    const observation = req.body.observation;    
    const upbusBranchDB = {
        $push: {
            branchoffices: [{
                businessname: businessname,
                tradename: tradename,
                mainaddress: mainaddress,
                "phone.number": phonenumber,
                "phone.description": phonedescription,            
                "cellphone.number": cellphonenumber,
                "cellphone.description": cellphonedescription,
                email: email,
                city: city,
                CityCode: CityCode,
                country: country,
                CountryCode: CountryCode,
                state: state,
                WorkdayTomorrow,
                WorkdayLate,
                serviceday: serviceday,
                brachOfficeUnique: bus + ' ' + tradename,
                creatorUser: uid
            }],
            update: [{
                user: uid,
                dateUpdate: now,
                observation: observation,
            }]
        }
    };

    const busId = await business.find({
        _id: bus
    }, {
        _id: 1
    })

    // console.log('upbusBranchDB: ', upbusBranchDB)
    const updateBusBranchDB = await business.findByIdAndUpdate({ _id: bus }, upbusBranchDB);
    
    // console.log('updateBusBranchDB: ', updateBusBranchDB)
    
    res.status(200).json({
        ok: true,
        msg: 'La sucursal se ha actualizado correctamente.',
    });
    try {
    
    } catch (error) {
        // ERROR AL ACTUALIZAR EL REGISTRO
        applogger.error(`Error en BUSCL-409 > updateBusbrach: ERROR AL ACTUALIZAR EL REGISTRO error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-409'
        });

    } 
};

const updateBusiness = async (req, res = response) => { 

    // TODO: las validaciones se realizaran en el MW,:
    // Validar que el Business exista
    // Validar que el Owner exista, como usuario
    // Validar que el Collaborator exista, como usuario    
    const nit = req.params.id;
    const uid = req.uid;
    try {

        const {
            companytype, mainaddress, phonenumber,branchoffices, phonedescription, cellphonenumber, cellphonedescription, email, city,
            CityCode, country, state, manager, observation,
        } = req.body;

        const updatedData = {
            "business.companytype": companytype,
            "business.mainaddress": mainaddress,
            'business.phone.number': phonenumber,
            'business.phone.description': phonedescription,
            'business.cellphone.number': cellphonenumber,
            'business.cellphone.description': cellphonedescription,
            'business.branchoffices': branchoffices,
            'business.email': email,
            'business.city': city,
            'business.CityCode': CityCode,
            'business.country': country,
            'business.state': state,
        };

        const busId = await business.find({ "business.irs_nit": nit }, {_id:1})

        const updateBusinessDB = await business.findByIdAndUpdate(
            busId,
            {
                $set: updatedData,
                $push: {
                    update: {
                        user: uid,
                        dateUpdate: now,
                        observation,
                    },
                },
            },
            { new: true } // Devuelve el documento actualizado
        );

        if (!updateBusinessDB) {
            return res.status(404).json({
                ok: false,
                msg: 'updateBusinessDB: Business not found',
            });
        }
        
        res.status(200).json({
            ok: true,
            msg: 'La sucursal se ha actualizado correctamente.',
        });
    } catch (error) {
        // console.log(error);
        // ERROR AL ACTUALIZAR EL REGISTRO
        applogger.error(`Error en BUSCL-410 > updateBusiness: ERROR AL ACTUALIZAR EL REGISTRO BusinessID: ${bus} error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-410: ', error
        });
    } 
};

const updateBusCommercial = async (req, res = response) => {
    const uid = req.uid;
    const {
        irs_nit,
        assignedCommercial
    } = req.body;

    try {
        // Validar la existencia del negocio
        const busDB = await business.findOne({
            _id: irs_nit,
            status: true
        });

        if (!busDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Business not found',
            });
        }

        // Obtener información del usuario comercial
        const UserDB = await user.findById(assignedCommercial, {
            name: 1,
            lastName: 1,
            docu: 1,
            _id: 1
        });

        if (!UserDB) {
            return res.status(404).json({
                ok: false,
                msg: 'User not found',
            });
        }

        const collaId = UserDB.docu;

        // Obtener información del colaborador
        const CollaDB = await collaborator.findOne({
            "colla.docu": collaId,
            status: true
        }, {
            colla: 1,
            _id: 1
        });

        if (!CollaDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Collaborator not found',
            });
        }

        // Crear un objeto de comercial
        const commercialData = {
            user: CollaDB._id,
            name: CollaDB.colla.name,
            lastName: CollaDB.colla.lastName,
            update: {
                user: uid,
                dateUpdate: Date.now(),
                observation: 'Asignación de Comercial al Aliado'
            }
        };

        // Actualizar la propiedad 'assignedCommercial' del negocio usando Mongoose
        const updateBusCommercialDB = await business.findByIdAndUpdate(
            irs_nit,
            {
        assignedCommercial: commercialData
            },
            {
                new: true
            }
        );

        res.status(200).json({
            ok: true,
            msg: 'Se Asignó el Comercial Exitosamente',
        });

    } catch (error) {
        console.error(`Error en BUSCL-411 > updateBusCommercial: ERROR AL ACTUALIZAR EL REGISTRO BusinessID: ${irs_nit} error: ${error}`);
        res.status(500).json({
            ok: false,
            msg: 'Internal server error',
            error: error.message // Envía el mensaje de error al cliente
        });
    }
};


const updateBusColla = async (req, res = response) => {
    const uid = req.uid;
    const {
        businessname,
        irs_nit,
        nit_empresa,
        id_brachOffice_name,
        id_brachOffice,
        collaborator_name,
        profile
    } = req.body;

    const colla = req.body.collaborator
    try {

        // Verificar si el colaborador ya existe en el array de colaboradores
        const existingCollaborator = await business.findOne({
            "collaborators.user": colla,
        });

        if (existingCollaborator) {
            return res.status(418).json({
                ok: false,
                msg: `El colaborador: ${collaborator_name} ya existe en el aliado, ${businessname}.`
            });
        }
        // Buscar al colaborador en la base de datos de usuarios
        const CollaDB = await user.findById({
            _id: colla,
            status: true
        }, {
            name: 1,
            lastName: 1,
            docu: 1,
            mobil: 1,
            email: 1,
            docu: 1,
            pass: 1,
            _id: 0
        });     

        // Crear el objeto para actualizar el negocio
        const upbusDB = {
            $push: {
                collaborators: {
                    user: colla,
                    name: CollaDB.name,
                    lastname: CollaDB.lastName,
                    docu: CollaDB.docu,
                    profile: profile,
                    creatorUser: uid,
                    dateCreate: now
                }
            }
        };

        // Actualizar el negocio y obtener el ID de la sucursal
        const updateBusDB = await business.findOneAndUpdate({
                "business.irs_nit": nit_empresa,
                "status": true
            },
            upbusDB, {
                new: true
            }
        )

        // Actualizar el campo collaborators en branchoffices correspondiente
        const updateBranchOffice = await business.findOneAndUpdate({
            "branchoffices._id": id_brachOffice,
            "branchoffices.tradename": id_brachOffice_name
        }, {
            $push: {
                "branchoffices.$.collaborators": {
                    user: colla,
                    name: CollaDB.name,
                    lastname: CollaDB.lastName,
                    docu: CollaDB.docu,
                    profile: profile,
                    creatorUser: uid,
                    dateCreate: now
                }
            }
        });

        const colaboDB = new collaborator({
            colla: {
                collaborator: colla,
                name: CollaDB.name,
                lastName: CollaDB.lastName,
                docu: CollaDB.docu,
            },
            profile: profile,
            business: {
                business: irs_nit,
                irs: nit_empresa,
                businessName: id_brachOffice_name
            },
            collaboratorUnique: CollaDB.docu + ' ' + irs_nit,
            creatorUser: uid,
        });

        const BusUserDB = new businessUsers({
            "colla.collaborator": colla,
            "colla.name": CollaDB.name,
            "colla.lastName": CollaDB.lastName,
            "colla.mobil": CollaDB.mobil,
            "colla.email": CollaDB.email,
            "colla.docu": CollaDB.docu,
            "colla.pass": CollaDB.pass,
            "profile": profile,
            "business.business": irs_nit,
            "business.irs_nit": nit_empresa,
            "business.businessName": id_brachOffice_name,
            observation: '',
            collaboratorUnique: CollaDB.docu + ' ' + irs_nit
        });

        // CREA AL COLABORADOR EN EL DOCUMENTO
        const creaColla = await colaboDB.save();
        // CREA AL COLABORADOR EN LA DOCUMENTO DE BUSINESSUSERS
        const creaBusUser = await BusUserDB.save();

        res.status(200).json({
            ok: true,
            msg: `Se Vinculo el usuario: ${CollaDB.name} ${CollaDB.lastName} al Aliado: ${businessname} y la Sucursal ${id_brachOffice_name} Correctamente`
            // msg: updateBusDB
        });
    } catch (error) {
        // console.log(error);
        // ERROR AL ACTUALIZAR EL REGISTRO
        applogger.error(`Error en BUSCL-411 > updateBusColla: ERROR AL ACTUALIZAR EL REGISTRO DEL COLABORADOR AL BUSINESS irs_nit: ${irs_nit}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-411: ',
            error
        });
    }
};

const deleteBus = async (req, res = response) => { 

    const { name } = req.body;
    const existeRoll = await roll.findOne({ name: name });

    res.json({
        ok: true,
        existeRoll
    });

};

const viewBusPakki = async (req, res = response) => { 

    const { nit, collaborators } = req.body;
    try {
    
        const collaboratorsObjectId = new mongoose.Types.ObjectId(collaborators);
    
        const ViewBussPakki = await business.aggregate([
            {
                $match: {
                    // "business.irs_nit": nit,
                    // "collaborators.user": { $in: [collaboratorsObjectId] }
                }
            },
            {
                $project: {
                    _id: 1,
                    "business.businessname": 1,
                    "branchoffices._id": 1,
                    "branchoffices.tradename": 1,
                    branchofficesCount: { $size: "$branchoffices" }
                }
            }
        ]);
    
        // console.log(ViewBussPakki)
    
        res.json({
            ok: true,
            ViewBussPakki
        });
        
    } catch (error) {
        applogger.error(`Error en BUSCL-412 > viewBusPakki: Error al Visualizar el Business BusinessNit: ${nit}, collaID: ${collaborators}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-412: ', error
        });
    }
};

const viewBranchOfficeBusiness = async (req, res = response) => { 

    const { nit, branchOffice } = req.body;
    try {
        
        const ViewBranchOfficeBus = await business.aggregate([
            {
                $match: {
                    "business.irs_nit": nit,
                    "branchoffices": {
                        $elemMatch: {
                            "tradename": {
                                $regex: `^${branchOffice.slice(0, 3)}`,
                                $options: "i"
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "branchOffice",
                    localField: "branchOffice",
                    foreignField: "_id",
                    as: "branchOfficeInfo"
                }
            },
            {
                $project: {
                    _id: 1,
                    "business.businessname": 1,
                    "business.irs_nit": 1,
                    "branchoffices._id": 1,
                    "branchoffices.tradename": 1,
                    branchofficesCount: { $cond: { if: "$branchoffices", then: { $size: "$branchoffices" }, else: 0 } }
                }
            }
        ]);
    
        res.json({
            ok: true,
            ViewBranchOfficeBus
        });
        
    } catch (error) {
        applogger.error(`Error en BUSCL-413 > viewBranchOfficeBusiness: Error al Visualizar el BranchOffice del Business BusinessNit: ${nit}, branchID: ${branchOffice}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-413: '+ error
        });
    }
};

const viewBusPartner = async (req, res = response) => { 
    
    const { nit, collaborators } = req.body;
    try {
        
        const collaboratorsObjectId = new mongoose.Types.ObjectId(collaborators);
        // console.log('collaboratorsObjectId: ', collaboratorsObjectId)
    
        const ViewBussPakki = await business.aggregate([
            {
                $match: {
                    "business.irs_nit": nit,
                }
            },
            {
                $lookup: {
                    from: "collaborators",
                    localField: "collaborators.user",
                    foreignField: "_id",
                    as: "collaboratorsInfo"
                }
            },
            {
                $project: {
                    _id: 1,
                    "business.businessname": 1,
                    "branchoffices._id": 1,
                    "branchoffices.tradename": 1,
                    branchofficesCount: { $size: "$branchoffices" },
                    collaboratorsCount: { $size: "$collaboratorsInfo" }
                }
            }
        ]);

    
        // console.log(ViewBussPakki)
    
        res.status(200).json({
            ok: true,
            ViewBussPakki
        });
        
    } catch (error) {
        applogger.error(`Error en BUSCL-414 > viewBusPartner: Error al Visualizar el Partner del Business BusinessNit: ${nit}, error: ${error}`)
        res.status(418).json({
            ok: false,
            msg: 'BUSCL-414: ', error
        });
    }


};

const getViewOneBusiness = async (req, res = response) => {
    const {
        brachOffice
    } = req.body; // Se obtiene el nombre comercial de la sucursal desde el cuerpo de la solicitud

    try {
        // Validar que al menos se ingresen tres caracteres
        if (!brachOffice || brachOffice.length < 3) {
            return res.json([]); // Retorna un arreglo vacío si no se proporciona un nombre comercial válido
        }

        // Eliminar caracteres no alfanuméricos
        const searchNameCleaned = brachOffice.replace(/[^a-zA-Z0-9]/g, '');

        const query = {
            "branchoffices.tradename": {
                $regex: `^${searchNameCleaned}`,
                $options: 'i'
            },
            status: 'true'
        };

        try {
            const businesses = await business.find(query, {
                "branchoffices.tradename": 1,
                _id: 1
            }).exec();

            // Extraer los nombres comerciales de las sucursales encontradas y unificarlos en un solo array
            const tradenames = businesses.map(business => business.branchoffices.map(branch => branch.tradename)).flat();

            res.json({
                tradenames
            }); // Retorna un objeto con el array de nombres comerciales unificados
        } catch (err) {
            console.error('Error al buscar sucursales:', err);
            res.status(500).json({
                error: 'error del servidor'
            });
        }

    } catch (error) {
        console.error(`Error: ${error}`);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor',
            error
        });
    }
};




module.exports = {
    viewAllBus,
    viewOneBus,
    createBus,
    updateBus,
    deleteBus,
    updateBusColla,
    updateBusbrach,
    updateBusCommercial,
    viewBusPakki,
    viewBusPartner,
    updateBusiness,
    viewOneBusForNit,
    viewOneBusBranchForNit,
    viewBranchOfficeBusiness,
    getViewOneBusiness,
};
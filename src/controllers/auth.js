const bcrypt = require('bcryptjs');
const { response } = require('express');
const { generarJWT } = require('../helpers/jwt');
const jwt = require("jsonwebtoken");
const user = require('../models/user');
const BusinessUsers = require('../models/businessUsers');
const profiles = require('../models/profile');
const businessUsers = require('../models/businessUsers');
const business = require('../models/business');
const { marcaDeTiempo, marcaDeTiempoInter } = require('../helpers/pakkiDateTime');
const { RoleProfile } = require('../helpers/roleProfile');
const profile = require('../models/profile');
const { applogger } = require('../utils/logger');
const { JWT_SECRET } = require('../utils/config');


const RolePakki = 'Pakki'
const CRUDRole = 'CD User'
const RURole = 'RU User'

//TODO: Hacemos la consulta a la DB, de los Usuarios Existentes
//TODO: PAra hacer esta consulta debe tener los permisos necesarios
const viewUser = async (req, res = response) => { 

    const uid = req.uid;
    const Iduser = req.body.user
    
    try {
        
        const roleProfile = await RoleProfile(uid)    
    
        if ((roleProfile.roleDestinations.includes(CRUDRole)
            || roleProfile.roleDestinations.includes(RURole))
            && roleProfile.roleDestinations.includes(RolePakki)) { 
            
            const usersDB = await user.findOne({_id:Iduser} , {
                name: 1,
                lastName: 1,
                docu: 1,
                mobil:1,
                email: 1,
                terms: 1,
                profile:1,
                _id:1
            });
    
            res.json({
                ok: true,
                msg: 'Entramos a Consultar los Usarios Existentes',
                data: usersDB
            });       
        
        } else {
            applogger.error(`Error en AUTCL-4O1 > viewUser: No Cuenta con los permisos necesarios para realizar esta Operacion UserId: ${uid}`);
            res.status(418).json({
                ok: false,
                msg: 'AUTD-4O1: No Cuenta con los permisos necesarios para realizar esta Operacion'
            });
        }
    } catch (error) {
        applogger.error(`Error en AUTCL-4O2 > viewUser: Error No Cuenta con los permisos necesarios para realizar esta Operacion UserId: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'AUTD-4O2: Error No Cuenta con los permisos necesarios para realizar esta Operacion', error
        });
        
    }
    
};

const viewAllUser = async (req, res = response) => { 

    try {
        const uid = req.uid;
    
        const roleProfile = await RoleProfile(uid)    
    
        if ((roleProfile.roleDestinations.includes(CRUDRole)
            || roleProfile.roleDestinations.includes(RURole))
            && roleProfile.roleDestinations.includes(RolePakki)) {
            
            const usersDB = await user.find(
                {
                    status: true
                },
                {
                    name: 1, lastName: 1, docu: 1, role: 1,
                    email: 1, status: 1, address: 1, city: 1, country: 1,
                    state: 1, homephone: 1, workphone: 1
                }
            ).sort({
                    dateCreate: -1
                });
    
            res.json({
                ok: true,
                msg: 'Entramos a Consultar los Usarios Existentes',
                data: usersDB
            });
            
        
        } else {
            applogger.error(`Error en AUTCL-4O3 > viewAllUser: No Cuenta con los permisos necesarios para realizar esta Operacion UserId: ${uid} `);
            res.status(418).json({
                ok: false,
                msg: 'AUTCL-4O3: No Cuenta con los permisos necesarios para realizar esta Operacion'
            });
        }
        
    } catch (error) {
        applogger.error(`Error en AUTCL-4O4 > viewUser: Error No Cuenta con los permisos necesarios para realizar esta Operacion error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'AUTCL-4O4: No Cuenta con los permisos necesarios para realizar esta Operacion: ', error
        });
        
    }

};

//TODO: Ingresamos los campos requeridos para la creacion de los Usuarios
const createUser = async (req, res = response) => {
    try {
        const {
            docu,
            email
        } = req.body;
        //TODO: Tomamos el role basico de pakki-rest y lo asignamos al nuevo usuario 
        const roleNewUser = await profiles.findOne({
            name: 'CEI'
        }, {
            _id: 1
        })

        // ASIGNAMOS EL ID DE USUARIO AL NUEVO USUARIO
        const data = new user({
            role: roleNewUser,
            dateCreate: marcaDeTiempo,
            ...req.body
        });

        // ENCRIPTAR CONTRASEÑA
        const salt = bcrypt.genSaltSync();
        data.pass = bcrypt.hashSync(docu, salt);

        // Validacion que el EMAIL existe en la DB
        const existeEmail = await user.findOne({
            email: email
        });

        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: `El correo electrónico ${email} ya está en uso. Por favor, elige otro correo electrónico.`
            });
        }

        await data.save();

        res.json({
            ok: true,
            msg: `Se creó correctamente el nuevo Usuario: ${email}`
        });

    } catch (error) {
        applogger.error(`Error en AUTCL-4O5 > createUser: Error No Cuenta con los permisos necesarios para realizar esta Operacion UserId: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'AUTCL-4O5' + error
        });
    }
};


//TODO: tener en cuenta el perfil del usuario para hacer la actualizacion
const updateUser = async (req, res = response) => { 
    try {
        const uid = req.uid
        const { name, lastName, documentType, address, mobil, email, city, country, state,homephone,workphone } = req.body;
                
        // ASIGNAMOS EL ID DE USUARIO QUE ACTUALIZA LA DATA
        const update = {
            user: uid,
            dateUpdate: marcaDeTiempo,
            observation: 'Actualizacion de Datos de Usuario',
          };
    
        // Validacion que el EMAIL existe en la DB
        const existeEmail = await user.updateOne(
            { email: email },
            {
                $set: {
                    name,lastName,documentType,address,mobil,city,
                    country,state,homephone,workphone
                },
                $push: { update: update },
            },
            { new: true }
        );

        res.json({
            ok: true,
            msg: `Se Actualizo Correctamente el Usuario: ${email}`  
        });

    } catch (error) {
        applogger.error(`Error en AUTCL-4O6 > updateUser: Error No Cuenta con los permisos necesarios para realizar esta Operacion UserId: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'CLLAU-2.3: error',error
        });
    }
};

//TODO: Validacion de Ingreso al aplicativo
const login = async (req, res = response) => { 
    
    const { email, pass } = req.body;
    try {
        
        const userEmailDB = await BusinessUsers.findOne({ "colla.email": email },
        { collaboratorUnique: 0, terms: 0, dateCreate: 0, update: 0 })
            .where("status").equals(true);
                
        if (userEmailDB === false || userEmailDB === null) {
            // Email No Valida
            applogger.error(`Error en AUTCL-4O7 > login: Error en el Email o Contraseña: Email No Valida UserEmail: ${email}`);
            return res.status(404).json({
                ok: false,
                msg: 'AUTCL-4O7: Error en el Email o Contraseña'
            });
        }
        // Verificar Pass
        const validpass = bcrypt.compareSync(pass, userEmailDB.colla.pass);

        if (!validpass) {
            // Pass No Valido
            applogger.error(`Error en AUTCL-4O8 > login: Error en el Email o Contraseña: Pass No Valido UserEmail: ${email}`);
            return res.status(404).json({
                ok: false,
                msg: 'AUTCL-4O8: Error en el Email o Contraseña'
            });
        }
        
        // 
        const businessID = userEmailDB.business.business;
        
        // Generar un TOKEN JWT
        const token = await generarJWT(userEmailDB._id, businessID);
        
        // console.log(token);
        
        res.json({
            ok: true,
            token
        });
        
    } catch (error) {
        // Contraseña No Valida
        applogger.error(`Error en AUTCL-4O9 > login: Error procesar el Login del UserEmail: ${email} error: ${error}`);
        return res.status(404).json({
            ok: false,
            msg: 'AUTCL-4O9: ', error 
        });        
    }


};

//TODO: tener en cuenta el perfil del usuario para hacer la modificacion, no se borran datos solo se inactivan
const deleteUser = async (req, res = response) => {
    const {
        DocumentID
    } = req.body;
    
    try {
        // Buscar el usuario por DocumentID y asegurarse de que esté activo (status: true)
        const userToUpdate = await user.findOneAndUpdate({
            docu: DocumentID,
            status: true
        }
            , {
            $set: {
                status: false
            }
        }, {
            new: true
        });

        if (!userToUpdate) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado o ya está inactivo'
            });
        }

        res.json({
            ok: true,
            msg: `El estado del usuario: ${DocumentID} ha sido cambiado a inactivo correctamente`,
        });
    } catch (error) {
        applogger.error(`Error en COLCL-4O8 > deleteColla: Error_ al Eliminar el Colaborador USERID: ${DocumentID} error: ${error}`);
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar el estado del usuario a inactivo',
            error
        });
    }
};

const activeUserForDocumentID = async (req, res = response) => {
    const {
        DocumentID
    } = req.body;
    
    try {
        // Buscar el usuario por DocumentID y asegurarse de que esté activo (status: true)
        const userToUpdate = await user.findOneAndUpdate({
            docu: DocumentID,
        }
            , {
            $set: {
                status: true
            }
        }, {
            new: true
        });

        if (!userToUpdate) {
            return res.status(404).json({
                ok: false,
                msg: `Usuario: ${DocumentID} no encontrado o ya está inactivo`
            });
        }

        res.json({
            ok: true,
            msg: `El estado del usuario: ${DocumentID} ha sido cambiado a Activo correctamente`,
        });
    } catch (error) {
        applogger.error(`Error en COLCL-4O8 > deleteColla: Error_ al Eliminar el Colaborador USERID: ${DocumentID} error: ${error}`);
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar el estado del usuario a inactivo',
            error
        });
    }
};



//TODO: Valida el token entregado en el Login
const validateTokenUser = async (req, res = response) => { 

    // LEER EL TOKEN
    const token = req.header('x-token');
    let isProfile = ''

    // Validamos el token contra el Paikki-Rest
    const { uid, bus } = jwt.verify(token, JWT_SECRET);

    try {
        // users
        const userDB = await businessUsers.findById(uid, { 
            'colla.name': 1, 
            'colla.lastName': 1, 
            'colla.email': 1,
            'colla.changePass': 1,
            profile: 1 
        }).where("status").equals(true)


        // Realiza la consulta para obtener el perfil y sus roles
            const profileDB = await profile.findById(userDB.profile,{role:1, name: 1, _id:0})
            .populate('role', 'name destination -_id')
        
        if (profileDB.role.some((role) => role.name === 'Pakki')) {
            isProfile = 'Pakki'
        } else if (profileDB.role.some((role) => role.name === 'Owner')) {
            isProfile = 'Owner'
        } else if (profileDB.role.some((role) => role.name === 'CEI')) { 
            isProfile = 'CEI'
        }
        
        // Business
        const busDB = await business.findById(bus, {
            business: 1, branchoffices: 1,
            _id: 1
        })
            .where("status").equals(true)
        // Consolidacion de Informacion
    
        // Consolidacion de Informacion
        const resToken = {
            collaborator: {
                id: userDB._id,
                name: userDB.colla.name,
                lastName: userDB.colla.lastName,
                profile: isProfile,
                email: userDB.colla.email,
                changePass: userDB.colla.changePass
            },
            business: {
                id: busDB._id,
                businessNit: busDB.business.irs_nit,
                businessName: busDB.business.businessname,
                branchOffices: busDB.branchoffices.map((branch) => ({
                    id: branch._id,
                    tradeName: branch.tradename,
                    cellPhone: branch.cellphone.number,
                    mainAddress: branch.mainaddress,
                    email: branch.email,
                    closingTime: branch.end,
                    city: branch.city,
                    country: branch.country,
                })),
            },
        };    
        res.json({
            ok: true,
            data: resToken
        });
        
    } catch (error) {
        applogger.error(`Error en AUTCL-410 > validateTokenUser: Error procesar el token UserID: ${uid} error: ${error}`);
         res.status(418).json({
            ok: false,
            msg: 'AUTCL-410: ' + error
        });
    }
};

const viewOneUser = async (req, res = response) => {
    const uid = req.uid;
    try {
        const { name,lastName,docu,mobil,email } = req.body
        const Iduser = req.body.user
    
        const roleProfile = await RoleProfile(uid)
    
        if ((roleProfile.roleDestinations.includes(CRUDRole)
            || roleProfile.roleDestinations.includes(RURole))
            && roleProfile.roleDestinations.includes(RolePakki)) {
            
            const userUpDB = await user.updateOne(
            { _id: Iduser },
            {
                $set: {
                    name: name,
                    lastName: lastName,
                    docu: docu,
                    mobil: mobil,
                    email: email
                },
                $push: {
                    update: {
                        user: uid,
                        dateUpdate: marcaDeTiempoInter,
                        observation: 'Actualizacion por el Usuario de Pakki'
                    }
                }
            });
    
            const userDB = await user.findById(Iduser,{name:1,lastName:1,docu:1,mobil:1,email:1})
    
    
            res.status(200).json({
                ok: true,
                msg: userDB
            });
        
        } else if (roleProfile.roleDestinations.includes(RURole)) {
            const userUpDB = await user.updateOne(
            { _id: Iduser },
            {
                $set: {
                    name: name,
                    lastName: lastName,
                    docu: docu,
                    mobil: mobil,
                    email: email
                },
                $push: {
                    update: {
                        user: uid,
                        dateUpdate: marcaDeTiempoInter,
                        observation: 'Actualizacion por el Usuario de Pakki'
                    }
                }
            });
    
            const userDB = await user.findById(Iduser,{name:1,lastName:1,docu:1,mobil:1,email:1})
            res.status(200).json({
                ok: true,
                msg: userDB
            });
        } else {
            applogger.error(`Error en AUTCL-411 > viewOneUser: No Cuenta con los permisos necesarios para realizar esta Operacion UserID: ${uid}`);
            res.status(418).json({
                ok: false,
                msg: 'AUTCL-411: No Cuenta con los permisos necesarios para realizar esta Operacion'
            });
         }
        
    } catch (error) {
        applogger.error(`Error en AUTCL-412 > viewOneUser: Error No Cuenta con los permisos necesarios para realizar esta Operacion UserID: ${uid} error: ${error}`);
         res.status(418).json({
                ok: false,
                msg: 'Error No Cuenta con los permisos necesarios para realizar esta Operacion: ', error
            });
    }
}

//TODO: tener en cuenta el perfil del usuario para hacer la actualizacion
const restorePassword = async (req, res = response) => { 

    const uid = req.uid
    try {
        const userCC = req.body.document
    
        // ENCRIPTAR CONTRASEÑA
        const salt = bcrypt.genSaltSync();
        const restorePass = bcrypt.hashSync(userCC, salt);
    
        const update = {
            user: uid,
            dateUpdate: marcaDeTiempoInter,
            observation: "Solicitud de Restablecer Contraseña"
        }
        
        // ASIGNAMOS EL ID DE USUARIO AL NUEVO USUARIO
        const updatePassBusinessUserDB = await businessUsers.updateOne(
          { "colla.docu": userCC },
          {
            $push: { update: update },
            $set: {
              "colla.pass": restorePass,
              "colla.changePass": false,
            },
          }
        );
    
        const updatePassUserDB = await user.findOneAndUpdate(
          { docu: userCC },
          {
            $push: { update: update },
            $set: { pass: restorePass },
          },
          { new: true }
        );
        
        res.json({
            ok: true,
            msg: 'Se Restauro la contraseña al usuario: ' + userCC
        });
        
    } catch (error) {
        applogger.error(`Error en AUTCL-413 > restorePassword: Error al restaurar la contraseña al usuario UserID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'AUTCL-413: Error al restaurar la contraseña al usuario: ', error
        });
    }
    
};



module.exports = {
    viewUser,
    viewAllUser,
    createUser,
    login,
    updateUser,
    deleteUser,
    validateTokenUser,
    viewOneUser,
    restorePassword,
    activeUserForDocumentID,
};
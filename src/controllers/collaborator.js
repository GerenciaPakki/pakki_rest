const { response } = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const collaborator = require('../models/collaborator');
const users = require('../models/user');
const user = require('../models/user');
const businessUser = require('../models/businessUsers');
const business = require('../models/business');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');

const {RoleProfile} = require('../helpers/roleProfile');
const profile = require('../models/profile');
const businessUsers = require('../models/businessUsers');
const { applogger } = require('../utils/logger');

const RolePakki = 'Pakki'
const CRUDRole = 'CD Collaborator'
const RURole = 'RU Collaborator'
let CountColla = 0

const viewColla = async (req, res = response) => { 

    const uid = req.uid
    try {
        const roleProfile = await RoleProfile(uid);
    
        if ((roleProfile.roleDestinations.includes(CRUDRole) 
        || roleProfile.roleDestinations.includes(RURole)) 
        && roleProfile.roleDestinations.includes(RolePakki)) { 
            // TODO: Visualiza todos los colaboradores registrados en la Coleccion        
            const ViewAllCollaborator = await collaborator.aggregate([
                {
                    $match: { status: true }
                },
                {
                    $lookup: {
                        from: "profiles", // Nombre de la colección "profiles"
                        localField: "profile",
                        foreignField: "_id",
                        as: "profile"
                    }
                },
                {
                    $unwind: "$profile"
                },
                {
                    $lookup: {
                        from: "roles", // Nombre de la colección "roles"
                        localField: "profile.role",
                        foreignField: "_id",
                        as: "roles"
                    }
                },
                {
                    $group: {
                        _id: "$business",
                        business: { $first: "$business" },
                        status: { $first: "$status" },
                        collaborators: {
                            $push: {
                                _id: "$_id",
                                name: "$colla.name",
                                lastName: "$colla.lastName",
                                docu: "$colla.docu",
                                profile: {
                                    name: "$profile.name",
                                    roles: "$roles.name"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                    _id: 0,
                    business: {
                        irs: "$business.irs",
                        businessName: "$business.businessName"
                    },
                    collaborators: {
                        _id: 1,
                        name: 1,
                        lastName: 1,
                        docu: 1,
                        profile: {
                            name: 1,
                            roles: 1
                        }
                    }
                    }
                }   
            ]);
            
            res.json({
                ok: true,
                msg: ViewAllCollaborator
            });
    
        } else if (roleProfile.roleDestinations.includes(RURole)) {
    
            const ViewOneCollaborator = await collaborator.findById({ uid, "business.business": roleProfile.profileBusiness.business },
                {
                    business:1,colla:1,profile:1, _id:1
                })
                .populate('role', 'name -_id')
                .populate('profile', 'name -_id')
            
        } else {
            // console.log('No Tenemos rol Gestion del Colaborador')
            applogger.error(`Error en COLCL-4O1 > viewColla: ERROR_ AL GUARDAR EL REGISTRO NUEVO No Tenemos rol Gestion del Colaborador User: ${uid} error: ${error}`);
            // ERROR AL GUARDAR EL REGISTRO NUEVO No Tenemos rol Gestion del Colaborador
            res.status(418).json({
                ok: false,
                msg: 'COLCL-4O1'
            });
        }        
    } catch (error) {
        applogger.error(`Error en COLCL-4O1 > viewColla: ERROR_ AL GUARDAR EL REGISTRO NUEVO No Tenemos rol Gestion del Colaborador User: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O1: ', error
        });
    }

};
const viewAllUsers = async (req, res = response) => { 

    const uid = req.uid
    try {
        const roleProfile = await RoleProfile(uid);
    
        const query = { status: true };
    
    
        const UserDB = await businessUser.find(query, {
            "colla.name": 1, lastName: 1,
            "colla.lastName": 1, lastName: 1,
            "colla.docu": 1, mobil: 1,
            "colla.email": 1, city: 1,
            "business.businessName": 1, state: 1,
            "business.irs_nit":1, _id: 1
        })

        // Aquí envíamos la respuesta con el usuario encontrado
        res.status(200).json({
            ok: true,
            msg: UserDB
        });

    } catch (error) {
        applogger.error(`Error en COLCL-4O2 > viewAllUsers: ERROR_ AL VISUALIZAR TODOS LOS USERS User: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O2: ', error
        });
    }

};

const ViewCollaXcc = async (req, res = response) => { 
    const uid = req.uid;
    try {
        const SearchUser = req.body.DocumentID;

        // Validar que al menos se ingresen tres caracteres
        if (SearchUser.length < 3) {
            return res.json([]);
        }

        const query = { docu: SearchUser };


        const users = await user.find(query, {
            name: 1, 
            lastName: 1, 
            _id: 1
        }).exec();

        const concatenatedNames = users.map(user => ({
            _id: user._id,
            fullName: `${user.name} ${user.lastName}`
        }));

        // Aquí envíamos la respuesta con el usuario encontrado
        res.status(200).json({
            ok: true,
            msg: concatenatedNames
        });

    } catch (error) {
        applogger.error(`Error en COLCL-4O3 > ViewCollaXcc: ERROR_ AL VISUALIZAR TODOS LOS COLLABORATOR FOR DOCUMENT CollaID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O3: ' + error
        });
    }
};

const ViewCollaXccBusinessUsers = async (req, res = response) => { 
    
    const uid = req.uid;    
    try {
        const SearchUser = req.body.DocumentID;
    
        // Validar que al menos se ingresen tres caracteres
        if (SearchUser.length < 3) {
            return res.json([]);
        }
    
        const query = { "colla.docu": SearchUser };
        const businessUser = await businessUsers.findOne(query,
            { "colla.name": 1, "colla.lastName": 1, profile: 1 }
        )
    
        if (businessUser) {
            const profileDB = await profile.findById(businessUser.profile,
                { name: 1, role: 1, _id: 1 }).populate('role', 'name -_id').lean();
                const updatedUser = { ...businessUser.toObject(), profile: profileDB };
                // console.log('updatedUser: ', updatedUser)
                res.status(200).json({
                    ok: true,
                    msg: updatedUser
                });
        }        

    } catch (error) {
        applogger.error(`Error en COLCL-4O4 > ViewCollaXccBusinessUsers: ERROR_ AL VISUALIZAR EL COLLABORATOR FOR DOCUMENT AND_ BUSINESS CollaID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O4: ERROR_ AL VISUALIZAR EL COLLABORATOR FOR DOCUMENT AND_ BUSINESS ' + error
        });
    }
};

const ViewUserXccUsers = async (req, res = response) => { 
    const uid = req.uid;
    try {
        const SearchUser = req.body.DocumentID;
    
        // Validar que al menos se ingresen tres caracteres
        if (SearchUser.length < 3) {
            return res.json([]);
        }
    
        const query = { docu: SearchUser, status: true };
    
    
        const UserDB = await users.find(query, {
            name: 1, lastName: 1,
            docu: 1, mobil: 1,
            email: 1, city: 1,
            country: 1, state: 1,
            homephone: 1, workphone: 1,
            _id: 1
        })

        // Aquí envíamos la respuesta con el usuario encontrado
        res.status(200).json({
            ok: true,
            msg: UserDB
        });

    } catch (error) {
        applogger.error(`Error en COLCL-4O5 > ViewUserXccUsers: ERROR_ VIEW_ USER FOR DOCUMENT AND_ BUSINESS CollaID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O5: ERROR_ VIEW_ USER FOR DOCUMENT AND_ BUSINESS' + error
        });
    }
};

const createColla = async (req, res = response) => {
    const uid = req.uid;
    try {        
        const BusUid = req.bus;
        const tradename = req.body.tradename;
        const user = req.body.collaborator;
        const profile = req.body.profile;
        const bus = req.body.business;
        const observation = req.body.observation;
    
        const roleProfile = await RoleProfile(uid);
    
        if ((roleProfile.roleDestinations.includes(CRUDRole)
            || roleProfile.roleDestinations.includes(RURole))
            && roleProfile.roleDestinations.includes(RolePakki)) { 
            try {
                const busDB = await business.findById(bus, { business: 1, _id: 0 })
                    .where("status").equals(true);
                
                const userIdObject = new mongoose.Types.ObjectId(user);
                const userDB = await users.findById({
                    _id: userIdObject
                }, {
                    name: 1,
                    lastName: 1,
                    docu: 1,
                    mobil: 1,
                    email: 1,
                    docu: 1,
                    pass: 1,
                    _id: 0
                })
                    .where("status").equals(true);
                
                // Busca el negocio por ID y el tradename de la sucursal
                const sucursal = await business.findOne({
                    _id: bus,
                    'branchoffices.tradename': tradename
                })
                
                const colaboDB = new collaborator({
                    colla: {
                        collaborator: user,
                        name: userDB.name,
                        lastName: userDB.lastName,
                        docu: userDB.docu,
                    },
                    profile: profile,
                    business: {
                        business: bus,
                        irs: busDB.business.irs_nit,
                        businessName: busDB.business.businessname
                    },
                    collaboratorUnique: userDB.docu + ' ' + bus,
                    creatorUser: uid,        
                });
            
                const BusUserDB = new businessUser({
                    "colla.collaborator": user,
                    "colla.name": userDB.name,
                    "colla.lastName": userDB.lastName,
                    "colla.mobil": userDB.mobil,
                    "colla.email": userDB.email,
                    "colla.docu": userDB.docu,
                    "colla.pass": userDB.pass,
                    "profile": profile,
                    "business.business": bus,
                    "business.irs_nit": busDB.business.irs_nit,
                    "business.businessName": busDB.business.businessname,
                    observation: observation,
                    collaboratorUnique:userDB.docu+' '+bus
                });
        
                // CREA AL COLABORADOR EN EL DOCUMENTO
                const creaColla = await colaboDB.save();
                // CREA AL COLABORADOR EN LA DOCUMENTO DE BUSINESSUSERS
                const creaBusUser = await BusUserDB.save();               
            
                res.status(200).json({
                    ok: true,
                    msg: `Se ha vinculado correctamente el Colaborador ${userDB.name} ${userDB.lastName} con la Empresa  ${busDB.business.businessname}`
                });
        
            } catch (error) {
                if (error.code === 11000 && error.keyPattern && error.keyValue) {
                    // Clave duplicada detectada en la colección de colaboradores
                    console.error('Error de duplicación de clave:', error);
                    res.status(400).json({
                        ok: false,
                        msg: 'Error al guardar el registro. El colaborador ya está vinculado a esta empresa.'
                    });
                } else {
                    // Otro tipo de error
                    console.error('Error al guardar el registro:', error);
                    res.status(500).json({
                        ok: false,
                        msg: 'Error Al guardar el Usuario que No existe en la Base.'
                    });
                }
            }
        } else {
            console.log(error);
            // ERROR AL GUARDAR EL REGISTRO NUEVO YA EXISTE EN LA COLECCION
            res.status(418).json({
                ok: false,
                msg: 'CLLAU-2.5'
            });
        }
    } catch (error) {
        applogger.error(`Error en COLCL-4O6 > createColla: ERROR AL GUARDAR EL REGISTRO NUEVO YA EXISTE EN LA COLECCION CollaID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O6: ', error
        });
    }
};

const updateColla = async (req, res = response) => { 

    const { name } = req.body;
    try {
        const existeRoll = await roll.findOne({ name: name });
    
        const roleProfile = await RoleProfile(uid);
    
        if ((roleProfile.roleDestinations.includes(CRUDRole) || roleProfile.roleDestinations.includes(RURole)) && roleProfile.roleDestinations.includes(RolePakki) ) { 
            
            /* 
            para el perfil de Pakki, puede realizar las actualizaciones de informacion del Business datos que el Aliado no podra modificar
            */
    
    
        } else if (roleProfile.roleDestinations.includes(RURole)) { 
            /* 
            para este perfil solo podra modificar unos campos fijos ya que esto sera para los usuarios generales
            */
        }
    
        res.json({
            ok: true,
            existeRoll
        });
        
    } catch (error) {
        applogger.error(`Error en COLCL-4O6 > updateColla: ERROR AL ACTUALIZAR EL REGISTRO NAME: ${name} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'CLLAU-2.6: ', error
        });
    }
};

const updatePassColla = async (req, res = response) => {

    const uid = req.uid;
    try {
        const { document, password, validatepassword } = req.body;
      
        const businessUserDB = await businessUsers
          .findOne({ "colla.docu": document, status: true })
          .select({ colla: 1 });
      
        let updatePassBusinessUserDB;
        let updatePassUserDB;
      
        if (!businessUserDB) {
          // El usuario no existe
          return res.status(418).json({
            ok: false,
            msg: 'CLLAU-1',
          });
        }
      
        if (password === validatepassword) {
          const salt = bcrypt.genSaltSync();
          const Updatepass = bcrypt.hashSync(password, salt);
      
          const update = {
            user: uid,
            dateUpdate: marcaDeTiempo,
            observation: 'Actualizacion de inicio de Sesion por el Usuario',
          };
      
          updatePassBusinessUserDB = await businessUsers.updateOne(
            { "colla.docu": document },
            {
              $push: { update: update },
              $set: {
                "colla.pass": Updatepass,
                "colla.changePass": true,
              },
            }
          );
      
          updatePassUserDB = await user.findOneAndUpdate(
            { docu: document },
            {
              $push: { update: update },
              $set: { pass: Updatepass },
            },
            { new: true }
          );
        } else {
          // La Contraseña No Coincide con la Validacion
          return res.status(418).json({
            ok: false,
            msg: 'CLLAU-2',
          });
        }
      
        // La Contraseña se actualiza correctamente
        res.status(200).json({
          ok: true,
          msg: 'Se Actualizó la Contraseña Correctamente',
        });
        
    } catch (error) {
        applogger.error(`Error en COLCL-4O7 > updateColla: La Contraseña No Coincide con la Validacio USERID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O7: ', error
        });
    }
};


const deleteColla = async (req, res = response) => { 

    const { DocumentID } = req.body;
    try {
        const ChangeStatusDB = await users.findOne(
            {
                docu: DocumentID, status: true
            },
            {
                update: 0
            });
    
        res.json({
            ok: true,
            msg: 'Vamos a cambiar el Status del Usuario a False',
            ChangeStatusDB
        });        
    } catch (error) {
        applogger.error(`Error en COLCL-4O8 > deleteColla: Error_ al Eliminar el Colaborador USERID: ${DocumentID} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O8: ', error 
        });
    }


};

const viewUser = async (req, res = response) => { 

    // LEER EL TOKEN
    const token = req.header('x-token');    
    // Validamos el token contra el Paikki-Rest
    const { uid, bus } = jwt.verify(token, process.env.JWT_SECRET);
    try {
    
        const business = req.body.business
    
        const usersDB = await businessUsers.find({
            "business.business": business,
            // "profiles": { $nin: ["6465447581ddbce4478a17e6", "6465453fa24950983633567a"] },
            "status": true
        }, {
            "colla.name": 1,
            "colla.lastName": 1,
            "colla.email": 1,
            _id:0
        });
    
        res.json({
            ok: true,
            msg: 'Entramos a Consultar los Usarios Existentes',
            data: usersDB
        });
        
    } catch (error) {
        applogger.error(`Error en COLCL-4O9 > viewUser: Error_ al Visualizar todos los Usuarios USERID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O9: ', error
        });
    }

};

const viewOneUser = async (req, res = response) => {

    try {
        
        const uid = req.uid;
        const { name,lastName,docu,mobil,email } = req.body
        const Iduser = req.body.user
    
        const roleProfile = await RoleProfile(uid)
    
        if ((roleProfile.roleDestinations.includes(CRUDRole)
            || roleProfile.roleDestinations.includes(RURole))
            && roleProfile.roleDestinations.includes(RolePakki)) {
            
            const userUpDB = await users.updateOne(
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
    
            const userDB = await users.findById(Iduser,{name:1,lastName:1,docu:1,mobil:1,email:1})
    
    
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
    
            const userDB = await users.findById(Iduser,{name:1,lastName:1,docu:1,mobil:1,email:1})
    
    
            res.status(200).json({
                ok: true,
                msg: userDB
            });
        } else {
            res.status(418).json({
                ok: false,
                msg: 'No Cuenta con los permisos necesarios para realizar esta Operacion'
            });
        }
    } catch (error) {
        applogger.error(`Error en COLCL-4O10 > viewOneUser: Error_ al Visualizar un Usuarios USERID: ${uid} error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'COLCL-4O10: ', error
        });
    }
}

module.exports = {
    viewColla,
    ViewCollaXcc,
    createColla,
    updateColla,
    updatePassColla,
    deleteColla,
    viewUser,
    viewOneUser,
    ViewCollaXccBusinessUsers,
    ViewUserXccUsers,
    viewAllUsers,
};
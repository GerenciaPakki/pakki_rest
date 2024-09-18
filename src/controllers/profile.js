const { response } = require('express');
const profileM = require('../models/profile');
const roleM = require('../models/role');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');
const profile = require('../models/profile');
const { RoleProfile } = require('../helpers/roleProfile');
const businessUsers = require('../models/businessUsers');
const role = require('../models/role');
const { applogger } = require('../utils/logger');



const viewProfile = async (req, res = response) => { 
    const { name } = req.body
    try {
    
        const profileDB = await profileM
          .find({ name: name }, { name: 1, _id: 1 })
          .populate({
            path: 'role',
            select: 'name destination _id', // Lista de campos de business que deseas obtener
          })
          
        res.json({
            ok: true,
            profileDB
        });
        
    } catch (error) {
        applogger.error(`Error en PROFCL-4O1 > viewProfile: Error al Visualizar el Prfile, name: ${name}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'PRFL-1.0: ', error
        });
    }

};

const createProfile = async (req, res = response) => { 
    const { name } = req.body;
    const data = new profileM(req.body);

    try {
        const existeProfile = await profileM.find({ name: name });
        
        if (!existeProfile) {
            // El profile ya esta Registrado
            return res.status(418).json({
                ok: false,
                msg: 'CLLPF-1'
            });
        }        
        await data.save();
        res.status(200).json({
            ok: true,
            msg: 'Perfil Ingresado Correctamente'
        });
        
    } catch (error) {
        applogger.error(`Error en PROFCL-4O2 > createProfile: Error al Crear el Prfile, name: ${name}, error: ${error}`);
        // ERROR AL GUARDAR EL PERFIL
        res.status(418).json({
            ok: false,
            msg: 'CLLPF-2'
        });
    }
};

const updateProfile = async (req, res = response) => { 

    const uid = req.uid;
    const { profile, role, observation } = req.body;
    try {
        
        const existingProfile = await profileM.findOne({ 
                _id: profile, 
                role: { $all: role } 
            })
    
        if (existingProfile) {
            // El NO profile Existe
            return res.status(418).json({
                ok: false,
                msg: 'CLLPF-3: Ya existe el Rol en el Perfil'
            });
        }
    
        const existeRole = await roleM.findById(role, { name:1, _id: 1 })
    
        if (!existeRole) {
            // El No role Existe
            return res.status(418).json({
                ok: false,
                msg: 'CLLPF-4: el Rol no Existe.'
            });
        }
    
        if (existingProfile) {
            res.status(418).json({
                ok: true,
                msg: `El role ya existe en el profile. No se realizará la inserción.`
            });
        } else {
        // El role no existe, se procede a insertarlo en el array
            const proUP = await profileM.updateOne(
                { _id: profile },
                { $push: {
                        role: role,
                        update: {
                            user: uid,
                            dateUpdate: marcaDeTiempo,
                            observation: observation
                        }
                    }
                }
            )
    
            // console.log(proUP)
    
            res.status(200).json({
                ok: true,
                msg: "Se Agrego Correctamente el Rol al Perfil"
            });
        }
        
    } catch (error) {
        applogger.error(`Error en PROFCL-4O3 > updateProfile: Error al Actualizar el Profile: ${profile}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'CLLPF-3: ', error
        });
    }

};

const viewOneProfile = async (req, res = response) => {
    
    const searchName = req.body.profile
    try {
        
        // Validar que al menos se ingresen tres caracteres
        if (searchName.length < 3) {
            return res.json([]); // Retorna un arreglo vacío si no hay suficientes caracteres
        }
    
        // Eliminar caracteres no alfanuméricos
        const searchNameCleaned = searchName.replace(/[^a-zA-Z0-9]/g,'');
        
        const query = { name: { $regex: `^${searchNameCleaned}`, $options: 'i' } };
        try {
            const profiles = await profile.find(query, {
                name: 1, _id:1
            }).exec();
    
            res.json(profiles);
        } catch (err) {
            console.error('Error when searching for profiles:', err);
            res.status(500).json({ error: 'server error' });
        }
        
    } catch (error) {
        applogger.error(`Error en PROFCL-4O4 > viewOneProfile: Error al Visualizar un searchName: ${searchName}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'CKPTL- 1.1:', error
        });
    }

};

const deleteProfile = async (req, res = response) => { 

    const { profile, role, observation, } = req.body;
    try {
        console.log('datos de ingreso para Borrar: ', profile, role, observation)
        // const existeProfile = await profile.findOne({
        //     profile: profile
        // });
    
        // res.json({
        //     ok: true,
        //     existeProfile
        // });
        
    } catch (error) {
        applogger.error(`Error en PROFCL-4O5 > deleteProfile: Error al Eliminar un name: ${name}, error: ${error}`);
    }

};

const viewBusinessUserForDocu = async (req, res = response) => { 

    const uid = req.uid;
    const userCC = req.body.userCC

           

    try {
        
        

        const RolePakki = 'Pakki'
        const CRUDRole = 'CD User'
        const RURole = 'RU User'
    
        const roleProfile = await RoleProfile(uid)
    
        if ((roleProfile.roleDestinations.includes(CRUDRole)
            || roleProfile.roleDestinations.includes(RURole))
            && roleProfile.roleDestinations.includes(RolePakki)) { 
            
            const usersDB = await businessUsers.findOne(
                {
                    "colla.docu": userCC,
                    status: true
                },
                {
                    "colla.name": 1,
                    "colla.lastName": 1,
                    "colla.email": 1,
                    "colla.docu": 1,
                    profile: 1,
                    business: 1,
                    _id:1
                }
            ).populate(
                {
                    path: 'profile',
                    select: 'name role', 
                },
            ).populate(
                {
                    path: 'profile.role',
                    select: 'name',
                }
            ).exec()

            if (usersDB && usersDB.profile && usersDB.profile.role) {
                const rolesIDs = usersDB.profile.role;

                const roles = await role.find(
                    {
                        _id: { $in: rolesIDs }            
                    },
                    {
                        name: 1,destination:1, _id:1
                    }
                );

                usersDB.profile.role = roles; // Reemplaza los IDs de roles con la información completa de los roles
            }
            
                    res.json({
                        ok: true,
                        msg: 'Entramos a Consultar los Usarios Existentes',
                        data: usersDB
                    });
                    
                
                } else {
                    res.status(418).json({
                        ok: false,
                        msg: 'No Cuenta con los permisos necesarios para realizar esta Operacion'
                    });
                }
    } catch (error) {
        applogger.error(`Error en PROFCL-4O6 > viewBusinessUserForDocu: Error al Visualizar un BUsinessUser searchName: ${searchName}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'No Cuenta con los permisos necesarios para realizar esta Operacion', error
        });
        
    }
    
};


module.exports = {
    viewProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    viewOneProfile,
    viewBusinessUserForDocu,
};
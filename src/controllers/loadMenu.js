const { response } = require('express');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const business = require('../models/business');
const collaborator = require('../models/collaborator');
const businessUsers = require('../models/businessUsers');
const profile = require('../models/profile');
const menuProfile = require('../models/menuProfile');
const { JWT_SECRET } = require('../utils/config');
const { applogger } = require('../utils/logger');


const ViewMenuForProfile = async (req, res = response) => {

    const profileUser = req.body.profileUser;
    const uid = req.uid;

    try {
        const profileStringDB = await menuProfile.findOne({
            profile: profileUser,
        }, {
            title: 1,
            icon: 1,
            profile: 1,
            menu: 1,
            _id: 1
        });

        if (!profileStringDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Profile not found'
            });
        }

        const menuItems = profileStringDB.menu.filter(item => item.status);

        res.status(200).json({
            ok: true,
            menu: menuItems
        });

    } catch (error) {
        console.error(error);
        applogger.error(`Error en LOMECL-4O1 > createFileData: Error al Cargar los datos de DaneCode uid: ${uid}, profileUser: ${profileUser}, error: ${error}`);
        res.status(500).json({
            ok: false,
            msg: 'Internal Server Error'
        });
    }

}


const loadMenu = async (req, res = response) => {
    // LEER EL TOKEN
    const token = req.header('x-token');
    // Validamos el token contra el Paikki-Rest
    const {
        uid,
        bus
    } = jwt.verify(token, JWT_SECRET);

    console.log('Datos de Entrada para el Token: ', uid, bus)

    try {
        const businessDB = await business.findById(bus, {
                collaborators: 1,
                business: 1,
                _id: 0
            })
            .where('status').equals(true)

        if (!businessDB) {
            // Bus no existe en la colección de business
            return res.status(418).json({
                ok: false,
                msg: 'CLLMN-1'
            })
        }

        const collaDB = await businessUsers.findById(uid, {
                business: 1,
                profile: 1,
                _id: 0
            })
            .where('status').equals(true)

        if (!collaDB) {
            // El UID no existe en la colección de businessUsers
            return res.status(418).json({
                ok: false,
                msg: 'CLLMN-2'
            })
        }


        if (parseFloat(businessDB.business.irs_nit) === collaDB.business.irs_nit) {

            const profileId = collaDB.profile


            // Realiza la consulta para obtener el perfil y sus roles
            const profileDB = await profile.findById(profileId, {
                    role: 1,
                    name: 1,
                    _id: 0
                })
                .populate('role', 'name destination -_id')


            if (profileDB.role.some((role) => role.name === 'Pakki')) {
                const isPakki = profileDB.role.some((role) => role.name === 'Pakki');


                const menuDB = await menuProfile.aggregate([{
                        $match: {
                            profile: 'Pakki' // Filtra por el perfil 'Pakki'
                        }
                    },
                    {
                        $unwind: "$menu" // Descompone el array 'menu' en documentos separados
                    },
                    {
                        $match: {
                            "menu.status": true // Filtra los menús con status: true
                        }
                    },
                    {
                        $project: { // Proyecta los campos que deseas conservar
                            title: 1,
                            profile: 1,
                            "menu.path": 1,
                            "menu.title": 1,
                            "menu.type": 1,
                            "menu.icontype": 1,
                            "menu.collapse": 1,
                            "menu.access": 1,
                            "menu.status": 1,
                            "menu.children": 1,
                        }
                    },
                    {
                        $group: { // Agrupa los resultados por el título y el perfil
                            _id: {
                                title: "$title",
                                profile: "$profile"
                            },
                            menu: {
                                $push: "$menu"
                            }
                        }
                    },
                    {
                        $project: { // Proyecta los campos finales con el título y el perfil al principio
                            _id: 0,
                            title: "$_id.title",
                            profile: "$_id.profile",
                            menu: 1
                        }
                    }
                ]);





                res.json({
                    ok: true,
                    data: menuDB[0]
                });
            } else if (profileDB.role.some((role) => role.name === 'Owner')) {
                const isOwner = profileDB.role.some((role) => role.name === 'Owner');

                const menuDB = await menuProfile.aggregate([{
                        $match: {
                            profile: 'Owner' // Filtra por el perfil 'Pakki'
                        }
                    },
                    {
                        $unwind: "$menu" // Descompone el array 'menu' en documentos separados
                    },
                    {
                        $match: {
                            "menu.status": true // Filtra los menús con status: true
                        }
                    },
                    {
                        $project: { // Proyecta los campos que deseas conservar
                            title: 1,
                            profile: 1,
                            "menu.path": 1,
                            "menu.title": 1,
                            "menu.type": 1,
                            "menu.icontype": 1,
                            "menu.collapse": 1,
                            "menu.access": 1,
                            "menu.status": 1,
                            "menu.children": 1,
                        }
                    }
                ]);
                res.json({
                    ok: true,
                    data: menuDB
                });

            } else if (profileDB.role.some((role) => role.name === 'CEI')) {
                const isCEI = profileDB.role.some((role) => role.name === 'CEI');

                const menuDB = await menuProfile.aggregate([{
                        $match: {
                            profile: 'CEI' // Filtra por el perfil 'Pakki'
                        }
                    },
                    {
                        $unwind: "$menu" // Descompone el array 'menu' en documentos separados
                    },
                    {
                        $match: {
                            "menu.status": true // Filtra los menús con status: true
                        }
                    },
                    {
                        $project: { // Proyecta los campos que deseas conservar
                            title: 1,
                            profile: 1,
                            "menu.path": 1,
                            "menu.title": 1,
                            "menu.type": 1,
                            "menu.icontype": 1,
                            "menu.collapse": 1,
                            "menu.access": 1,
                            "menu.status": 1,
                            "menu.children": 1,
                        }
                    }
                ]);
                res.json({
                    ok: true,
                    menu: menuDB
                });

            } else {}

            // Cargar los datos en una variable llamada "isPakki"

            // console.log(profileDB.name.include('Pakki'))

        } else {
            // El Collaborator No coincide con el Business
            return res.status(418).json({
                ok: false,
                msg: 'CLLMN-3'
            })
        }

    } catch (error) {
        applogger.error(`Error en LOMECL-4O2 > loadMenu: Error al Cargar Menu al Usuario uid: ${uid}, bus: ${bus}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LOMECL-4O2: ',
            error
        });
    }
}

const getViewOneMenu = async (req, res = response) => {
    // LEER EL TOKEN

    const uid = req.uid;
    
    const {
        profileUser,
        menuItem
    } = req.body   

    try {
        const menuDB = await menuProfile.findOne({
            profile: profileUser,
            "menu._id": menuItem,
        }, {
            "menu.$": 1
        });
    
        res.json({
            ok: true,
            data: menuDB
        });

    } catch (error) {
        applogger.error(`Error en LOMECL-4O2 > loadMenu: Error al Cargar Menu al Usuario uid: ${uid}, profileUser: ${profileUser}, menuItem: ${menuItem}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LOMECL-4O2: ',
            error
        });
    }
}

const AggregateOneMenuProfile = async (req, res = response) => {

    const uid = req.uid

    try {
        const {
            profileUser,
            menuItem,
            children
        } = req.body

        console.log('Datos Agregar Manu: ', profileUser,
            menuItem,
            children)

        // Consulta para buscar y actualizar el menú
        const menuProfileAdd = await menuProfile.findOneAndUpdate({
            profile: profileUser,
            "menu._id": menuItem
        }, {
            $push: {
                "menu.$.children": children
            }
        }, {
            new: true
        });

        console.log('menuProfileAdd: ', menuProfileAdd)

        res.status(200).json({
            ok: true,
            msg: menuProfileAdd
        });

    } catch (error) {
        applogger.error(`Error en LOMECL-4O3 > AggregateMenuProfile: Error al Agregar un Menu al perfil uid: ${uid}, titleFather: ${titleFather}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LOMECL-4O3: ',
            error
        });
    }
};


const AggregateMenuProfile = async (req, res = response) => {
    const {
        titleFather,
        path,
        title,
        type,
        icontype,
        collapse,
        access,
        children
    } = req.body;

    try {
        // Buscar el perfil de menú que coincida con el título del padre
        let menuProfileDB = await menuProfile.findOne({
            title: titleFather
        });

        if (!menuProfileDB) {
            return res.status(404).json({
                ok: false,
                msg: 'El perfil de menú padre no fue encontrado.'
            });
        }

        // Verificar si el menú ya existe en el perfil
        if (menuProfileDB.menu.some(menu => menu.title === title)) {
            return res.status(400).json({
                ok: false,
                msg: 'El menú ya existe en el perfil padre.'
            });
        }

        // Crear el nuevo menú
        const newItem = {
            path,
            title,
            type,
            icontype,
            collapse,
            access,
            children
        };

        // Agregar el nuevo menú al perfil de menú encontrado
        menuProfileDB.menu.push(newItem);

        // Guardar el perfil de menú actualizado en la base de datos
        await menuProfileDB.save();

        console.log('Nuevo menú agregado:', newItem);

        res.status(200).json({
            ok: true,
            msg: 'Nuevo menú agregado correctamente'
        });
    } catch (error) {
        console.error('Error al agregar nuevo menú:', error);
        applogger.error(`Error en LOMECL-4O3 > AggregateMenuProfile: Error al agregar un menú al perfil. Detalles: ${error}`);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al agregar un menú al perfil.'
        });
    }
};



const viewMenuProfile = async (req, res = response) => {  
    
    try {
        const { title } = req.body
        const MenuProfileDB = await menuProfile.find({ title: title})       
        
        res.status(200).json({
            ok: true,
            MenuProfileDB
        });
    } catch (error) {
        applogger.error(`Error en LOMECL-4O4 > viewMenuProfile: Error al Agregar un Menu al perfil uid: ${uid}, titleFather: ${titleFather}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LOMECL-4O4: ', error
        });
    }
};

const UpdateMenuForProfilePath = async (req, res = response) => {

    const { profileUser, menuID, childrenID, menuPath, childrenPath } = req.body
    try {
        
        const profileChildrenPathDB = await menuProfile.updateOne(
            {
                "profile": profileUser,
                "menu._id": menuID,
                "menu.children._id": childrenID
            },
            {
                $set: {
                    "menu.$[menuElem].path": menuPath,
                    "menu.$[menuElem].children.$[childElem].path": childrenPath
                }
            },
            {
                arrayFilters: [
                    { "menuElem._id": menuID },
                    { "childElem._id": childrenID }
                ]
            },{ new: true}
        )
    
        res.status(200).json({
            ok: true,
            profileChildrenPathDB
        });
        
    } catch (error) {
        applogger.error(`Error en LOMECL-4O5 > UpdateMenuForProfilePath: Error al Actualizar el Menu al perfil profileUser: ${profileUser}, menuID: ${menuID}, childrenID: ${childrenID}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LDMN-1.5: ', error
        });
    }

}

const DeleteMenuProfile = async (req, res = response) => {  
    
    const { title } = req.body
    try {
        const MenuProfileDB = await menuProfile.find({ title: title})       
        
        res.status(200).json({
            ok: true,
            MenuProfileDB
        });
    } catch (error) {
        applogger.error(`Error en LOMECL-4O5 > UpdateMenuForProfilePath: Error al Eliminar el Menu al perfil title: ${title}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'LM-03: viewMenuProfile'
        });
    }
};


module.exports = {
    loadMenu,
    viewMenuProfile,
    AggregateMenuProfile,
    DeleteMenuProfile,
    ViewMenuForProfile,
    UpdateMenuForProfilePath,
    getViewOneMenu,
    AggregateOneMenuProfile,
};
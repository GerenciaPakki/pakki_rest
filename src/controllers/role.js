const { response } = require('express');
const role = require('../models/role');
const { marcaDeTiempo } = require('../helpers/pakkiDateTime');
const { applogger } = require('../utils/logger');

const viewRoll = async (req, res = response) => { 

    const { name } = req.body;
    try {
        const existeRoll = await role.find({ name: name });

        res.json({
            ok: true,
            existeRoll
        });
    } catch (error) {
        applogger.error(`Error en ROLECL-4O1 > viewRoll: Error al Visualizar el Role, name: ${name}, error: ${error}`);
        
    }

    

};

const viewAllRol = async (req, res = response) => { 

    try {
        const existeRoll = await role.find(
        {},
        {name: 1,destination:1, _id:1}
    );

    res.json({
        ok: true,
        existeRoll
    });
    } catch (error) {
        applogger.error(`Error en ROLECL-4O2 > viewAllRol: Error al Realizar el Role, uid: , error: ${error}`);
        
    }

    
    

};

const createRoll = async (req, res = response) => {
    
    const uid = req.uid;
    const { name, destination } = req.body;
    try {
    
        const data = new role({
            name: name,
            destination: destination,
            creatorUser: uid,
            dateCreate: marcaDeTiempo
        });
        const existeRoll = await role.find({ name: name });
        if (!existeRoll) {
            // El role ya esta Registrado
            return res.status(418).json({
                ok: false,
                msg: 'CLLCOLL-1'
            });
        }
        await data.save();

        res.json({
            ok: true,
            msg: 'role Ingresado Correctamente'
        });
    } catch (error) {
        applogger.error(`Error en ROLECL-4O2 > createRoll: Error al Crear el Role, uid: ${uid}, name: ${name} , error: ${error}`);
        // ERROR AL GUARDAR EL REGISTRO NUEVO
        res.status(418).json({
            ok: false,
            msg: 'CLLCOLL-2'
        });
    }
};

const updateRoll = async (req, res = response) => { 

    const uid = req.uid;
    const { idRole, name, destination, observation } = req.body;
    try {
        const existeRoll = await role.findOne({ _id: idRole });  
        
        if (!existeRoll) {
            // No existe el Role
            res.status(418).json({
                ok: false,
                msg: 'CLLCOLL-3'
            });            
        }

        const roleDB = {
            name: name,
            destination: destination,
            update: [{
                user: uid ,
                dateUpdate: marcaDeTiempo ,
                observation: observation ,
            }]
        }

        const updateRoleDB = await role.findByIdAndUpdate(idRole,roleDB)

        res.json({
            ok: true,
            msg: 'The data was updated successfully'
        });

    } catch (error) {
        applogger.error(`Error en ROLECL-4O3 > updateRoll: Error al Actualizar el Role, uid: ${uid}, name: ${name} , error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'ROLECL-4O3'
        });
    }
    };

const deleteRoll = async (req, res = response) => { 

    const { name } = req.body;
    try {
        const existeRoll = await role.findOne({ name: name });
    
        res.json({
            ok: true,
            existeRoll
        });
        
    } catch (error) {
        applogger.error(`Error en ROLECL-4O4 > deleteRoll: Error al Eliminar el Role, name: ${name} , error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'ROLECL-4O4'
        });
    }


};

module.exports = {
    createRoll,
    viewRoll,
    updateRoll,
    deleteRoll,
    viewAllRol,
};
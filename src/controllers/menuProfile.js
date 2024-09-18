const { response } = require('express');
const menuProfile = require('../models/menuProfile');
const { applogger } = require('../utils/logger');


const viewMenu = async (req, res = response) => {    

    res.json({
        ok: true,
        existeRoll
    });

};

const createMenu = async (req, res = response) => { 
    
    const { title, profile, menu } = req.body;
    try {
        const existingMenu = await menuProfile.findOne({ title });
        
        if (existingMenu) {
            return res.status(418).json({
                ok: false,
                msg: 'CLLMP-1: existingMenu'
            });
        }

        const menuProfileDB = new menuProfile({
            title,
            profile,
            menu: menu
        });

        // console.log(menuProfileDB)

        const createdMenu = await menuProfileDB.save();

        res.json({
            ok: true,
            msg: 'Se creo correctamente el Menu'
        });
    } catch (error) {
        applogger.error(`Error en CREMNCL-4O1 > createMenu: Error al Crear el Menu al title: ${title}, profile: ${profile}, menu: ${menu}, error: ${error}`);
        res.status(418).json({
            ok: false,
            msg: 'CREMNCL-4O1: ', error
        });
    }
};



const updateMenu = async (req, res = response) => {    

    res.json({
        ok: true,
        updateRoll
    });

};
const deleteMenu = async (req, res = response) => {    

    res.json({
        ok: true,
        deleteRoll
    });

};


module.exports = {
    viewMenu,
    createMenu,
    updateMenu,
    deleteMenu,
};
const mongoose = require("mongoose");
const dotenv = require('dotenv');
// mongoose.connect('mongodb://localhost');

const env = require('../utils/config');

const mongoURL = env.MONGO_URL;
const user = env.USERDB;
const pwd = env.PWDDB;

const dbConn = async() => {
   
    try {
        // const uri = "mongodb+srv://dev_pakki:T3cn0l0g14*@atlascluster.3v6nhtw.mongodb.net/devpakkiDB";
        const uri = `${mongoURL}`;
        // process.env.DB_CNN
        mongoose.set("strictQuery", false);

        // Agregar las opciones de autenticación con el usuario y contraseña
        const options = {
        auth: {
            user: `${user}`,
            password: `${pwd}`
        }
        };
    
        await mongoose.connect(uri);
        // console.log('Connection DB');
        
    } catch (error) {
        console.log(error);
        throw new Error('error connecting to database');
        
    }

};

module.exports = {
    dbConn
};
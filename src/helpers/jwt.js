 const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');



 const generarJWT = (uid,bus) => {

     return new Promise((resolve, reject) => {

         const payload = {
             uid,
             bus
         }

         jwt.sign(payload, JWT_SECRET, {
             expiresIn: '30d'
         }, (err, token) => {
             if (err) {
                 console.log(err);
                 reject('No se puede Generar el JWT');
             } else {
                 resolve(token);
             }
         });
     });
};
 
const validateTokenUsers = (token) => { 
    return new Promise((resolve) => { 
        // Validamos el token contra el Paikki-Rest
        const { uid, bus } = jwt.verify(token, JWT_SECRET);
    
        userTkn = { uid: uid, bus: bus }
    
        resolve(userTkn)
    })    
};


 module.exports = {
     generarJWT,
     validateTokenUsers,
 };
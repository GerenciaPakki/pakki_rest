

const businessUsers = require('../models/businessUsers');
const profile = require('../models/profile');


async function RoleProfile(uid) { 
    const profileUserDB = await businessUsers.findById(uid, { profile: 1, business: 1 })
        .where("status").equals(true)
    
    const profileId = profileUserDB.profile;    
    const profileBusiness = profileUserDB.business;    

    // Realiza la consulta para obtener el perfil y sus roles
    const profileDB = await profile.findById(profileId,{role:1, name: 1, _id:0})
        .populate('role', 'name destination -_id')

    // Verifica si el destination de al menos uno de los roles coincide con el perfil
    const roleDestinations = profileDB.role.map((role) => role.name);
    return responseRole = {
        roleDestinations,
        profileBusiness
    }
}



module.exports = {
    RoleProfile,
};
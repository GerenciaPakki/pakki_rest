const { Router } = require('express')
const router = Router();


const newLocal = 'Estamos Dentro de la Funcion';
router.get('/' , (req , res)=>{
    res.send(newLocal);
})


module.exports = router;
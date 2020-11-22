const {check, body} = require('express-validator');
const regExPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

module.exports = [
    check('password')
        .custom(function(value) {
            return regExPass.test(value)
        })
        .withMessage('La contraseña debe tener: al menos 6 caracteres, una mayúscula, una minúscula y un número'),

    body('passwordRepeat')
        .custom(function(value,{req}){
            if(value != req.body.password){
                return false
            }
            return true
        })
        .withMessage('Las contraseñas no coinciden'),
]
const {check, body} = require('express-validator');
const db = require('../database/models');

module.exports = [
    check('first_name')
        .isLength({min:1})
        .withMessage('Debes ingresar un nombre'),
    
    check('last_name')
        .isLength({min:1})
        .withMessage('Debes ingresar un apellido'),

    check('email')
        .isEmail()
        .withMessage('Debes ingresar un email válido'),
    
    body('email')
        .custom(function(value){
            return db.Users.findOne({
                where:{
                    email:value
                }
            })
            .then(user => {
                if(user){
                    return Promise.reject('Este email ya está registrado')
                }
            })
        }),

    check('password')
        .isLength({min:6, max:100})
        .withMessage('La contraseña debe tener al menos 6 caracteres'),

    body('passwordRepeat')
        .custom(function(value,{req}){
            if(value != req.body.password){
                return false
            }
            return true
        })
        .withMessage('Las contraseñas no coinciden'),
]
const {check, body} = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../database/models')

module.exports = [
    check('email')
        .isEmail()
        .withMessage('Debes ingresar un email válido'),
    
    check('password')
        .isLength({min:1})
        .withMessage('Debes ingresar una contraseña'),

    body('password')
        .custom((value, {req})=> {
            return db.Users.findOne({
                where:{
                    email: req.body.email
                }
            })
            .then(user => {
                if(!bcrypt.compareSync(value, user.dataValues.password)){
                    return Promise.reject()
                }
            })
            .catch((err) => {
                return Promise.reject("Email o contraseña incorrectos")
            })
        })
]
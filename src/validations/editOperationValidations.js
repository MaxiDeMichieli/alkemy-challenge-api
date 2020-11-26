const {check, body} = require('express-validator');
const regExNumber = /^[0-9]$/

module.exports = [
    check('concept')
        .isLength({min:1, max:100})
        .withMessage('El concepto debe tener entre 1 y 100 caracteres.'),

    check('amount')
        .isLength({min:1})
        .withMessage('El monto es obligatorio.'),
    
    check('amount')
        .custom(value => {
            let split = value.split('');
            let result = true;
            split.forEach(e => {
                if(!regExNumber.test(e)) {
                    result = false;
                }
            })
            return result
        })
        .withMessage('El monto solo puede contener números.'),

    check('amount')
        .isLength({max:11})
        .withMessage('El monto es demasiado grande.'),

    check('date')
        .isLength({min:1})
        .withMessage('La fecha es obligatoria.')
]
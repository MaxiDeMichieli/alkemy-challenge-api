const db = require('../database/models');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const process = require('process')
const nodemailerTransporter = require('../functions/nodemailerTransporter');

const usersController = {
    signup: (req, res) => {
        const {first_name, last_name, email, password} = req.body;
        let errors = validationResult(req);
        if(errors.isEmpty()){
            const token = jwt.sign({first_name, last_name, email, password}, process.env.JWT_ACC_ACTIVATE, {expiresIn: '20m'});

            let mailOptions = {
                from: `ALK <${process.env.MAIL_USER}>`,
                to: email,
                subject: 'Activa tu cuenta de alk',
                html: `
                    <h1>Activa tu cuenta</h1>
                    <p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>
                `
            }
            nodemailerTransporter.sendMail(mailOptions, (err, data) => {
                if(err){
                    res.status(400).json(err)
                }else{
                    let response = {
                        status: 200,
                        message: 'Email sent, verify your account'
                    }
                    res.status(200).json(response)
                }
            });
        }else{
            let response = {
                status: 400,
                errors: errors.mapped(),
                oldData: req.body
            }
            res.status(400).json(response);
        }
    },
    activateAccount: (req, res) => {
        const {token} = req.body;
        if(token) {
            jwt.verify(token, process.env.JWT_ACC_ACTIVATE, (err, decodedToken) => {
                if(err) {
                    return res.status(400).json({error: 'Incorrect or expired link'})
                }
                const {first_name, last_name, email, password} = decodedToken;
                db.Users.findOrCreate({
                    where: {
                        email: email,
                        social_id: null
                    },
                    defaults: {
                        first_name: first_name.trim(),
                        last_name: last_name.trim(),
                        email: email.trim(),
                        password: bcrypt.hashSync(password, 12),
                    }
                })
                .then((user) => {
                    let userActivate = {
                        status: 200,
                        message: 'Account activated successfully',
                        user: {first_name, last_name, email}
                    }
                    if(user[1]) {
                        return res.status(200).json(userActivate)
                    } else {
                        userActivate.message = 'This account had already been activated';
                        userActivate.status = 400;
                        return res.status(400).json(userActivate)
                    }
                })
                .catch((err) => {
                    return res.status(200).json({status: 200, message: 'Error activating account', error: err})
                })

            })
        } else {
            return res.json({error: 'Something went wrong!!'})
        }
    }
}

module.exports = usersController;
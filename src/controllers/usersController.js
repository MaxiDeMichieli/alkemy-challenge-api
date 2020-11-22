const db = require('../database/models');
const {Op} = require("sequelize");
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const process = require('process');
const nodemailerTransporter = require('../functions/nodemailerTransporter');

const usersController = {
    signUp: (req, res) => {
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
                        password: bcrypt.hashSync(password, 12)
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
    },
    forgotPassword: (req, res) => {
        const {email} = req.body;

        db.Users.findOne({
            where: {
                email: email
            }
        })
        .then(user => {
            if(user == null) {
                return res.status(400).json({status: 400, message: 'User with this email does not exists'});
            }
            const token = jwt.sign({id: user.id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'});
            let mailOptions = {
                from: `ALK <${process.env.MAIL_USER}>`,
                to: email,
                subject: 'Recupera tu cuenta de alk',
                html: `
                    <h1>Haz click en el boton para recuperar tu contraseña</h1>
                    <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
                `
            }
            db.Users.update({
                reset_link: token
            }, {
                where: {
                    id: user.id
                }
            })
            .then(() => {
                nodemailerTransporter.sendMail(mailOptions, (err, data) => {
                    if(err){
                        return res.status(400).json({message: err})
                    }
                    let response = {
                        status: 200,
                        message: 'Email sent, follow the instructions'
                    }
                    return res.status(200).json(response)
                });
            })
            .catch(err => {
                res.status(400).json({message: err})
            })
        })
    },
    resetPasswordTokenCheck: (req, res) => {
        const {resetLink} = req.body;
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, decodedData) => {
            if(err) {
                return res.status(401).json({status: 401, error: 'Incorrect token or it is expired.'})
            }
            return res.status(200).json({status: 200, message: 'Valid token.'})
        })
    },
    resetPassword: (req, res) => {
        const {resetLink, password} = req.body;
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            let response = {
                status: 400,
                errors: errors.mapped(),
                oldData: req.body
            }
            return res.status(400).json(response);
        }

        if(resetLink) {
            jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, decodedData) => {
                if(err) {
                    return res.status(401).json({status: 401, error: 'Incorrect token or it is expired.'})
                }
                db.Users.findOne({
                    where: {
                        reset_link: resetLink
                    }
                })
                .then(user => {
                    if(user == null) {
                        return res.status(400).json({status: 400, error: 'User with this token does not exist'})
                    }
                    db.Users.update({
                        reset_link: null,
                        password: bcrypt.hashSync(password, 12)
                    }, {
                        where: {
                            id: user.id
                        }
                    })
                    .then(user => {
                        return res.status(200).json({status: 200, message: 'Your password has been updated'})
                    })
                    .catch(err => {
                        return res.status(400).json({status: 400, error: 'Reset password error'})
                    })
                })
                .catch(err => {
                    res.status(400).json({status: 400, error: err})
                })
            })
        } else {
            return res.status(401).json({status: 401, error: 'Authentication error.'})
        }
    },
    logIn: (req, res) => {
        let errors = validationResult(req);
        const {email} = req.body;

        if(errors.isEmpty()) {
            db.Users.findOne({
                where: {
                    email: email,
                    password: {[Op.not]: null}
                }
            })
            .then(user => {
                if(user == null) {
                    return res.status(400).json({status: 400, error: 'User not found'});
                }
                const {id, first_name, last_name, email, password} = user;
                const token = jwt.sign({id, first_name, last_name, email, password}, process.env.USER_TOKEN_KEY, {expiresIn: '14d'});
                return res.status(200).json({status: 200, token: token});
            })
            .catch(err => {
                return res.status(400).json({error: err});
            })
        } else {
            let response = {
                status: 400,
                errors: errors.mapped(),
                oldData: req.body
            }
            res.status(400).json(response);
        }
    }
}

module.exports = usersController;
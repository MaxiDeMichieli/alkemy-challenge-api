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
            const token = jwt.sign({first_name, last_name, email, password: bcrypt.hashSync(password, 12)}, process.env.JWT_ACC_ACTIVATE, {expiresIn: '20m'});

            let mailOptions = {
                from: `ALK <${process.env.MAIL_USER}>`,
                to: email,
                subject: 'Activa tu cuenta de alk',
                html: `<div class="body" style="width: 80%;max-width:700px;heigth: 100%;padding: 30px;margin: 0 auto;background-color: #222831;border-radius: 10px;"><h2 style="color:#fff;">Hola ${first_name}!</h2><h3 style="text-align: center;color:#fff;">Activa tu cuenta haciendo click en el siguiente boton:</h3><div class="boton" style="display: flex;flex-wrap: wrap;align-content: center;"><a href="${process.env.CLIENT_URL}/authentication/activate/${token}" style="display: inline-block;margin: 0 auto;margin-top: 10px;padding: 8px 15px;background-color: #F05454;text-decoration: none;color: #fff;border: 2px solid #F05454;border-radius: 10px;box-shadow: 1px 1px 4px 0px #000;font-weight: 600">Activa tu cuenta</a></div></div>`
            }
            nodemailerTransporter.sendMail(mailOptions, (err, data) => {
                if(err){
                    res.status(400).json({error: 'Error sending email'})
                }else{
                    let response = {
                        error: null,
                        message: 'Email sent, verify your account'
                    }
                    res.status(200).json(response)
                }
            });
        }else{
            let response = {
                error: 'Validations errors',
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
                        password: password
                    }
                })
                .then((user) => {
                    let userActivate = {
                        error: null,
                        message: 'Account activated successfully',
                        user: {first_name, last_name, email}
                    }
                    if(user[1]) {
                        return res.status(200).json(userActivate)
                    } else {
                        userActivate.message = 'This account had already been activated';
                        userActivate.error = 'This account had already been activated';
                        return res.status(400).json(userActivate)
                    }
                })
                .catch((err) => {
                    return res.status(500).json({error: 'Server error', message: 'Error activating account'})
                })

            })
        } else {
            return res.json({error: 'Something went wrong'})
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
                return res.status(400).json({error: 'User with this email does not exists'});
            }
            const token = jwt.sign({id: user.id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'});
            let mailOptions = {
                from: `ALK <${process.env.MAIL_USER}>`,
                to: email,
                subject: 'Recupera tu cuenta de alk',
                html: `<div class="body" style="width: 80%;max-width:700px;heigth: 100%;padding: 30px;margin: 0 auto;background-color: #222831;border-radius: 10px;"><h2 style="color:#fff;">Hola ${first_name}!</h2><h3 style="text-align: center;color:#fff;">Cambia tu contraseña haciendo click en el siguiente boton:</h3><div class="boton" style="display: flex;flex-wrap: wrap;align-content: center;"><a href="${process.env.CLIENT_URL}/resetpassword/${token}" style="display: inline-block;margin: 0 auto;margin-top: 10px;padding: 8px 15px;background-color: #F05454;text-decoration: none;color: #fff;border: 2px solid #F05454;border-radius: 10px;box-shadow: 1px 1px 4px 0px #000;font-weight: 600">Cambiar contraseña</a></div></div>`
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
                        return res.status(400).json({error: 'Error sending email'})
                    }
                    let response = {
                        error: null,
                        message: 'Email sent, follow the instructions'
                    }
                    return res.status(200).json(response)
                });
            })
            .catch(err => {
                res.status(500).json({error: 'Server error'})
            })
        })
    },
    resetPasswordCheckToken: (req, res) => {
        const {resetLink} = req.body;
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, decodedData) => {
            if(err) {
                return res.status(401).json({error: 'Incorrect token or it is expired.'})
            }
            return res.status(200).json({error: null, message: 'Valid token.'})
        })
    },
    resetPassword: (req, res) => {
        const {resetLink, password} = req.body;
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            let response = {
                error: 'Validations errors',
                errors: errors.mapped(),
                oldData: req.body
            }
            return res.status(400).json(response);
        }

        if(resetLink) {
            jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, decodedData) => {
                if(err) {
                    return res.status(401).json({error: 'Incorrect token or it is expired.'})
                }
                db.Users.findOne({
                    where: {
                        reset_link: resetLink
                    }
                })
                .then(user => {
                    if(user == null) {
                        return res.status(400).json({error: 'User with this token does not exist'})
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
                        return res.status(200).json({error: null, message: 'Your password has been updated'})
                    })
                    .catch(err => {
                        return res.status(500).json({error: 'Server error'})
                    })
                })
                .catch(err => {
                    res.status(500).json({error: 'Server error'})
                })
            })
        } else {
            return res.status(401).json({error: 'Authentication error.'})
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
                    return res.status(400).json({error: 'User not found'});
                }
                const {id, first_name, last_name, email, password, social_id} = user;
                const token = jwt.sign({id, first_name, last_name, email, password, social_id}, process.env.USER_TOKEN_KEY, {expiresIn: '14d'});
                return res.status(200).json({error: null, token: token});
            })
            .catch(err => {
                return res.status(500).json({error: 'Server error'});
            })
        } else {
            let response = {
                status: 400,
                error: 'Validations errors',
                errors: errors.mapped(),
                oldData: req.body
            }
            res.status(400).json(response);
        }
    },
    checkToken: (req, res) => {
        if(!req.headers.authorization) {
            return res.status(401).json({status: 401, error: "You don't have authorization"})
        }
        
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.USER_TOKEN_KEY, (err, decodedToken) => {
            if(err) {
                return res.status(401).json({error: "Invalid or expired token. You don't have authorization"})
            }
            const{id, first_name, last_name, email, password, social_id} = decodedToken;
            db.Users.findOne({
                where: {
                    id: id,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: password,
                    social_id: social_id
                }
            })
            .then((user) => {
                if(user == null) {
                    return res.status(401).json({error: 'Incorrect or expired token'});
                }
                return res.status(200).json({error: null, message: 'Valid token.', token: token});
            })
            .catch((err) => {
                return res.status(500).json({error: 'Server error'})
            })
        })
    },
    deleteUser: (req, res) => {
        const {id} = req.user;

        let deleteOperations = db.Operations.destroy({
            where:{
            user_id: id
        }})
        let deleteUser = db.Users.destroy({
            where: {
                id: id
            }
        })
        Promise.all([deleteOperations, deleteUser]) 
        .then(result => {
            if(result[1] == 0) {
                return res.status(400).json({error: 'No user found to delete'})
            } else {
                return res.status(200).json({error: null, message: 'User removed successfully.'})
            }
        })
        .catch(err => {
            return res.status(500).json({error: 'Server error'})
        })
    }
}

module.exports = usersController;
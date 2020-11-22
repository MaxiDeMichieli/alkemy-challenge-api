const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const signUpValidations = require('../validations/signUpValidations');
const logInValidations = require('../validations/logInValidations');
const resetPasswordValidations = require('../validations/resetPasswordValidations');

/* SIGNUP */
router.post('/signup', signUpValidations, usersController.signUp);
router.post('/email-activate', usersController.activateAccount);

/* LOGIN */
router.post('/login', logInValidations, usersController.logIn);

/* RESET PASS */
router.patch('/forgot-password', usersController.forgotPassword);
router.patch('/reset-password', resetPasswordValidations, usersController.resetPassword);
router.post('/reset-password/token-check', usersController.resetPasswordTokenCheck);

module.exports = router;
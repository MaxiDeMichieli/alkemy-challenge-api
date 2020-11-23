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

/* CHECK TOKEN */
router.post('/check-token', usersController.checkToken);

/* RESET PASS */
router.patch('/forgot-password', usersController.forgotPassword);
router.patch('/reset-password', resetPasswordValidations, usersController.resetPassword);
router.post('/reset-password/check-token', usersController.resetPasswordCheckToken);

module.exports = router;
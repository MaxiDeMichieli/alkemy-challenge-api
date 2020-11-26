const express = require('express');
const router = express.Router();
const {signUp, activateAccount, logIn, checkToken, forgotPassword, resetPassword, resetPasswordCheckToken} = require('../controllers/usersController');
const signUpValidations = require('../validations/signUpValidations');
const logInValidations = require('../validations/logInValidations');
const resetPasswordValidations = require('../validations/resetPasswordValidations');

/* SIGNUP */
router.post('/signup', signUpValidations, signUp);
router.post('/email-activate', activateAccount);

/* LOGIN */
router.post('/login', logInValidations, logIn);

/* CHECK TOKEN */
router.post('/check-token', checkToken);

/* RESET PASS */
router.patch('/forgot-password', forgotPassword);
router.patch('/reset-password', resetPasswordValidations, resetPassword);
router.post('/reset-password/check-token', resetPasswordCheckToken);

module.exports = router;
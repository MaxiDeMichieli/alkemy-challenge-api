const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const signupValidations = require('../validations/signupValidations');
const resetPasswordValidations = require('../validations/resetPasswordValidations');

/* SIGNUP */
router.post('/signup', signupValidations, usersController.signup);
router.post('/email-activate', usersController.activateAccount);

/* RESET PASS */
router.patch('/forgot-password', usersController.forgotPassword);
router.patch('/reset-password', resetPasswordValidations, usersController.resetPassword);
router.post('/reset-password/token-check', usersController.resetPasswordTokenCheck)

module.exports = router;
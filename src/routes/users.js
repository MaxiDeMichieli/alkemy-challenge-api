const express = require('express');
const router = express.Router();
const {signUp, activateAccount, logIn, checkToken, forgotPassword, resetPassword, resetPasswordCheckToken, deleteUser} = require('../controllers/usersController');
const {isAuth} = require('../middleware/auth');
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

/* DELETE USER */
router.delete('/delete', isAuth, deleteUser);


module.exports = router;